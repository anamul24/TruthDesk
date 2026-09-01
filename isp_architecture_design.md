# Complete ISP Management and Billing Architecture

This document outlines the enterprise-grade architecture for your automated ISP Management and Billing system using the MERN stack, Redis, BullMQ, and MikroTik integration.

## 1. Frontend Architecture (The 3 Portals)

We will use a **Monorepo** approach (using [Turborepo](https://turbo.build/) or [Nx](https://nx.dev/)) to manage the three distinct frontend portals and the backend API. This allows code sharing (UI components, API clients, TypeScript types) while keeping deployments separate and optimized.

### A. Public Landing Page (Next.js - App Router)
*   **Purpose:** Lead generation, SEO, marketing.
*   **Key Features:** 
    *   Server-Side Rendering (SSR) for blazing-fast SEO performance.
    *   Coverage map integration using `@react-google-maps/api`.
    *   New connection request forms that feed directly into the CRM.

### B. Customer Self-Service Portal (React SPA or Next.js)
*   **Purpose:** Client retention and self-management.
*   **Key Features:**
    *   Dashboard showing live bandwidth (fetched via websockets/polling from backend).
    *   Invoicing and Payment Gateway Integration (bKash/Nagad/Cards).
    *   Support ticketing system.

### C. Admin & Reseller Dashboard (React SPA - Vite)
*   **Purpose:** Network operations, finance, and user management.
*   **Key Features:**
    *   **RBAC:** Super Admin (full access), Accounts (billing only), Technicians (diagnostics only).
    *   Financial analytics, MRR (Monthly Recurring Revenue) charts.
    *   Live OLT/ONU signal monitoring and MikroTik router status.

### Recommended Monorepo Folder Structure

```text
isp-workspace/
├── apps/
│   ├── public-website/      # Next.js (Landing Page)
│   ├── customer-portal/     # React/Vite (Customer Dashboard)
│   ├── admin-dashboard/     # React/Vite (Admin/Reseller panel)
│   └── backend-api/         # Node.js/Express (Core API & Services)
├── packages/
│   ├── ui/                  # Shared Tailwind CSS React components (Buttons, Modals)
│   ├── database/            # Shared Mongoose Schemas & DB connection
│   └── types/               # Shared TypeScript definitions
└── package.json             # Root workspace configuration
```

---

## 2. Backend & Microservices Architecture

The backend will be a robust Node.js/Express.js application. While it can start as a modular monolith for simplicity, the folder structure is designed to easily split into microservices later.

*   **Auth Service:** Handles JWT issuance, password hashing (bcrypt), and Role-Based Access Control (RBAC) middleware.
*   **Billing Engine:** Listens to payment gateway webhooks, generates recurring invoices at the start of billing cycles, and flags overdue accounts.
*   **CRM & Ticket Service:** Manages leads, support tickets, and technician dispatch assignments.
*   **Router Sync Service:** The critical bridge. Keeps the local MongoDB state in sync with the MikroTik PPPoE secrets and active connections.

---

## 3. Background Workers & Queue System

We utilize **BullMQ** (backed by Redis) to ensure the main Express event loop is never blocked by heavy operations.

*   **Daily Cron Job (Scanner):** Runs at 12:01 AM daily. Scans the database for users whose `expiryDate` has passed.
*   **MikroTik Queue:** When the scanner finds expired users, it pushes "disable_user" jobs to a specific BullMQ queue. A dedicated worker processes these jobs securely, limiting concurrent connections to the router to prevent overwhelming the MikroTik API.
*   **Notification Service:** A worker listens for "invoice_generated" or "payment_received" events and triggers SMS/Email API calls.

---

## 4. Core Database Schemas (Mongoose)

These are the foundational schemas required for the engine.

### `User.js` (Subscriber)
```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // PPPoE username
  password: { type: String, required: true }, // Encrypted for web auth, plain/decryptable for PPPoE sync (or handled via RADIUS)
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'tech', 'reseller'], default: 'customer' },
  
  // ISP Specifics
  routerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Router' }, // Which MikroTik they belong to
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  status: { type: String, enum: ['active', 'expired', 'suspended', 'lead'], default: 'active' },
  ipAddress: { type: String }, // Static IP if assigned
  macAddress: { type: String },
  
  // Billing
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  expiryDate: { type: Date, required: true },
  balance: { type: Number, default: 0 },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
```

### `Package.js` (Internet Plan)
```javascript
import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Gamer Pro 50Mbps"
  mikrotikProfile: { type: String, required: true }, // The exact profile name in MikroTik (e.g., "50M_Profile")
  downloadSpeed: { type: Number, required: true }, // in Mbps
  uploadSpeed: { type: Number, required: true }, // in Mbps
  price: { type: Number, required: true },
  isAvailableForPublic: { type: Boolean, default: true } // Show on public landing page?
}, { timestamps: true });

export const Package = mongoose.model('Package', packageSchema);
```

### `Invoice.js`
```javascript
import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['unpaid', 'paid', 'cancelled'], default: 'unpaid' },
  billingPeriodStart: { type: Date, required: true },
  billingPeriodEnd: { type: Date, required: true },
  paymentMethod: { type: String }, // 'bkash', 'nagad', 'cash'
  transactionId: { type: String }, // From payment gateway
  paidAt: { type: Date }
}, { timestamps: true });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
```

---

## 5. Hardware Integration Logic (MikroTik Automation)

The backend connects to MikroTik routers using the API over port 8728 (or 8729 for TLS). 
Here is a critical worker logic snippet using `node-routeros` and `bullmq` that automatically disables an expired user.

### `mikrotikWorker.js`
```javascript
import { Worker } from 'bullmq';
import { RouterOSAPI } from 'node-routeros';
import { User } from '../models/User.js';
import Redis from 'ioredis';

const redisConnection = new Redis(process.env.REDIS_URL);

// Secure connection function
async function connectToRouter(host, user, password) {
    const api = new RouterOSAPI({
        host: host,
        user: user,
        password: password,
        port: 8728, // Use 8729 for secure TLS connection in production
        timeout: 5000
    });
    
    await api.connect();
    return api;
}

// The Worker that listens for expiry events
const expiryWorker = new Worker('mikrotik-tasks', async (job) => {
    const { userId, action } = job.data;
    
    if (action === 'disable_expired_user') {
        const user = await User.findById(userId).populate('routerId');
        if (!user || !user.routerId) throw new Error('User or Router not found');

        let api;
        try {
            api = await connectToRouter(
                user.routerId.ip, 
                user.routerId.apiUser, 
                user.routerId.apiPassword
            );

            // 1. Find the user in PPPoE secrets
            const secretList = await api.write('/ppp/secret/print', [
                `?name=${user.username}`
            ]);

            if (secretList.length === 0) {
                console.log(`User ${user.username} not found on router.`);
                return;
            }

            const secretId = secretList[0]['.id'];

            // 2. Disable the user in secrets
            await api.write('/ppp/secret/set', [
                `=.id=${secretId}`,
                '=disabled=yes'
            ]);

            // 3. Kick active connection so they disconnect immediately
            const activeConnections = await api.write('/ppp/active/print', [
                `?name=${user.username}`
            ]);

            if (activeConnections.length > 0) {
                await api.write('/ppp/active/remove', [
                    `=.id=${activeConnections[0]['.id']}`
                ]);
            }

            // 4. Update DB status
            user.status = 'expired';
            await user.save();

            console.log(`Successfully disabled and kicked user: ${user.username}`);

        } catch (error) {
            console.error(`Failed to process MikroTik command for ${user.username}:`, error);
            throw error; // Let BullMQ handle retries
        } finally {
            if (api) api.close(); // ALWAYS close the connection
        }
    }
}, { connection: redisConnection });

expiryWorker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
});
```

## User Review Required
> [!IMPORTANT]
> Please review this architecture. Let me know if you would like me to:
> 1. Initialize the monorepo structure (using Turborepo) on your machine.
> 2. Scaffold the Express/Mongoose backend with these schemas.
> 3. Dive deeper into the BullMQ setup or the Frontend React configuration.

## Open Questions
- Do you plan to deploy the Microservices in Docker containers (recommended) or bare-metal servers?
- Will you be using FreeRADIUS as an intermediary, or managing PPPoE secrets directly on the MikroTik routers via the API as shown above? (Direct API is simpler for smaller scales, RADIUS is better for large, multi-router setups).
- Should I start writing the initialization scripts for the workspace?
