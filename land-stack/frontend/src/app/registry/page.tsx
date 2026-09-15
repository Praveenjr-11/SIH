"use client";

import { useEffect, useState } from "react";
import { Parcel } from "@/types";
import { fetchParcels } from "@/services/api";
import { Search, Filter, ShieldCheck, AlertCircle, Scale, Building2, Receipt } from "lucide-react";
import ParcelInspector from "@/components/ParcelInspector";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";

export default function RegistryPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchParcels(statusFilter === "all" ? undefined : statusFilter, search);
      setParcels(data);
      setLoading(false);
    }
    load();
  }, [search, statusFilter]);

  return (
    <OfficerProtectedGuard>
      <div className="p-8 max-w-7xl mx-auto space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900">Cadastral Land Registry Ledger</h1>
            <span className="text-xs bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
              SIH26014 Interoperable DPI
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            ULPIN 14-Digit Key • Integrated Zoning, Property Tax & Court Litigation Registry
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search ULPIN, Survey No, Owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 shadow-xs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs font-medium"
          >
            <option value="all">All Legal Statuses</option>
            <option value="Verified">Verified / Clear Title</option>
            <option value="Disputed">Disputed / Stay Order</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm font-medium">Loading land registry records...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">ULPIN & Survey No</th>
                <th className="p-4">Owner & Location</th>
                <th className="p-4">Master Plan Zoning</th>
                <th className="p-4">Property Tax & Valuation</th>
                <th className="p-4">Court Case Status</th>
                <th className="p-4">GSI Geohazard</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {parcels.map((parcel) => {
                const courtStatus = parcel.courtCaseDetails?.status || (parcel.encumbranceStatus === "Disputed" ? "Stay Order Issued" : "Clear Title");
                const isCourtDisputed = courtStatus !== "Clear Title";

                return (
                  <tr
                    key={parcel.ulpin}
                    onClick={() => setSelectedParcel(parcel)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <span className="font-mono font-bold text-blue-700 block text-xs">{parcel.ulpin}</span>
                      <span className="text-[11px] text-slate-500 font-semibold">S.No {parcel.surveyNumber} ({parcel.areaAcres} Acres)</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{parcel.ownerName}</span>
                      <span className="text-[11px] text-slate-500">{parcel.village}, {parcel.district}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-blue-900 block flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{parcel.zoningDetails?.zoneCategory || parcel.landClassification}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">FSI: {parcel.zoningDetails?.permissibleFSI || '2.00'}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-emerald-800 block flex items-center space-x-1">
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{parcel.propertyTaxDetails?.totalValuation || `₹ ${(parcel.areaAcres * 1.65).toFixed(2)} Cr`}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Tax: {parcel.propertyTaxDetails?.taxStatus || 'Paid'}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          isCourtDisputed
                            ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        <Scale className="w-3 h-3" />
                        <span>{courtStatus}</span>
                      </span>
                      {parcel.courtCaseDetails?.caseId && parcel.courtCaseDetails.caseId !== "None" && (
                        <span className="text-[10px] text-red-600 font-mono block mt-0.5 font-bold">
                          {parcel.courtCaseDetails.caseId}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {parcel.gsiGeology.landslideRiskLevel} Risk ({parcel.gsiGeology.soilBearingCapacityKPa} kPa)
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedParcel(parcel);
                        }}
                        className="px-3 py-1.5 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-700 font-semibold rounded-lg border border-blue-200 group-hover:border-blue-600 text-xs transition-all shadow-2xs"
                      >
                        Inspect Land
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedParcel && (
        <ParcelInspector parcel={selectedParcel} onClose={() => setSelectedParcel(null)} />
      )}
    </div>
    </OfficerProtectedGuard>
  );
}

