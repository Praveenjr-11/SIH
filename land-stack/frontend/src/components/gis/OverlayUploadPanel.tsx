"use client";

import { useState, useRef } from "react";
import { uploadOverlayPreview } from "@/services/gisAnalysisService";
import { Upload, FileCheck, X, AlertTriangle, Layers } from "lucide-react";

interface OverlayUploadPanelProps {
  onOverlayResult: (data: {
    uploadedGeojson: any;
    overlappingParcels: any[];
  } | null) => void;
}

export default function OverlayUploadPanel({ onOverlayResult }: OverlayUploadPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // If it's a GeoJSON file, also parse it locally for map rendering
      let uploadedGeojson: any = null;
      if (file.name.endsWith(".geojson") || file.name.endsWith(".json")) {
        const text = await file.text();
        uploadedGeojson = JSON.parse(text);
      }

      const data = await uploadOverlayPreview(file);
      setResult(data);

      // Pass uploaded GeoJSON and overlapping parcels to parent for map rendering
      onOverlayResult({
        uploadedGeojson: uploadedGeojson || { type: "FeatureCollection", features: [] },
        overlappingParcels: data.overlappingParcels || [],
      });
    } catch (err: any) {
      setError(err.message || "Failed to process uploaded file.");
      onOverlayResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
    setFileName(null);
    onOverlayResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xs flex items-center space-x-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shrink-0"
      >
        <Upload className="w-4 h-4 text-rose-500" />
        <span>Survey Overlay</span>
        {result && (
          <span className="bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
            Active
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 p-3 rounded-2xl shadow-xl z-50 space-y-3 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                FIELD SURVEY OVERLAY PREVIEW
              </span>
              <span className="text-[9px] text-slate-400">
                Upload GeoJSON / Shapefile ZIP to compare against existing cadastral
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Upload area */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".geojson,.json,.zip"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
              loading ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"
            }`}>
              {loading ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-[10px] text-blue-600 font-semibold">Processing {fileName}…</span>
                </div>
              ) : fileName && result ? (
                <div className="flex flex-col items-center space-y-1">
                  <FileCheck className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] text-emerald-700 font-bold">{fileName}</span>
                  <span className="text-[9px] text-slate-400">Click to upload a different file</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-[10px] text-slate-600 font-semibold">Drop GeoJSON or Shapefile ZIP</span>
                  <span className="text-[9px] text-slate-400">.geojson, .json, or .zip</span>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 text-[9px]">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-2 rounded bg-rose-500" />
              <span className="text-slate-500 font-semibold">Uploaded Survey</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-2 rounded bg-blue-500" />
              <span className="text-slate-500 font-semibold">Existing Cadastral</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 flex items-center space-x-1.5 text-[10px]">
              <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
              <span className="text-red-700 font-semibold">{error}</span>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-2 border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Overlap Analysis
                </span>
                <button onClick={handleClear} className="text-[9px] text-red-500 hover:text-red-700 font-bold flex items-center space-x-0.5">
                  <X className="w-2.5 h-2.5" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 text-center">
                  <span className="text-lg font-black text-rose-700">{result.uploadedFeatureCount}</span>
                  <span className="block text-[9px] text-rose-500 font-semibold">Uploaded Features</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                  <span className="text-lg font-black text-blue-700">{result.overlappingParcels?.length || 0}</span>
                  <span className="block text-[9px] text-blue-500 font-semibold">Overlapping Parcels</span>
                </div>
              </div>

              {/* Overlapping ULPIN list */}
              {result.overlappingParcels?.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {result.overlappingParcels.map((parcel: any, idx: number) => (
                    <div key={idx} className="bg-blue-50/50 border border-blue-100 rounded-lg px-2.5 py-1.5 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-800 font-mono">{parcel.ulpin}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-bold">
                          {parcel.verificationStatus || "Unknown"}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        S.No {parcel.surveyNumber} • {parcel.village}, {parcel.district}
                        {parcel.areaAcres ? ` • ${parcel.areaAcres} acres` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[8px] text-slate-400 text-right font-mono">
                Source: {result.source}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
