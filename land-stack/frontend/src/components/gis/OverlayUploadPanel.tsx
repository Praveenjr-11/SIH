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
        className="h-9 px-3 bg-white border border-[#E3E8EF] rounded-md shadow-xs flex items-center space-x-2 text-xs font-semibold text-[#14213D] hover:bg-[#F7F9FC] transition-colors shrink-0"
      >
        <Upload className="w-4 h-4 text-[#1D5FD1]" />
        <span>Survey Overlay</span>
        {result && (
          <span className="bg-blue-50 text-[#1D5FD1] border border-blue-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
            Active
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-80 bg-white border border-[#E3E8EF] p-3 rounded-lg shadow-lg z-50 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF]">
            <div>
              <span className="text-[10px] font-bold text-[#102A43] uppercase tracking-wider block">
                FIELD SURVEY OVERLAY PREVIEW
              </span>
              <span className="text-[9px] text-[#53627A]">
                Upload GeoJSON / Shapefile ZIP to compare against existing cadastral
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC] transition-colors">
              <X className="w-3.5 h-3.5" />
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
            <div className={`border-2 border-dashed rounded-md p-4 text-center transition-all ${
              loading ? "border-[#1D5FD1] bg-blue-50/40" : "border-[#E3E8EF] hover:border-[#1D5FD1] hover:bg-[#F7F9FC]"
            }`}>
              {loading ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-5 h-5 border-2 border-[#1D5FD1]/30 border-t-[#1D5FD1] rounded-full animate-spin" />
                  <span className="text-[10px] text-[#1D5FD1] font-semibold">Processing {fileName}…</span>
                </div>
              ) : fileName && result ? (
                <div className="flex flex-col items-center space-y-1">
                  <FileCheck className="w-5 h-5 text-[#16845B]" />
                  <span className="text-[10px] text-[#16845B] font-bold">{fileName}</span>
                  <span className="text-[9px] text-[#53627A]">Click to upload a different file</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1">
                  <Upload className="w-5 h-5 text-[#53627A]" />
                  <span className="text-[10px] text-[#14213D] font-medium">Drop GeoJSON or Shapefile ZIP</span>
                  <span className="text-[9px] text-[#53627A]">.geojson, .json, or .zip</span>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 text-[9px]">
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2 rounded bg-[#D9363E]" />
              <span className="text-[#53627A] font-semibold">Uploaded Survey</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2 rounded bg-[#1D5FD1]" />
              <span className="text-[#53627A] font-semibold">Existing Cadastral</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md px-2.5 py-1.5 flex items-center space-x-1.5 text-[10px]">
              <AlertTriangle className="w-3 h-3 text-[#D9363E] flex-shrink-0" />
              <span className="text-[#D9363E] font-medium">{error}</span>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-2 border-t border-[#E3E8EF] pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#102A43] uppercase tracking-wider">
                  Overlap Analysis
                </span>
                <button onClick={handleClear} className="text-[9px] text-[#D9363E] hover:underline font-semibold flex items-center space-x-0.5">
                  <X className="w-2.5 h-2.5" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#F7F9FC] border border-[#E3E8EF] rounded-md p-2 text-center">
                  <span className="text-base font-bold font-mono text-[#D9363E]">{result.uploadedFeatureCount}</span>
                  <span className="block text-[9px] text-[#53627A] font-medium">Uploaded Features</span>
                </div>
                <div className="bg-[#F7F9FC] border border-[#E3E8EF] rounded-md p-2 text-center">
                  <span className="text-base font-bold font-mono text-[#1D5FD1]">{result.overlappingParcels?.length || 0}</span>
                  <span className="block text-[9px] text-[#53627A] font-medium">Overlapping Parcels</span>
                </div>
              </div>

              {/* Overlapping ULPIN list */}
              {result.overlappingParcels?.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                  {result.overlappingParcels.map((parcel: any, idx: number) => (
                    <div key={idx} className="bg-[#F7F9FC] border border-[#E3E8EF] rounded-md px-2.5 py-1.5 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#102A43] font-mono">{parcel.ulpin}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-white border border-[#E3E8EF] text-[#1D5FD1] font-bold">
                          {parcel.verificationStatus || "Unknown"}
                        </span>
                      </div>
                      <div className="text-[#53627A] mt-0.5">
                        S.No {parcel.surveyNumber} • {parcel.village}, {parcel.district}
                        {parcel.areaAcres ? ` • ${parcel.areaAcres} acres` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[8px] text-[#53627A] text-right font-mono">
                Source: {result.source}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
