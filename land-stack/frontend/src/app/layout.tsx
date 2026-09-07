import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { OfficerAuthProvider } from "@/context/OfficerAuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "LAND STACK – Integrated GIS-based DPI for Land Governance",
  description: "Enterprise Digital Public Infrastructure for Land Governance and Cadastral GIS Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <OfficerAuthProvider>
          <Navbar />
          <main className="flex-1 bg-slate-50">{children}</main>
        </OfficerAuthProvider>
      </body>
    </html>
  );
}
