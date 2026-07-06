import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { Montserrat, Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "TruthDesk",
  description: "Best news portal in Bangladesh",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" className={`h-full antialiased`}>
      <body className={`${poppins.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
