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
