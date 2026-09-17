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

    fetchHierarchyBoundary("district", { district: selectedDistrict }).then((boundary) => {
      if (boundary?.available === true) {
        if (boundary.bounds) onFlyToBounds(boundary.bounds);
        if (boundary.geojson) onBoundaryGeoJSON(boundary.geojson);
        setBoundaryStatus(null);
      } else {
        onBoundaryGeoJSON(null);
        setBoundaryStatus(boundary?.reason || `Boundary data not yet available for ${selectedDistrict}`);
        if (boundary?.center) {
          onFlyToBounds({ minLat: boundary.center.lat - 0.2, maxLat: boundary.center.lat + 0.2, minLng: boundary.center.lng - 0.2, maxLng: boundary.center.lng + 0.2 });
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

    fetchHierarchyBoundary("subdistrict", { district: selectedDistrict, taluk: selectedTaluk, subdistrict: selectedTaluk }).then((boundary) => {
      if (boundary?.available === true) {
        if (boundary.bounds) onFlyToBounds(boundary.bounds);
        if (boundary.geojson) onBoundaryGeoJSON(boundary.geojson);
        setBoundaryStatus(null);
      } else {
        onBoundaryGeoJSON(null);
        setBoundaryStatus(boundary?.reason || `Boundary data not yet available for ${selectedTaluk}`);
        if (boundary?.center) {
          onFlyToBounds({ minLat: boundary.center.lat - 0.08, maxLat: boundary.center.lat + 0.08, minLng: boundary.center.lng - 0.08, maxLng: boundary.center.lng + 0.08 });
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
      taluk: selectedTaluk,
      subdistrict: selectedTaluk,
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
    <div className="relative font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 bg-[#FFFFFF] border border-[#E3E8EF] rounded-md shadow-xs flex items-center space-x-2 text-xs font-semibold text-[#102A43] hover:bg-[#F7F9FC] transition-colors shrink-0"
      >
        <MapPin className="w-4 h-4 text-[#1D5FD1]" />
        <span>Hierarchy Drill-down</span>
        {selectedDistrict && (
          <span className="bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] px-1.5 py-0.5 rounded text-[10px] font-bold max-w-[120px] truncate">
            {selectedVillage || selectedTaluk || selectedDistrict}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-[330px] bg-[#FFFFFF] border border-[#E3E8EF] p-3 rounded-md shadow-lg z-50 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF]">
            <div>
              <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider block">
                Administrative Hierarchy
              </span>
              <span className="text-[10px] text-[#53627A]">District → Taluk → Village → Survey</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-[#F7F9FC] text-[#53627A] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center flex-wrap gap-0.5 text-[10px]">
            {breadcrumbParts.map((part, idx) => (
              <span key={idx} className="flex items-center">
                {idx > 0 && <ChevronRight className="w-2.5 h-2.5 text-slate-400 mx-0.5" />}
                <span className={`font-semibold ${idx === breadcrumbParts.length - 1 ? "text-[#1D5FD1]" : "text-[#53627A]"}`}>
                  {part}
                </span>
              </span>
            ))}
            {selectedDistrict && (
              <button
                onClick={handleReset}
                className="ml-auto text-[9px] text-[#D9363E] hover:underline font-semibold px-1 py-0.5"
              >
                Reset
              </button>
            )}
          </div>

          {/* Boundary availability status */}
          {boundaryStatus && selectedDistrict && (
            <div className="bg-[#FEF5E7] border border-[#E99A16] rounded px-2 py-1 text-[10px] text-[#E99A16] font-medium flex items-start space-x-1">
              <span>⚠️</span>
              <span>{boundaryStatus}</span>
            </div>
          )}

          {/* District Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={loadingDistricts}
              className="w-full px-2 py-1.5 bg-white border border-[#E3E8EF] rounded text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1] disabled:opacity-50 cursor-pointer"
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
            <label className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider">
              Taluk / Sub-District
            </label>
            <select
              value={selectedTaluk}
              onChange={(e) => setSelectedTaluk(e.target.value)}
              disabled={!selectedDistrict || loadingTaluks}
              className="w-full px-2 py-1.5 bg-white border border-[#E3E8EF] rounded text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1] disabled:opacity-50 disabled:bg-[#F7F9FC] cursor-pointer"
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
            <label className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider">
              Revenue Village
            </label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              disabled={!selectedTaluk || loadingVillages}
              className="w-full px-2 py-1.5 bg-white border border-[#E3E8EF] rounded text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1] disabled:opacity-50 disabled:bg-[#F7F9FC] cursor-pointer"
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
            <label className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider flex items-center justify-between">
              <span>Survey Number</span>
              {surveyNumbers.length > 0 && (
                <span className="text-[9px] bg-[#F1F5FB] text-[#1D5FD1] px-1.5 py-0.5 rounded font-bold">
                  {surveyNumbers.length} parcels
                </span>
              )}
            </label>

            {loadingSurveys ? (
              <div className="flex items-center justify-center py-2 text-xs text-[#1D5FD1]">
                <span>Loading survey records…</span>
              </div>
            ) : !selectedVillage ? (
              <div className="text-[10px] text-[#53627A] py-1 text-center">
                Select village to view survey numbers
              </div>
            ) : surveyNumbers.length === 0 ? (
              <div className="text-[10px] text-[#53627A] py-1 text-center">
                No survey records found for this village
              </div>
            ) : (
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {surveyNumbers.map((entry) => (
                  <button
                    key={entry.ulpin}
                    onClick={() => handleSelectSurvey(entry)}
                    className={`w-full text-left p-2 rounded border transition-colors text-[11px] ${
                      selectedSurvey === entry.ulpin
                        ? "bg-[#F1F5FB] border-[#1D5FD1]"
                        : "bg-white border-[#E3E8EF] hover:bg-[#F7F9FC]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <FileText className="w-3 h-3 text-[#1D5FD1] shrink-0" />
                        <span className="font-bold text-[#102A43]">S.No {entry.survey_number}</span>
                      </div>
                      <span className="font-mono text-[9px] text-[#1D5FD1] font-bold">
                        {entry.ulpin}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[#53627A] text-[10px]">
                      <span>{entry.land_classification || "—"}</span>
                      <span className="font-medium">{entry.area_acres} acres</span>
                    </div>
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
