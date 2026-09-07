"use client";

import { useEffect, useState } from "react";
import { Parcel, GSILayer } from "@/types";
import { fetchParcels, fetchGSILayers } from "@/services/api";
import { MapPin, ShieldCheck, AlertTriangle, Layers, Filter, Scale, Building2, Receipt } from "lucide-react";

interface MapViewProps {
  onSelectParcel: (parcel: Parcel) => void;
  selectedUlpin?: string;
  showGSILayers?: boolean;
}

export default function MapView({ onSelectParcel, selectedUlpin, showGSILayers = true }: MapViewProps) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [gsiLayers, setGsiLayers] = useState<GSILayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'disputed'>('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const fetchedParcels = await fetchParcels();
      const fetchedGSI = await fetchGSILayers();
      setParcels(fetchedParcels);
      setGsiLayers(fetchedGSI);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredParcels = parcels.filter(p => {
    if (activeTab === 'verified') return p.verificationStatus === 'Verified';
    if (activeTab === 'disputed') return p.verificationStatus === 'Disputed';
    return true;
  });

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-50 flex flex-col">
      {/* Top Filter Control Bar */}
      <div className="absolute top-4 left-6 z-20 bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-2xl shadow-md flex items-center space-x-4">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Parcels ({parcels.length})
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'verified' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setActiveTab('disputed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'disputed' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disputed ({parcels.filter(p => p.verificationStatus === 'Disputed').length})
          </button>
        </div>

        {showGSILayers && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-semibold text-emerald-800">
              GSI Geoscientific Layer ({gsiLayers.length} Active)
            </span>
          </div>
        )}
      </div>

      {/* Main Grid View */}
      <div className="flex-1 p-6 overflow-y-auto pt-20">
        {loading ? (
          <div className="h-full flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 text-sm font-medium">Fetching Cadastral GIS Data from REST API...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredParcels.map((parcel) => {
              const isSelected = selectedUlpin === parcel.ulpin;
              const isVerified = parcel.verificationStatus === 'Verified';
              const courtStatus = parcel.courtCaseDetails?.status || (parcel.encumbranceStatus === 'Disputed' ? 'Stay Order Issued' : 'Clear Title');

              return (
                <div
                  key={parcel.ulpin}
                  onClick={() => onSelectParcel(parcel)}
                  className={`group relative cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/40 shadow-lg'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                        {parcel.ulpin}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">S.No {parcel.surveyNumber}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        courtStatus === 'Clear Title'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {courtStatus}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                    {parcel.currentUse}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">{parcel.village}, {parcel.taluk}, {parcel.district}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block font-medium flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-blue-500" />
                        <span>Zoning</span>
                      </span>
                      <span className="text-slate-800 font-semibold">{parcel.zoningDetails?.zoneCategory || parcel.landClassification}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium flex items-center space-x-1">
                        <Receipt className="w-3 h-3 text-emerald-500" />
                        <span>Tax / Valuation</span>
                      </span>
                      <span className="text-slate-800 font-semibold">{parcel.propertyTaxDetails?.totalValuation || `₹ ${(parcel.areaAcres * 1.65).toFixed(2)} Cr`}</span>
                    </div>
                  </div>

                  {/* Court & Legal Status Pill */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500 font-medium flex items-center space-x-1">
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      <span>Court Case Status:</span>
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      courtStatus === 'Clear Title'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {courtStatus === 'Clear Title' ? '✓ Clear Title' : `⚠️ ${parcel.courtCaseDetails?.caseId || 'Injunction Active'}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
