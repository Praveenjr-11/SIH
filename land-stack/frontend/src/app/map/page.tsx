"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import GisMapContainer from "@/components/gis/GisMapContainer";
import ParcelInspector from "@/components/ParcelInspector";
import { Parcel } from "@/types";
import { fetchParcels } from "@/services/api";
import { Layers, ArrowLeft, UserCheck, Search, Compass, MapPin } from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";

export default function PublicMapPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const { officer } = useOfficerAuth();

  useEffect(() => {
    async function loadParcels() {
      const data = await fetchParcels();
      setParcels(data);
    }
    loadParcels();
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* MAP TOP BAR OVERLAY */}
      <div className="absolute top-4 left-4 z-[400] flex items-center space-x-3">
        <Link
          href="/"
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/90 text-white font-bold text-xs border border-slate-700 hover:bg-slate-800 backdrop-blur-md shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Home</span>
        </Link>

        <div className="hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/90 text-white text-xs border border-slate-700 backdrop-blur-md shadow-lg">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="font-extrabold tracking-tight">LAND STACK GIS</span>
          <span className="text-[10px] text-slate-400 font-mono">India Map</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[400] flex items-center space-x-3">
        <Link
          href={officer ? "/officer/dashboard" : "/officer/login"}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs backdrop-blur-md shadow-lg transition-all"
        >
          <UserCheck className="w-4 h-4" />
          <span>{officer ? `Dashboard (${officer.name.split(',')[0]})` : "Officer Login"}</span>
        </Link>
      </div>

      {/* Interactive Leaflet India GIS Map */}
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
