"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { searchLocations } from "@/services/gisService";
import { SearchResult } from "@/types/gis";

interface LocationSearchProps {
  onSelectLocation: (lat: number, lng: number, displayName: string, addressDetails?: any) => void;
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
    onSelectLocation(lat, lng, item.display_name, item.address);
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
      <div className="relative flex items-center h-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xs px-3 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location across India..."
          className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
        />
        {loading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin ml-2 shrink-0" />}
        {query && !loading && (
          <button
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors ml-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No matching locations found in India.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {results.map((item) => (
                <div
                  key={item.place_id}
                  onClick={() => handleSelect(item)}
                  className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-start space-x-3 text-left"
                >
                  <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {item.display_name.split(",")[0]}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
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
