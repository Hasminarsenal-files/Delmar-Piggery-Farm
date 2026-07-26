import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Savorlicious Food Services | Premium Livestock & Catering",
  description: "Manage stock, reservation tracking, and orders for piglets, fattening pigs, and crispylicious lechon catering at Savorlicious Food Services.",
  keywords: ["Savorlicious Food Services", "Piggery Management", "Piglets", "Fattening Pigs", "Lechon Catering", "Fresh Pork Meat"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fbfbf9] text-[#1e2521]">
        <RoleProvider>
          {children}
        </RoleProvider>
      </body>
    </html>
  );
}

