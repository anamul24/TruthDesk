import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";

// Simple connection like tiles-gallery (no complex TLS options needed)
const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("truth-desk");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  plugins: [
    admin({
      // New users created via admin plugin default to 'journalist'
      defaultRole: "journalist",
    }),
  ],

  user: {
    additionalFields: {
      bio: {
        type: "string",
        defaultValue: "",
        input: false,
      },
      designation: {
        type: "string",
        defaultValue: "",
        input: false,
      },
      department: {
        type: "string",
        defaultValue: "",
        input: false,
      },
    },
  },

  // Ensure every new signup always gets 'journalist' as the default role
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: user.role || "journalist",
            },
          };
        },
      },
    },
  },
});
