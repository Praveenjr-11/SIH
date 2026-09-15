"use client";

import { useState, useEffect } from "react";
import {
  fetchHierarchyDistricts,
  fetchHierarchyTaluks,
  fetchHierarchyVillages,
  fetchHierarchySurveyNumbers,
  fetchHierarchyBoundary,
} from "@/services/gisAnalysisService";
import { MapPin, ChevronRight, X, Navigation, FileText } from "lucide-react";

interface HierarchyNavigatorProps {
  onFlyToBounds: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
  onSelectParcelUlpin: (ulpin: string) => void;
  onBoundaryGeoJSON: (geojson: any) => void;
}

interface SurveyEntry {
  ulpin: string;
  survey_number: string;
  area_acres: number;
  land_classification: string;
  owner_name: string;
  verification_status: string;
}

const STATE = "Tamil Nadu";

export default function HierarchyNavigator({
  onFlyToBounds,
  onSelectParcelUlpin,
  onBoundaryGeoJSON,
}: HierarchyNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [boundaryStatus, setBoundaryStatus] = useState<string | null>(null);

  // Selection state
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedTaluk, setSelectedTaluk] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [selectedSurvey, setSelectedSurvey] = useState<string>("");

  // Options state
  const [districts, setDistricts] = useState<string[]>([]);
  const [taluks, setTaluks] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [surveyNumbers, setSurveyNumbers] = useState<SurveyEntry[]>([]);

  // Loading state
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTaluks, setLoadingTaluks] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [loadingSurveys, setLoadingSurveys] = useState(false);

  // Load districts on open
  useEffect(() => {
    if (isOpen && districts.length === 0) {
      setLoadingDistricts(true);
      fetchHierarchyDistricts(STATE).then((data) => {
        setDistricts(data);
        setLoadingDistricts(false);
      });
    }
  }, [isOpen]);

  // Load taluks when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setTaluks([]);
      setSelectedTaluk("");
      return;
    }
    setLoadingTaluks(true);
    setSelectedTaluk("");
    setSelectedVillage("");
    setSelectedSurvey("");
    setVillages([]);
    setSurveyNumbers([]);

    fetchHierarchyTaluks(STATE, selectedDistrict).then((data) => {
      setTaluks(data);
      setLoadingTaluks(false);
    });

    // Fly to district boundary
    fetchHierarchyBoundary("district", { district: selectedDistrict }).then((boundary) => {
      if (boundary?.available === true) {
        if (boundary.bounds) onFlyToBounds(boundary.bounds);
        if (boundary.geojson) onBoundaryGeoJSON(boundary.geojson);
        setBoundaryStatus(null);
      } else {
        onBoundaryGeoJSON(null);
        setBoundaryStatus(boundary?.reason || `Boundary data not yet available for ${selectedDistrict}`);
        // Still fly to the center point if provided
        if (boundary?.center) {
          const zoom = 10;
          onFlyToBounds({ minLat: boundary.center.lat - 0.15, maxLat: boundary.center.lat + 0.15, minLng: boundary.center.lng - 0.15, maxLng: boundary.center.lng + 0.15 });
        }
      }
    });
  }, [selectedDistrict]);

  // Load villages when taluk changes
  useEffect(() => {
    if (!selectedTaluk) {
      setVillages([]);
      setSelectedVillage("");
      return;
    }
    setLoadingVillages(true);
    setSelectedVillage("");
    setSelectedSurvey("");
    setSurveyNumbers([]);

    fetchHierarchyVillages(STATE, selectedDistrict, selectedTaluk).then((data) => {
      setVillages(data);
      setLoadingVillages(false);
    });

    fetchHierarchyBoundary("subdistrict", {
      district: selectedDistrict,
      subdistrict: selectedTaluk,
    }).then((boundary) => {
      if (boundary?.available === true) {
        if (boundary.bounds) onFlyToBounds(boundary.bounds);
        if (boundary.geojson) onBoundaryGeoJSON(boundary.geojson);
        setBoundaryStatus(null);
      } else {
        onBoundaryGeoJSON(null);
        setBoundaryStatus(boundary?.reason || `Boundary data not yet available for ${selectedTaluk}`);
        if (boundary?.center) {
          onFlyToBounds({ minLat: boundary.center.lat - 0.06, maxLat: boundary.center.lat + 0.06, minLng: boundary.center.lng - 0.06, maxLng: boundary.center.lng + 0.06 });
        }
      }
    });
  }, [selectedTaluk]);

  // Load survey numbers when village changes
  useEffect(() => {
    if (!selectedVillage) {
      setSurveyNumbers([]);
      setSelectedSurvey("");
      return;
    }
    setLoadingSurveys(true);
    setSelectedSurvey("");

    fetchHierarchySurveyNumbers(STATE, selectedDistrict, selectedTaluk, selectedVillage).then((data) => {
      setSurveyNumbers(data);
      setLoadingSurveys(false);
    });

    fetchHierarchyBoundary("village", {
      district: selectedDistrict,
      village: selectedVillage,
    }).then((boundary) => {
      if (boundary?.available === true) {
        if (boundary.bounds) onFlyToBounds(boundary.bounds);
        if (boundary.geojson) onBoundaryGeoJSON(boundary.geojson);
        setBoundaryStatus(null);
      } else {
        onBoundaryGeoJSON(null);
        setBoundaryStatus(boundary?.reason || `Boundary data not yet available for ${selectedVillage}`);
        if (boundary?.center) {
          onFlyToBounds({ minLat: boundary.center.lat - 0.02, maxLat: boundary.center.lat + 0.02, minLng: boundary.center.lng - 0.02, maxLng: boundary.center.lng + 0.02 });
        }
      }
    });
  }, [selectedVillage]);

  // Select a survey number → fly to parcel
  const handleSelectSurvey = (entry: SurveyEntry) => {
    setSelectedSurvey(entry.ulpin);
    onSelectParcelUlpin(entry.ulpin);
  };

  const handleReset = () => {
    setSelectedDistrict("");
    setSelectedTaluk("");
    setSelectedVillage("");
    setSelectedSurvey("");
    setTaluks([]);
    setVillages([]);
    setSurveyNumbers([]);
    onBoundaryGeoJSON(null);
  };

  // Build breadcrumb
  const breadcrumbParts: string[] = [STATE];
  if (selectedDistrict) breadcrumbParts.push(selectedDistrict);
  if (selectedTaluk) breadcrumbParts.push(selectedTaluk);
  if (selectedVillage) breadcrumbParts.push(selectedVillage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xs flex items-center space-x-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shrink-0"
      >
        <MapPin className="w-4 h-4 text-indigo-600" />
        <span>Hierarchy</span>
        {selectedDistrict && (
          <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded text-[9px] font-bold max-w-[120px] truncate">
            {selectedVillage || selectedTaluk || selectedDistrict}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[340px] bg-white/95 backdrop-blur-xl border border-slate-200 p-3.5 rounded-2xl shadow-xl z-50 space-y-3 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                DISTRICT → TALUK → VILLAGE → SURVEY
              </span>
              <span className="text-[9px] text-slate-400">TNGIS-style cascading hierarchy drill-down</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center flex-wrap gap-0.5 text-[9px]">
            {breadcrumbParts.map((part, idx) => (
              <span key={idx} className="flex items-center">
                {idx > 0 && <ChevronRight className="w-2.5 h-2.5 text-slate-300 mx-0.5" />}
                <span className={`font-bold ${idx === breadcrumbParts.length - 1 ? "text-indigo-700" : "text-slate-500"}`}>
                  {part}
                </span>
              </span>
            ))}
            {selectedDistrict && (
              <button
                onClick={handleReset}
                className="ml-auto text-[8px] text-red-500 hover:text-red-700 font-bold px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Boundary availability status message */}
          {boundaryStatus && selectedDistrict && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-[9px] text-amber-700 font-semibold flex items-start space-x-1.5">
              <span className="text-amber-500 flex-shrink-0 mt-px">⚠️</span>
              <span>{boundaryStatus}</span>
            </div>
          )}

          {/* District Selector */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>District</span>
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={loadingDistricts}
              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:opacity-50 transition-all appearance-none cursor-pointer"
            >
              <option value="">
                {loadingDistricts ? "Loading districts…" : "— Select District —"}
              </option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Taluk Selector */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span>Taluk / Sub-District</span>
            </label>
            <select
              value={selectedTaluk}
              onChange={(e) => setSelectedTaluk(e.target.value)}
              disabled={!selectedDistrict || loadingTaluks}
              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 disabled:opacity-50 disabled:bg-slate-50 transition-all appearance-none cursor-pointer"
            >
              <option value="">
                {loadingTaluks ? "Loading taluks…" : !selectedDistrict ? "Select district first" : "— Select Taluk —"}
              </option>
              {taluks.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Village Selector */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Village</span>
            </label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              disabled={!selectedTaluk || loadingVillages}
              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 disabled:opacity-50 disabled:bg-slate-50 transition-all appearance-none cursor-pointer"
            >
              <option value="">
                {loadingVillages ? "Loading villages…" : !selectedTaluk ? "Select taluk first" : "— Select Village —"}
              </option>
              {villages.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Survey Number Selector */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Survey Number</span>
              {surveyNumbers.length > 0 && (
                <span className="text-[8px] bg-amber-100 text-amber-700 border border-amber-200 px-1 py-0.5 rounded font-bold">
                  {surveyNumbers.length} parcels
                </span>
              )}
            </label>

            {loadingSurveys ? (
              <div className="flex items-center justify-center py-3">
                <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <span className="ml-2 text-[10px] text-amber-600 font-semibold">Loading survey records…</span>
              </div>
            ) : !selectedVillage ? (
              <div className="text-[10px] text-slate-400 font-semibold py-2 text-center">
                Select village to view survey numbers
              </div>
            ) : surveyNumbers.length === 0 ? (
              <div className="text-[10px] text-slate-400 font-semibold py-2 text-center">
                No survey records found for this village
              </div>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {surveyNumbers.map((entry) => (
                  <button
                    key={entry.ulpin}
                    onClick={() => handleSelectSurvey(entry)}
                    className={`w-full text-left p-2 rounded-lg border transition-all text-[10px] ${
                      selectedSurvey === entry.ulpin
                        ? "bg-amber-50 border-amber-300 ring-1 ring-amber-200"
                        : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <FileText className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        <span className="font-bold text-slate-800">S.No {entry.survey_number}</span>
                      </div>
                      <span className="font-mono text-[8px] text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">
                        {entry.ulpin}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-slate-500">
                      <span>{entry.land_classification || "—"}</span>
                      <span className="font-semibold">{entry.area_acres} acres</span>
                    </div>
                    {entry.owner_name && (
                      <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                        Owner: {entry.owner_name}
                      </div>
                    )}
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
