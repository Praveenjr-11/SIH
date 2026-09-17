"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ParcelInspector from "@/components/ParcelInspector";
import { Parcel } from "@/types";
import { fetchParcels } from "@/services/api";
import "leaflet/dist/leaflet.css";

const GisMapContainer = dynamic(() => import("@/components/gis/GisMapContainer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[calc(100vh-64px)] bg-[#0B1521] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#1D5FD1] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-300 text-xs font-semibold">Initializing Tamil Nadu Cadastral GIS Platform...</p>
      </div>
    </div>
  ),
});

export default function PublicMapPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadParcels() {
      try {
        const data = await fetchParcels();
        if (isMounted) {
          setParcels(data || []);
        }
      } catch (err) {
        console.warn("Could not load parcels:", err);
      }
    }
    loadParcels();

    // Trigger window resize so Leaflet calculates map borders with 100% precision
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("resize"));
      }
    }, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] flex-1 overflow-hidden bg-[#0B1521] border-0 m-0 p-0">
      {/* Interactive Leaflet Tamil Nadu GIS Map */}
      <GisMapContainer
        parcels={parcels}
        onSelectParcel={(parcel) => setSelectedParcel(parcel)}
      />

      {/* Parcel Inspector Drawer */}
      <ParcelInspector
        parcel={selectedParcel}
        onClose={() => setSelectedParcel(null)}
      />
    </div>
  );
}
