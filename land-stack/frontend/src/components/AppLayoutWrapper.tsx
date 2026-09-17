"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { officer } = useOfficerAuth();
  
  const isMapPage = pathname === "/map" || pathname === "/gis";

  // Show sidebar on all officer portal routes and when officer is in workspace
  const showSidebar = 
    pathname === "/" ||
    (pathname.startsWith("/officer") && pathname !== "/officer/login") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/cases") ||
    pathname === "/gis" ||
    ((pathname === "/registry" || pathname === "/analytics" || pathname === "/map" || pathname === "/integration" || pathname === "/satellite" || pathname === "/reports" || pathname === "/audit" || pathname === "/users") && Boolean(officer));

  // Sidebar open/close state:
  // When map is opened (/map or /gis), sidebar should be CLOSED so the map has full screen width.
  // On other officer pages, default to open on desktop (>= 768px).
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Automatically close sidebar when map is opened; open on desktop when on other officer pages
  useEffect(() => {
    if (isMapPage) {
      setSidebarOpen(false);
    } else if (showSidebar) {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    } else {
      setSidebarOpen(false);
    }
  }, [pathname, showSidebar]);

  // Dispatch window resize event when sidebar toggles so Leaflet map smoothly recalculates and aligns bounds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("resize"));
      }
    }, 310);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  // Determine whether desktop left padding is applied:
  // ONLY if sidebar is currently open AND not on the map page
  // (On map page, opening sidebar opens as overlay drawer so the map remains 100% full width and aligned)
  const applyDesktopPadding = showSidebar && sidebarOpen && !isMapPage;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] overflow-x-hidden">
      {showSidebar && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}
      <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${applyDesktopPadding ? "md:pl-[228px]" : "pl-0"}`}>
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          showSidebarToggle={showSidebar} 
        />
        <main className={`flex-1 bg-[#F7F9FC] flex flex-col ${isMapPage ? "h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] overflow-hidden" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
