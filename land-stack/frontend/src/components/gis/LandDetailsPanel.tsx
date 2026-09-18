"use client";

import { useState } from "react";
import { OfficialLandDetailsResponse } from "@/services/gisLandRecordService";
import { X, MapPin, Database, ShieldAlert, ShieldCheck, CheckCircle2, Copy, Check, ExternalLink, RefreshCw, KeyRound } from "lucide-react";

interface LandDetailsPanelProps {
  data: OfficialLandDetailsResponse | null;
  loading?: boolean;
  isOfficer?: boolean;
  onToggleOfficer?: (isOfficer: boolean) => void;
  onClose: () => void;
}

export default function LandDetailsPanel({ data, loading, isOfficer = false, onToggleOfficer, onClose }: LandDetailsPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!data && !loading) return null;

  const handleCopyCoords = () => {
    if (!data) return;
    const text = `${data.gis.latitude.toFixed(6)}, ${data.gis.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const status = data?.ownership?.status || "NOT_CONNECTED";
  const badgeColors = {
    AVAILABLE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    NOT_CONNECTED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    RESTRICTED: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
  };

  const statusIcons = {
    AVAILABLE: CheckCircle2,
    NOT_CONNECTED: ShieldAlert,
    RESTRICTED: ShieldAlert
  };

  const StatusIcon = statusIcons[status] || ShieldAlert;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl z-[2500] flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block">OFFICIAL GOVERNMENT RECORD</span>
            <h2 className="font-mono text-sm font-bold text-white tracking-tight">LAND DETAILS</h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="p-8 flex flex-col items-center justify-center space-y-4 my-auto text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-xs font-semibold">Querying official TNGIS & Tamil Nilam adapters...</p>
        </div>
      ) : data ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar text-xs">

          {/* Parcel Identification Header Bar */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">PARCEL ID / ULPIN</span>
              <span className="font-mono text-xs font-bold text-emerald-400 mt-0.5 block">{data.parcel.parcel_id}</span>
            </div>
            <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1 ${badgeColors[status]}`}>
              <StatusIcon className="w-3 h-3" />
              <span>{data.ownership.status_label || status}</span>
            </div>
          </div>

          {/* Officer Authentication Toggle Banner */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <KeyRound className={`w-4 h-4 ${isOfficer ? 'text-emerald-400' : 'text-slate-400'}`} />
              <div>
                <span className="text-[10px] font-bold text-slate-200 block uppercase tracking-wider">NODAL OFFICER MODE</span>
                <span className="text-[9px] text-slate-400 block">{isOfficer ? 'Authenticated Session Active' : 'Public Privacy Mode Active'}</span>
              </div>
            </div>
            <button
              onClick={() => onToggleOfficer?.(!isOfficer)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all border ${
                isOfficer
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
              }`}
            >
              {isOfficer ? 'Officer View ON' : 'Authenticate'}
            </button>
          </div>

          {/* SECTION 1: LOCATION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">LOCATION</span>
              <span className="text-[10px] text-blue-400 font-medium">TNGIS Spatial Index</span>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">District</span>
                <span className="font-semibold text-white mt-0.5 block text-xs">{data.parcel.district}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Taluk</span>
                <span className="font-semibold text-white mt-0.5 block text-xs">{data.parcel.taluk}</span>
              </div>
              <div className="col-span-2 mt-1">
                <span className="text-[10px] text-slate-400 block font-medium">Village</span>
                <span className="font-semibold text-white mt-0.5 block text-xs">{data.parcel.village}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: SURVEY */}
          <div className="space-y-2">
            <div className="pb-1 border-b border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">SURVEY</span>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800/80 font-mono">
              <div>
                <span className="text-[9px] text-slate-400 block font-sans">Survey No.</span>
                <span className="font-bold text-slate-100 text-xs mt-0.5 block">{data.parcel.survey_number}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-sans">Subdivision</span>
                <span className="font-bold text-slate-100 text-xs mt-0.5 block">{data.parcel.subdivision_number}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-sans">Patta No.</span>
                <span className="font-bold text-emerald-400 text-[11px] mt-0.5 block truncate" title={data.land.patta_number}>{data.land.patta_number}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: LAND */}
          <div className="space-y-2">
            <div className="pb-1 border-b border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">LAND</span>
            </div>
            <div className="space-y-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800/80">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Land Type</span>
                <span className="font-semibold text-slate-100 bg-slate-700/60 px-2 py-0.5 rounded text-[11px]">{data.land.land_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Extent</span>
                <span className="font-mono font-semibold text-slate-100">{data.land.extent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tax</span>
                <span className="font-mono font-semibold text-emerald-400">{data.land.tax}</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: OWNERSHIP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">OWNERSHIP</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${badgeColors[status]}`}>
                {status}
              </span>
            </div>
            
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800/80 space-y-2">
              {status === "AVAILABLE" && data.ownership.records.length > 0 ? (
                data.ownership.records.map((rec, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Owner</span>
                      <span className="font-semibold text-white">{rec.owner_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Relation</span>
                      <span className="text-slate-300">{rec.relation_type || 'Son of'} {rec.relation_name || '-'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[11px] leading-relaxed space-y-2">
                  <div className="font-bold flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Official data source not connected</span>
                  </div>
                  <p className="text-[10px] text-amber-400/80">
                    {data.ownership.message || 'Private land-owner information protected under TN e-Governance policy.'}
                  </p>
                  <button
                    onClick={() => onToggleOfficer?.(true)}
                    className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[10px] font-bold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Authenticate as Nodal Officer</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: GIS */}
          <div className="space-y-2">
            <div className="pb-1 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">GIS</span>
              <button
                onClick={handleCopyCoords}
                className="flex items-center space-x-1 text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy Coords"}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800/80 font-mono">
              <div>
                <span className="text-[9px] text-slate-400 block font-sans">Area</span>
                <span className="font-bold text-slate-100 text-xs mt-0.5 block">{data.gis.area_sqft.toLocaleString()} sq.ft</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-sans">Coordinates</span>
                <span className="font-bold text-slate-100 text-[10px] mt-0.5 block truncate">
                  {data.gis.latitude.toFixed(4)}°, {data.gis.longitude.toFixed(4)}°
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 6: SOURCE */}
          <div className="space-y-2 pt-1">
            <div className="pb-1 border-b border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">SOURCE</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  <span>TNGIS Spatial Platform</span>
                </span>
                <span className="font-mono text-slate-300">Live Spatial API</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                  <span>Tamil Nilam / A-Register</span>
                </span>
                <span className="font-mono text-slate-300">{status}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-slate-500">
                <span>Last verified</span>
                <span className="font-mono">{new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
