import type { Metadata } from "next";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import { OfficerAuthProvider } from "@/context/OfficerAuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tamil Nadu Land Stack | Integrated Geospatial DPI for Land Governance",
  description: "Government of Tamil Nadu Enterprise Digital Public Infrastructure for Cadastral GIS, ULPIN Land Registry & Statutory Officer Clearances",
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
      <body className="bg-[#F7F9FC] text-[#14213D] min-h-screen flex flex-col antialiased font-sans">
        <OfficerAuthProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </OfficerAuthProvider>
      </body>
    </html>
  );
}
