"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2, Building2, User, FileText, CheckCircle2, AlertTriangle, Compass } from "lucide-react";
import { Parcel } from "@/types";
import { searchLocations } from "@/services/gisService";
import { SearchResult } from "@/types/gis";

interface GisSearchProps {
  parcels: Parcel[];
  onSelectParcel: (parcel: Parcel) => void;
  onSelectLocation: (lat: number, lng: number, displayName: string, addressDetails?: any, geojson?: any) => void;
}

export default function GisSearch({
  parcels = [],
  onSelectParcel,
  onSelectLocation,
}: GisSearchProps) {
  const [query, setQuery] = useState("");
  const [matchingParcels, setMatchingParcels] = useState<Parcel[]>([]);
  const [matchingAddresses, setMatchingAddresses] = useState<SearchResult[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<"ALL" | "PARCELS" | "ADDRESSES">("ALL");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search effect: Instant local parcel search + debounced address geocoding
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) {
      setMatchingParcels([]);
      setMatchingAddresses([]);
      setIsOpen(false);
      return;
    }

    // 1. INSTANT PARCEL SEARCH (Matches: ULPIN, Survey Number, Owner Name, Village, Taluk, District)
    const matched = parcels.filter((p) => {
      const ulpinMatch = p.ulpin?.toLowerCase().includes(q);
      const surveyMatch = p.surveyNumber?.toLowerCase().includes(q);
      const ownerMatch = p.ownerName?.toLowerCase().includes(q);
      const villageMatch = p.village?.toLowerCase().includes(q);
      const talukMatch = p.taluk?.toLowerCase().includes(q);
      const districtMatch = p.district?.toLowerCase().includes(q);

      return ulpinMatch || surveyMatch || ownerMatch || villageMatch || talukMatch || districtMatch;
    }).slice(0, 8); // Top 8 parcel matches

    setMatchingParcels(matched);
    setIsOpen(true);

    // 2. DEBOUNCED ADDRESS SEARCH (Geocoding across Tamil Nadu / India)
    const timer = setTimeout(async () => {
      setLoadingAddresses(true);
      try {
        const addressResults = await searchLocations(query);
        setMatchingAddresses(addressResults.slice(0, 5));
      } catch (err) {
        console.warn("Address search error:", err);
      } finally {
        setLoadingAddresses(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, parcels]);

  const handleSelectParcel = (parcel: Parcel) => {
    onSelectParcel(parcel);
    setIsOpen(false);
    setQuery(`S.No ${parcel.surveyNumber} — ${parcel.ulpin}`);
  };

  const handleSelectAddress = (item: SearchResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const addressDetails = {
      ...item.address,
      type: item.type,
      category: item.class || item.type,
    };
    onSelectLocation(lat, lng, item.display_name, addressDetails, item.geojson);
    setIsOpen(false);
    setQuery(item.display_name.split(",")[0]);
  };

  const handleClear = () => {
    setQuery("");
    setMatchingParcels([]);
    setMatchingAddresses([]);
    setIsOpen(false);
  };

  const totalResults = matchingParcels.length + matchingAddresses.length;

  return (
    <div ref={containerRef} className="relative w-full sm:w-[420px] md:w-[460px] font-sans">
      {/* Search Input Box */}
      <div className="relative flex items-center h-10 bg-white border border-[#E3E8EF] rounded-lg shadow-sm px-3 transition-all focus-within:border-[#1D5FD1] focus-within:ring-1 focus-within:ring-[#1D5FD1]">
        <Search className="w-4 h-4 text-[#1D5FD1] mr-2.5 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Search by ULPIN, Survey No, Owner, Village, District, Address..."
          className="w-full bg-transparent text-xs text-[#102A43] placeholder:text-[#53627A] focus:outline-none font-medium"
        />
        {loadingAddresses && <Loader2 className="w-3.5 h-3.5 text-[#1D5FD1] animate-spin ml-1.5 shrink-0" />}
        {query && (
          <button
            onClick={handleClear}
            className="p-1 text-[#53627A] hover:text-[#102A43] rounded transition-colors ml-1 shrink-0"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E3E8EF] rounded-lg shadow-xl overflow-hidden z-[2500] max-h-[75vh] flex flex-col">
          {/* Filter Pills Header */}
          <div className="p-2 bg-[#F7F9FC] border-b border-[#E3E8EF] flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setFilterCategory("ALL")}
                className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                  filterCategory === "ALL" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:bg-slate-200"
                }`}
              >
                All ({totalResults})
              </button>
              <button
                onClick={() => setFilterCategory("PARCELS")}
                className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                  filterCategory === "PARCELS" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:bg-slate-200"
                }`}
              >
                Parcels ({matchingParcels.length})
              </button>
              <button
                onClick={() => setFilterCategory("ADDRESSES")}
                className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                  filterCategory === "ADDRESSES" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:bg-slate-200"
                }`}
              >
                Locations ({matchingAddresses.length})
              </button>
            </div>
            <span className="text-[10px] text-[#53627A] font-medium hidden sm:inline">Click to inspect</span>
          </div>

          <div className="overflow-y-auto divide-y divide-[#E3E8EF] text-xs">
            {totalResults === 0 && !loadingAddresses && (
              <div className="p-4 text-center text-[#53627A] space-y-1">
                <div className="font-semibold text-xs text-[#102A43]">No matching cadastral records or locations</div>
                <div className="text-[11px]">
                  Try searching by 14-digit ULPIN (e.g. TN33...), survey number (e.g. 171/3A), owner name, or village.
                </div>
              </div>
            )}

            {/* SECTION 1: CADASTRAL PARCELS */}
            {(filterCategory === "ALL" || filterCategory === "PARCELS") && matchingParcels.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-[#F1F5FB] text-[10px] font-bold uppercase tracking-wider text-[#1D5FD1] flex items-center justify-between">
                  <span>Cadastral Land Parcels</span>
                  <span className="font-normal font-mono">{matchingParcels.length} matches</span>
                </div>
                {matchingParcels.map((p) => {
                  const isDisputed = p.courtCaseDetails?.status?.toLowerCase().includes("stay") || p.encumbranceStatus === "Disputed";
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectParcel(p)}
                      className="w-full text-left p-3 hover:bg-[#F7F9FC] transition-colors flex items-start justify-between gap-2 border-b border-[#E3E8EF]/60 last:border-b-0"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-[#102A43]">
                            S.No {p.surveyNumber}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-[#1D5FD1] bg-[#F1F5FB] px-1.5 py-0.2 rounded border border-[#E3E8EF]">
                            {p.ulpin}
                          </span>
                          {isDisputed ? (
                            <span className="text-[9px] font-bold text-[#D9363E] bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                              Disputed
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-[#16845B] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-[#53627A] flex items-center space-x-1 truncate">
                          <User className="w-3 h-3 text-[#53627A] shrink-0" />
                          <span className="font-medium text-[#102A43]">{p.ownerName}</span>
                          <span>•</span>
                          <span>{p.village}, {p.taluk}, {p.district}</span>
                        </div>

                        <div className="text-[10px] text-[#53627A] flex items-center space-x-2 font-mono">
                          <span>Area: <strong>{p.areaAcres} Acres</strong></span>
                          <span>•</span>
                          <span className="text-[#16845B] font-semibold">{p.propertyTaxDetails?.totalValuation || "Valuation Available"}</span>
                        </div>
                      </div>

                      <span className="shrink-0 text-[10px] font-semibold text-[#1D5FD1] bg-white border border-[#E3E8EF] px-2 py-1 rounded shadow-2xs hover:bg-[#1D5FD1] hover:text-white transition-colors mt-0.5">
                        Inspect →
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* SECTION 2: GEOGRAPHIC LOCATIONS & ADDRESSES */}
            {(filterCategory === "ALL" || filterCategory === "ADDRESSES") && matchingAddresses.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-[#F8FAFD] text-[10px] font-bold uppercase tracking-wider text-[#53627A] flex items-center justify-between">
                  <span>Geographic Locations & Addresses</span>
                  <span className="font-normal font-mono">{matchingAddresses.length} matches</span>
                </div>
                {matchingAddresses.map((item, idx) => (
                  <button
                    key={`${item.lat}-${item.lon}-${idx}`}
                    onClick={() => handleSelectAddress(item)}
                    className="w-full text-left p-3 hover:bg-[#F7F9FC] transition-colors flex items-center space-x-3"
                  >
                    <div className="w-7 h-7 rounded-md bg-[#F1F5FB] text-[#1D5FD1] flex items-center justify-center shrink-0 border border-[#E3E8EF]">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-[#102A43] truncate">
                        {item.display_name.split(",")[0]}
                      </div>
                      <div className="text-[10px] text-[#53627A] truncate mt-0.5">
                        {item.display_name}
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] text-[#53627A] font-mono">
                      {parseFloat(item.lat).toFixed(3)}°N
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
