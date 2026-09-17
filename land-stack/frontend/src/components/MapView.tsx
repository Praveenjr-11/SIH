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
    <div className="relative w-full h-[calc(100vh-4rem)] bg-[#F7F9FC] flex flex-col">
      {/* Top Filter Control Bar */}
      <div className="absolute top-4 left-6 z-20 bg-white border border-[#E3E8EF] p-2 rounded-lg shadow-sm flex items-center space-x-3">
        <div className="flex items-center space-x-1 bg-[#F7F9FC] p-1 rounded-md border border-[#E3E8EF]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'all' ? 'bg-[#102A43] text-white shadow-xs' : 'text-[#53627A] hover:text-[#102A43]'
            }`}
          >
            All Parcels ({parcels.length})
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'verified' ? 'bg-[#16845B] text-white shadow-xs' : 'text-[#53627A] hover:text-[#102A43]'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setActiveTab('disputed')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'disputed' ? 'bg-[#D9363E] text-white shadow-xs' : 'text-[#53627A] hover:text-[#102A43]'
            }`}
          >
            Disputed ({parcels.filter(p => p.verificationStatus === 'Disputed').length})
          </button>
        </div>

        {showGSILayers && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md">
            <span className="w-2 h-2 rounded-full bg-[#16845B]"></span>
            <span className="text-xs font-semibold text-[#16845B]">
              GSI Geoscientific Layer ({gsiLayers.length} Active)
            </span>
          </div>
        )}
      </div>

      {/* Main Grid View */}
      <div className="flex-1 p-6 overflow-y-auto pt-20 custom-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#1D5FD1] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#53627A] text-xs font-medium">Fetching Cadastral GIS Data from REST API...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredParcels.map((parcel) => {
              const isSelected = selectedUlpin === parcel.ulpin;
              const courtStatus = parcel.courtCaseDetails?.status || (parcel.encumbranceStatus === 'Disputed' ? 'Stay Order Issued' : 'Clear Title');

              return (
                <div
                  key={parcel.ulpin}
                  onClick={() => onSelectParcel(parcel)}
                  className={`group relative cursor-pointer p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-50/50 border-[#1D5FD1] ring-1 ring-[#1D5FD1] shadow-xs'
                      : 'bg-white hover:bg-[#F7F9FC] border-[#E3E8EF] hover:border-[#1D5FD1] shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#1D5FD1] bg-[#F7F9FC] px-2.5 py-1 rounded border border-[#E3E8EF]">
                        {parcel.ulpin}
                      </span>
                      <span className="text-xs text-[#53627A] font-semibold">S.No {parcel.surveyNumber}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        courtStatus === 'Clear Title'
                          ? 'bg-emerald-50 text-[#16845B] border-emerald-200'
                          : 'bg-red-50 text-[#D9363E] border-red-200'
                      }`}
                    >
                      {courtStatus}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#14213D] text-sm mb-1 group-hover:text-[#1D5FD1] transition-colors">
                    {parcel.currentUse}
                  </h3>
                  <p className="text-xs text-[#53627A] mb-3">{parcel.village}, {parcel.taluk}, {parcel.district}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <div>
                      <span className="text-[#53627A] block font-medium flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-[#1D5FD1]" />
                        <span>Zoning</span>
                      </span>
                      <span className="text-[#14213D] font-semibold">{parcel.zoningDetails?.zoneCategory || parcel.landClassification}</span>
                    </div>
                    <div>
                      <span className="text-[#53627A] block font-medium flex items-center space-x-1">
                        <Receipt className="w-3 h-3 text-[#16845B]" />
                        <span>Tax / Valuation</span>
                      </span>
                      <span className="text-[#14213D] font-semibold">{parcel.propertyTaxDetails?.totalValuation || `₹ ${(parcel.areaAcres * 1.65).toFixed(2)} Cr`}</span>
                    </div>
                  </div>

                  {/* Court & Legal Status Pill */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E3E8EF] text-[11px]">
                    <span className="text-[#53627A] font-medium flex items-center space-x-1">
                      <Scale className="w-3.5 h-3.5 text-[#53627A]" />
                      <span>Court Case Status:</span>
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                      courtStatus === 'Clear Title'
                        ? 'bg-emerald-50 text-[#16845B] border-emerald-200'
                        : 'bg-red-50 text-[#D9363E] border-red-200'
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
