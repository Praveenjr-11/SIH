"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { searchLocations } from "@/services/gisService";
import { SearchResult } from "@/types/gis";

interface LocationSearchProps {
  onSelectLocation: (lat: number, lng: number, displayName: string, addressDetails?: any, geojson?: any) => void;
}

export default function LocationSearch({ onSelectLocation }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced Search Effect
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const data = await searchLocations(query);
      setResults(data);
      setLoading(false);
      setIsOpen(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    
    // Merge type and class into address details so zoneResolver can use them
    const addressDetails = {
      ...item.address,
      type: item.type,
      category: item.class || item.type,
    };
    
    onSelectLocation(lat, lng, item.display_name, addressDetails, item.geojson);
    setIsOpen(false);
    setQuery(item.display_name.split(",")[0]); // Show concise name in search input
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full sm:w-72 md:w-80 lg:w-96 flex-1 sm:flex-initial">
      {/* Search Input Box */}
      <div className="relative flex items-center h-9 bg-white border border-[#E3E8EF] rounded-md shadow-xs px-3 transition-all focus-within:border-[#1D5FD1]">
        <Search className="w-3.5 h-3.5 text-[#53627A] mr-2 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location across India..."
          className="w-full bg-transparent text-xs text-[#14213D] placeholder:text-[#53627A] focus:outline-none font-medium"
        />
        {loading && <Loader2 className="w-3.5 h-3.5 text-[#1D5FD1] animate-spin ml-2 shrink-0" />}
        {query && !loading && (
          <button
            onClick={handleClear}
            className="p-1 text-[#53627A] hover:text-[#102A43] rounded transition-colors ml-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E3E8EF] rounded-md shadow-lg overflow-hidden z-50 max-h-72 overflow-y-auto custom-scrollbar">
          {results.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#53627A]">No matching locations found in India.</div>
          ) : (
            <div className="divide-y divide-[#E3E8EF]">
              {results.map((item) => (
                <div
                  key={item.place_id}
                  onClick={() => handleSelect(item)}
                  className="p-2.5 hover:bg-[#F7F9FC] cursor-pointer transition-colors flex items-start space-x-2.5 text-left"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#1D5FD1] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-[#14213D] leading-tight">
                      {item.display_name.split(",")[0]}
                    </h4>
                    <p className="text-[11px] text-[#53627A] line-clamp-1 mt-0.5">
                      {item.display_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
