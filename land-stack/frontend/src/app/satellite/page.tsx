"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Satellite, 
  ArrowLeft, 
  Layers, 
  Sliders, 
  Eye, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  ExternalLink, 
  Info, 
  Maximize2, 
  Split, 
  Grid, 
  Check, 
  Compass, 
  Building2, 
  Trees, 
  Crop, 
  Clock, 
  Download,
  FileCheck2,
  RefreshCw
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";
import ParcelInspector from "@/components/ParcelInspector";
import { Parcel } from "@/types";

// CHANGE CATEGORY TYPES
export type ChangeCategory = 
  | "Potential Construction"
  | "Land Use Change"
  | "Vegetation Change"
  | "Boundary Change"
  | "Other Change";

export interface SatelliteDetectionRecord {
  id: string;
  ulpin: string;
  surveyNumber: string;
  district: string;
  village: string;
  taluk: string;
  category: ChangeCategory;
  detectedChange: string;
  detectionDate: string;
  baselineDate: string;
  source: string;
  confidence: number;
  verificationStatus: "PENDING_INSPECTION" | "OFFICER_VERIFIED" | "FLAGGED_VIOLATION" | "CLEARED" | "DISPATCHED";
  statutoryImplication: string;
  radiometricIndex: string;
  spectralDetails: {
    deltaNdbi?: string;
    deltaNdvi?: string;
    deltaNdwi?: string;
    resolution: string;
    cloudCover: string;
    algorithm: string;
    reasoning: string;
  };
  parcelExtentAcres: number;
  changeAreaSqFt: number;
  ownerName: string;
  beforeVisual: {
    label: string;
    type: "agricultural" | "scrub" | "fallow" | "waterbody" | "residential";
    accentColor: string;
  };
  afterVisual: {
    label: string;
    type: "construction" | "gravel_yard" | "cleared_vegetation" | "encroachment" | "excavation";
    accentColor: string;
  };
  changeCoords: { x: number; y: number; width: number; height: number };
}

// BENCHMARK REALISTIC CHANGE DETECTION DATASET
const SAMPLE_DETECTIONS: SatelliteDetectionRecord[] = [
  {
    id: "SAT-2026-KNC-001",
    ulpin: "TN33010001004",
    surveyNumber: "171/3A",
    district: "Kanchipuram",
    village: "Pennalur",
    taluk: "Sriperumbudur",
    category: "Potential Construction",
    detectedChange: "New Structural Footprint: 4,850 sq.ft Foundation Excavation in Open Zone",
    detectionDate: "12 Aug 2026",
    baselineDate: "14 Jan 2025",
    source: "Cartosat-3 (0.28m PAN) + Sentinel-2 MSI (10m)",
    confidence: 94.2,
    verificationStatus: "PENDING_INSPECTION",
    statutoryImplication: "No DTCP building plan sanction record found in Single Window Portal database for S.No 171/3A.",
    radiometricIndex: "ΔNDBI +0.48 (Built-up Reflectance)",
    spectralDetails: {
      deltaNdbi: "+0.48",
      deltaNdvi: "-0.38",
      resolution: "0.28m PAN / 10m Multi-spectral",
      cloudCover: "<1.2%",
      algorithm: "Normalized Difference Change Vector Analysis (NDCVA) + CNN Building Feature Segmenter",
      reasoning: "Persistent rectangular high-reflectance signature confirmed across 3 consecutive cloud-free passes."
    },
    parcelExtentAcres: 2.55,
    changeAreaSqFt: 4850,
    ownerName: "Thiru K. Muthusamy & Family",
    beforeVisual: {
      label: "Fallow Agricultural Plot (Jan 2025)",
      type: "fallow",
      accentColor: "#4B5563"
    },
    afterVisual: {
      label: "Poured Concrete Plinth & Foundation (Aug 2026)",
      type: "construction",
      accentColor: "#D9363E"
    },
    changeCoords: { x: 38, y: 35, width: 34, height: 32 }
  },
  {
    id: "SAT-2026-KNC-002",
    ulpin: "IN-TN-11-1819A-81507230",
    surveyNumber: "181/9A",
    district: "Kanchipuram",
    village: "Pennalur",
    taluk: "Sriperumbudur",
    category: "Land Use Change",
    detectedChange: "Wetland (Nanjai) to Commercial Staging Yard: 2.10 Acres leveled with gravel filling",
    detectionDate: "28 Jul 2026",
    baselineDate: "10 Feb 2025",
    source: "Sentinel-2 L2A BOA Reflectance (10m)",
    confidence: 91.8,
    verificationStatus: "PENDING_INSPECTION",
    statutoryImplication: "Potential violation of Tamil Nadu Act 20 of 2000 (Mandatory restriction on conversion of wetland).",
    radiometricIndex: "ΔNDWI -0.62 (Surface Moisture Depletion)",
    spectralDetails: {
      deltaNdbi: "+0.32",
      deltaNdwi: "-0.62",
      resolution: "10m Optical Multi-Spectral",
      cloudCover: "0.8%",
      algorithm: "Temporal LULC Transition Classifier (Random Forest + Sentinel-2 SWIR/NIR bands)",
      reasoning: "Loss of seasonal vegetative moisture curve and abrupt surface compaction signature."
    },
    parcelExtentAcres: 2.55,
    changeAreaSqFt: 91470,
    ownerName: "Thiru K. Ramaswamy & Family",
    beforeVisual: {
      label: "Irrigated Paddy Wetland (Feb 2025)",
      type: "agricultural",
      accentColor: "#16845B"
    },
    afterVisual: {
      label: "Commercial Gravel Staging Yard (Jul 2026)",
      type: "gravel_yard",
      accentColor: "#E99A16"
    },
    changeCoords: { x: 25, y: 22, width: 52, height: 50 }
  },
  {
    id: "SAT-2026-CHG-003",
    ulpin: "TN33020002142",
    surveyNumber: "214/2C",
    district: "Chengalpattu",
    village: "Mahabalipuram",
    taluk: "Chengalpattu Town",
    category: "Vegetation Change",
    detectedChange: "Canopy Cover Depletion: 0.85 Acres coastal littoral scrub and casuarina felling in CRZ-II buffer",
    detectionDate: "15 Jul 2026",
    baselineDate: "04 Dec 2024",
    source: "Sentinel-2 Red-Edge Timeseries",
    confidence: 88.6,
    verificationStatus: "FLAGGED_VIOLATION",
    statutoryImplication: "Coastal Regulation Zone (CRZ-II) environmental buffer protection clearance mandatory.",
    radiometricIndex: "ΔNDVI -0.54 (Photosynthetic Loss)",
    spectralDetails: {
      deltaNdvi: "-0.54",
      resolution: "10m Red-Edge / NIR",
      cloudCover: "1.5%",
      algorithm: "Spectral Canopy Density (FVC) Temporal Differencing",
      reasoning: "Sharp step-down in NIR reflectance consistent with extensive mechanical clear-felling."
    },
    parcelExtentAcres: 3.20,
    changeAreaSqFt: 37026,
    ownerName: "Tmt. V. Lakshmi Devi",
    beforeVisual: {
      label: "Coastal Littoral Casuarina Canopy (Dec 2024)",
      type: "scrub",
      accentColor: "#059669"
    },
    afterVisual: {
      label: "Cleared Sandy Surface (Jul 2026)",
      type: "cleared_vegetation",
      accentColor: "#EA580C"
    },
    changeCoords: { x: 30, y: 30, width: 44, height: 42 }
  },
  {
    id: "SAT-2026-TRV-004",
    ulpin: "TN33030001085",
    surveyNumber: "108/5B",
    district: "Thiruvallur",
    village: "Avadi",
    taluk: "Avadi",
    category: "Boundary Change",
    detectedChange: "Cadastral Boundary Encroachment: 14.5m lateral boundary shift into Revenue Channel Poramboke",
    detectionDate: "02 Aug 2026",
    baselineDate: "18 Oct 2024",
    source: "Cartosat-3 Ortho-Rectified Boundary Vector Overlay",
    confidence: 89.3,
    verificationStatus: "FLAGGED_VIOLATION",
    statutoryImplication: "Encroachment detected on Water Resources Dept (PWD-WRD) irrigation supply channel (Vari Poramboke).",
    radiometricIndex: "Boundary Deviation: +14.5m vs FMB",
    spectralDetails: {
      resolution: "0.28m PAN Sub-meter",
      cloudCover: "0.2%",
      algorithm: "Sub-meter Edge Detector & FMB Cadastral Vector Vectorization",
      reasoning: "Linear boundary wall feature extends past statutory survey boundary by 14.5 meters."
    },
    parcelExtentAcres: 1.80,
    changeAreaSqFt: 6200,
    ownerName: "Ambattur Infrastructure Parks Ltd",
    beforeVisual: {
      label: "Clear Channel Buffer & FMB Berm (Oct 2024)",
      type: "waterbody",
      accentColor: "#0284C7"
    },
    afterVisual: {
      label: "Encroached Compound Wall & Earth Filling (Aug 2026)",
      type: "encroachment",
      accentColor: "#DC2626"
    },
    changeCoords: { x: 55, y: 15, width: 35, height: 65 }
  },
  {
    id: "SAT-2026-KNC-005",
    ulpin: "TN33010003121",
    surveyNumber: "312/1",
    district: "Kanchipuram",
    village: "Pennalur",
    taluk: "Sriperumbudur",
    category: "Other Change",
    detectedChange: "Lake Inlet Silt Excavation: 1,800 sq.m earth-moving along waterbody catchment boundary",
    detectionDate: "20 Jun 2026",
    baselineDate: "12 Jan 2025",
    source: "ISRO Bhuvan CartoDEM + Sentinel-2 SWIR",
    confidence: 86.5,
    verificationStatus: "PENDING_INSPECTION",
    statutoryImplication: "Protected under Tamil Nadu Protection of Tanks and Eviction of Encroachment Act, 2007.",
    radiometricIndex: "ΔElevation -1.8m & Turbidity Index +42%",
    spectralDetails: {
      deltaNdwi: "+0.28",
      resolution: "2.5m DEM / 10m SWIR",
      cloudCover: "0.4%",
      algorithm: "Hydro-Geomorphic Topographic Differencing",
      reasoning: "Significant elevation depression indicating mechanical earth excavation along reservoir weir."
    },
    parcelExtentAcres: 4.80,
    changeAreaSqFt: 19375,
    ownerName: "Public Works Dept (WRD) Buffer",
    beforeVisual: {
      label: "Natural Lake Buffer & Silt Basin (Jan 2025)",
      type: "waterbody",
      accentColor: "#0369A1"
    },
    afterVisual: {
      label: "Active Excavation Pit & Soil Mounds (Jun 2026)",
      type: "excavation",
      accentColor: "#B45309"
    },
    changeCoords: { x: 20, y: 40, width: 45, height: 40 }
  },
  {
    id: "SAT-2026-KNC-006",
    ulpin: "TN33010001339",
    surveyNumber: "133/9D",
    district: "Kanchipuram",
    village: "Oragadam",
    taluk: "Sriperumbudur",
    category: "Land Use Change",
    detectedChange: "Dryland (Punjai) to Industrial Auto Parts Warehouse: 3.40 Acres",
    detectionDate: "05 Aug 2026",
    baselineDate: "22 Jan 2025",
    source: "Sentinel-2 LULC Automated Classifier",
    confidence: 95.1,
    verificationStatus: "OFFICER_VERIFIED",
    statutoryImplication: "Authorized Development: Approved under Case CASE-2026-TN-01-100004.",
    radiometricIndex: "ΔNDBI +0.52 & TIR Temp +2.8°C",
    spectralDetails: {
      deltaNdbi: "+0.52",
      resolution: "10m Optical & Thermal Infrared",
      cloudCover: "0.0%",
      algorithm: "Thermal Infrared (TIR) Surface Albedo & Built-up Index Convergence",
      reasoning: "Metallic roofing spectral signature matching approved warehouse layout plans."
    },
    parcelExtentAcres: 3.40,
    changeAreaSqFt: 148100,
    ownerName: "Renault-Nissan Suppliers Hub",
    beforeVisual: {
      label: "Open Dry Fallow Land (Jan 2025)",
      type: "fallow",
      accentColor: "#6B7280"
    },
    afterVisual: {
      label: "Engineered Industrial Warehouse (Aug 2026)",
      type: "construction",
      accentColor: "#16845B"
    },
    changeCoords: { x: 20, y: 20, width: 60, height: 60 }
  }
];

export default function SatelliteChangeDetectionPage() {
  const { officer } = useOfficerAuth();

  // SELECTION CONTROLS (ALLOW)
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Kanchipuram");
  const [selectedVillage, setSelectedVillage] = useState<string>("Pennalur");
  const [selectedParcelId, setSelectedParcelId] = useState<string>("SAT-2026-KNC-001");
  const [dateRange, setDateRange] = useState<string>("BASELINE_18M");
  
  // CATEGORY FILTER
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");

  // VIEW MODES
  const [viewMode, setViewMode] = useState<"SPLIT_SLIDER" | "SIDE_BY_SIDE">("SPLIT_SLIDER");
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [showChangeMask, setShowChangeMask] = useState<boolean>(true);
  const [showCadastralBorders, setShowCadastralBorders] = useState<boolean>(true);

  // ACTION STATES
  const [selectedParcelForInspector, setSelectedParcelForInspector] = useState<Parcel | null>(null);
  const [dispatchedRecords, setDispatchedRecords] = useState<{ [id: string]: boolean }>({});
  const [showVerificationToast, setShowVerificationToast] = useState<string | null>(null);

  // Active detection record
  const activeRecord = useMemo(() => {
    return SAMPLE_DETECTIONS.find(d => d.id === selectedParcelId) || SAMPLE_DETECTIONS[0];
  }, [selectedParcelId]);

  // Distinct districts & villages
  const districtsList = useMemo(() => {
    return Array.from(new Set(SAMPLE_DETECTIONS.map(d => d.district)));
  }, []);

  const villagesList = useMemo(() => {
    return Array.from(new Set(SAMPLE_DETECTIONS.filter(d => d.district === selectedDistrict).map(d => d.village)));
  }, [selectedDistrict]);

  const availableParcels = useMemo(() => {
    return SAMPLE_DETECTIONS.filter(d => d.district === selectedDistrict && d.village === selectedVillage);
  }, [selectedDistrict, selectedVillage]);

  // Filtered list of detections
  const filteredDetections = useMemo(() => {
    return SAMPLE_DETECTIONS.filter(d => {
      const matchCat = activeCategoryFilter === "ALL" || d.category === activeCategoryFilter;
      const matchDist = selectedDistrict === "ALL_DISTRICTS" || d.district === selectedDistrict;
      return matchCat && matchDist;
    });
  }, [activeCategoryFilter, selectedDistrict]);

  // Handle Send for Verification
  const handleSendForVerification = (record: SatelliteDetectionRecord) => {
    setDispatchedRecords(prev => ({ ...prev, [record.id]: true }));
    setShowVerificationToast(`Field inspection summons generated for Taluk Surveyor (${record.taluk}) • Ref: INSP-2026-${record.surveyNumber.replace('/', '-')}`);
    setTimeout(() => {
      setShowVerificationToast(null);
    }, 4500);
  };

  // Convert detection to Parcel for ParcelInspector
  const handleOpenInspector = (record: SatelliteDetectionRecord) => {
    const parcelData: Parcel = {
      id: record.id,
      ulpin: record.ulpin,
      surveyNumber: record.surveyNumber,
      village: record.village,
      taluk: record.taluk,
      district: record.district,
      state: "Tamil Nadu",
      areaAcres: record.parcelExtentAcres,
      areaSqMeters: Math.round(record.parcelExtentAcres * 4046.86),
      landClassification: record.category === "Potential Construction" ? "Punjai (Dry)" : "Nanjai (Wet)",
      currentUse: record.category,
      ownerName: record.ownerName,
      ownerAadhaarHash: "SHA256:8f4b...c91a",
      registrationDocNo: `DOC-2024-SRO-${record.id.slice(-4)}`,
      registrationDate: "12-Jan-2024",
      encumbranceStatus: record.verificationStatus === "FLAGGED_VIOLATION" ? "Disputed" : "Clear",
      verificationStatus: record.verificationStatus === "FLAGGED_VIOLATION" ? "Disputed" : "Verified",
      coordinates: [[[79.96, 12.94], [79.97, 12.94], [79.97, 12.95], [79.96, 12.95], [79.96, 12.94]]],
      center: [12.9433, 79.9687],
      zoningDetails: {
        masterPlanAuthority: "DTCP / CMDA",
        zoneCategory: record.category === "Potential Construction" ? "Agricultural Zone (Unapproved Plinth)" : "Residential / Mixed Zone",
        permissibleFSI: "1.5 FSI",
        maxHeightMeters: 15,
        setbacks: "3m Front, 1.5m Side"
      },
      propertyTaxDetails: {
        taxAssessmentId: `PTAX-2026-${record.surveyNumber.replace('/', '-')}`,
        taxStatus: "Paid",
        annualTaxAmount: "₹ 4,250",
        guidelineValueSqFt: "₹ 2,850",
        totalValuation: "₹ 48.5 Lakhs",
        wardNo: "Ward 04"
      },
      courtCaseDetails: record.category === "Boundary Change" ? {
        status: "Stay Order Issued",
        caseId: "OS-412/2025",
        courtName: "District Munsif Court, Sriperumbudur",
        caseType: "Vari Poramboke Encroachment Injunction",
        stayOrderDetails: "Interim injunction stay applied against construction",
        hearingDate: "24-Oct-2026"
      } : {
        status: "Clear Title"
      },
      gsiGeology: {
        rockFormation: "Peninsular Gneissic Complex",
        lithology: "Weathered Granitic Massif",
        geomorphologyUnit: "Pediment Inselberg Complex",
        soilBearingCapacityKPa: 250,
        landslideRiskLevel: "Low",
        seismicZone: "Zone II",
        floodHazardIndex: "Low",
        groundwaterDepthMeters: 7.5,
        gsiReportId: "GSI-TN-2024-082",
        lastSurveyYear: 2024
      },
      digitalFacets: {
        ulpinCadastralId: record.ulpin,
        rorOwnership: "Patta Chitta Verified (Tamil Nilam CLA)",
        encumbranceCertificate: "Nil Encumbrance (TNREGINET)",
        registrationHistory: "13-Year Clean Title Chain",
        taxAssessment: "Current Assessment Paid",
        soilAndAgriculture: "Red Loamy Soil (Peninsular Gneissic)",
        gisSpatialPolygon: "DGPS Survey Verified (0.02m precision)",
        gsiGeoscientificRisk: "Low Hazard Index (Zone II Seismic)",
        isroSatelliteLandUse: `NRSC Sentinel-2 ${record.category}`,
        utilityInfrastructure: "TNEB Power & Water Pipeline Feasibility Verified",
        courtCaseStatus: record.category === "Boundary Change" ? "Stay Order Active" : "Clear Title",
        zoningMasterPlan: "Master Plan Conformance Verified"
      }
    };

    setSelectedParcelForInspector(parcelData);
  };

  return (
    <OfficerProtectedGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7 font-sans antialiased pb-24">
        
        {/* TOAST CONFIRMATION */}
        {showVerificationToast && (
          <div className="fixed top-6 right-6 z-50 bg-[#102A43] text-white p-4 rounded-xl border border-[#CCE0FD] shadow-2xl flex items-center space-x-3 text-xs animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-5 h-5 text-[#16845B] shrink-0" />
            <div>
              <strong className="block text-white font-bold">Summons Dispatched to Ground Survey</strong>
              <span className="text-slate-300">{showVerificationToast}</span>
            </div>
            <button 
              onClick={() => setShowVerificationToast(null)}
              className="text-slate-400 hover:text-white ml-2 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3E8EF] pb-5">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <Link 
                href="/officer/dashboard" 
                className="text-xs text-[#1D5FD1] hover:text-[#154CB0] font-semibold flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Officer Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#102A43] flex items-center gap-2.5">
                <Satellite className="w-7 h-7 text-[#1D5FD1]" />
                <span>Satellite Change Detection</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30 uppercase">
                NRSC / Sentinel-2 Feed
              </span>
            </div>
            <p className="text-xs text-[#53627A] mt-1">
              Automated Earth Observation & Cadastral Change Intelligence • Optical and radiometric discrepancy monitoring across Tamil Nadu revenue parcels.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Link
              href="/map"
              className="px-3.5 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#102A43] font-semibold text-xs border border-[#E3E8EF] transition-colors shadow-2xs flex items-center space-x-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-[#53627A]" />
              <span>Full GIS Map</span>
            </Link>

            <Link
              href="/officer/cases"
              className="px-3.5 py-2 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs transition-colors shadow-2xs flex items-center space-x-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Statutory Cases</span>
            </Link>
          </div>
        </div>

        {/* STATUTORY EXPLAINABLE ADVISORY (DO NOT MAKE UNSUPPORTED CLAIMS) */}
        <div className="bg-[#F1F5FB] border border-[#CCE0FD] p-4 rounded-xl text-xs space-y-1 text-[#53627A]">
          <div className="flex items-center space-x-2 text-[#102A43] font-bold">
            <Info className="w-4 h-4 text-[#1D5FD1]" />
            <span>Automated Remote Sensing Observation Advisory (Verification Protocol)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#53627A]">
            Detected anomalies represent statistical spectral reflectance shifts (ΔNDBI built-up index, ΔNDVI vegetation index, and ΔNDWI hydrology index) captured by ISRO Cartosat-3 and ESA Sentinel-2 constellations. <strong>All automated change detections require mandatory ground-truthing</strong> by the jurisdictional Taluk Revenue Surveyor under Section 9 of the Tamil Nadu Survey and Boundaries Act before statutory notices or stop-work orders are issued.
          </p>
        </div>

        {/* SELECTION CONTROLS BAR (ALLOW: Select District, Select Village, Select Parcel, Select Date Range) */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-2.5">
            <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#1D5FD1]" />
              <span>Target Parcel & Temporal Window Selection</span>
            </span>
            <span className="text-[11px] text-[#53627A] font-mono">
              6 Active Change Anomaly Records
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            
            {/* 1. SELECT DISTRICT */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Select District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  const firstVill = SAMPLE_DETECTIONS.find(d => d.district === e.target.value)?.village || "";
                  setSelectedVillage(firstVill);
                  const firstP = SAMPLE_DETECTIONS.find(d => d.district === e.target.value && d.village === firstVill)?.id || "";
                  if (firstP) setSelectedParcelId(firstP);
                }}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-lg px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                {districtsList.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            {/* 2. SELECT VILLAGE */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Select Village
              </label>
              <select
                value={selectedVillage}
                onChange={(e) => {
                  setSelectedVillage(e.target.value);
                  const firstP = SAMPLE_DETECTIONS.find(d => d.district === selectedDistrict && d.village === e.target.value)?.id || "";
                  if (firstP) setSelectedParcelId(firstP);
                }}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-lg px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                {villagesList.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* 3. SELECT PARCEL */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Select Parcel
              </label>
              <select
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-lg px-2.5 py-2 text-xs text-[#102A43] font-mono font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                {availableParcels.map(p => (
                  <option key={p.id} value={p.id}>
                    S.No {p.surveyNumber} • {p.category}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. SELECT DATE RANGE */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Select Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-lg px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="BASELINE_18M">Jan 2025 vs Aug 2026 (18-Mo Baseline)</option>
                <option value="BASELINE_12M">Jul 2025 vs Aug 2026 (1-Yr Baseline)</option>
                <option value="BASELINE_6M">Jan 2026 vs Aug 2026 (6-Mo Rapid)</option>
                <option value="BASELINE_24M">Aug 2024 vs Aug 2026 (2-Yr Historical)</option>
              </select>
            </div>

          </div>
        </div>

        {/* SATELLITE COMPARISON VIEWER (SHOW: Before Satellite Image, After Satellite Image, Highlight detected parcel changes) */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl shadow-xs overflow-hidden space-y-0">
          
          {/* VIEWER TOOLBAR */}
          <div className="p-4 bg-[#F8FAFD] border-b border-[#E3E8EF] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-xs text-[#1D5FD1]">{activeRecord.ulpin}</span>
                <span className="text-xs text-[#53627A]">•</span>
                <strong className="text-xs text-[#102A43]">Survey No. {activeRecord.surveyNumber}</strong>
                <span className="text-xs text-[#53627A]">({activeRecord.village}, {activeRecord.district})</span>
              </div>
              <p className="text-[11px] text-[#D9363E] font-semibold mt-0.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{activeRecord.detectedChange}</span>
              </p>
            </div>

            {/* CONTROLS: VIEW TOGGLE & MASK SWITCHES */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              
              {/* TOGGLE MASK */}
              <button
                onClick={() => setShowChangeMask(!showChangeMask)}
                className={`px-2.5 py-1.5 rounded-md font-semibold text-xs border transition-colors flex items-center space-x-1.5 ${
                  showChangeMask 
                    ? "bg-[#FDEDEE] text-[#D9363E] border-[#D9363E]/30" 
                    : "bg-white text-[#53627A] border-[#E3E8EF]"
                }`}
                title="Toggle visual change anomaly mask"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Highlight Changes</span>
              </button>

              {/* TOGGLE CADASTRAL BOUNDARIES */}
              <button
                onClick={() => setShowCadastralBorders(!showCadastralBorders)}
                className={`px-2.5 py-1.5 rounded-md font-semibold text-xs border transition-colors flex items-center space-x-1.5 ${
                  showCadastralBorders 
                    ? "bg-[#F1F5FB] text-[#1D5FD1] border-[#CCE0FD]" 
                    : "bg-white text-[#53627A] border-[#E3E8EF]"
                }`}
                title="Toggle FMB revenue survey boundaries"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>FMB Boundary</span>
              </button>

              {/* MODE: SLIDER VS SIDE BY SIDE */}
              <div className="flex items-center space-x-1 bg-white p-0.5 rounded-md border border-[#E3E8EF]">
                <button
                  onClick={() => setViewMode("SPLIT_SLIDER")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1 ${
                    viewMode === "SPLIT_SLIDER" ? "bg-[#1D5FD1] text-white" : "text-[#53627A]"
                  }`}
                >
                  <Split className="w-3 h-3" />
                  <span>Interactive Split</span>
                </button>
                <button
                  onClick={() => setViewMode("SIDE_BY_SIDE")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1 ${
                    viewMode === "SIDE_BY_SIDE" ? "bg-[#1D5FD1] text-white" : "text-[#53627A]"
                  }`}
                >
                  <Grid className="w-3 h-3" />
                  <span>Side-by-Side</span>
                </button>
              </div>

            </div>
          </div>

          {/* MAIN SATELLITE CANVAS CONTAINER */}
          <div className="p-5 bg-[#0B1521]">
            
            {viewMode === "SPLIT_SLIDER" ? (
              /* INTERACTIVE SPLIT SLIDER COMPARISON */
              <div className="space-y-3">
                <div className="relative w-full h-[400px] sm:h-[460px] rounded-xl overflow-hidden select-none border border-slate-700 shadow-inner bg-[#1A2634]">
                  
                  {/* AFTER IMAGE (UNDERNEATH) */}
                  <div 
                    className="absolute inset-0 bg-[#0B1521] bg-cover bg-center"
                    style={{
                      backgroundImage: "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/16/30043/47328.jpg')"
                    }}
                  >
                    {/* Simulated Satellite Terrain Texture Overlay (After) */}
                    <div className="w-full h-full relative bg-black/40">
                      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                      
                      {/* After Visual Feature (e.g. New concrete plinth / excavation) */}
                      <div 
                        className="absolute border-2 border-dashed border-red-400 bg-red-950/60 rounded flex items-center justify-center p-2 text-center backdrop-blur-[1px]"
                        style={{
                          left: `${activeRecord.changeCoords.x}%`,
                          top: `${activeRecord.changeCoords.y}%`,
                          width: `${activeRecord.changeCoords.width}%`,
                          height: `${activeRecord.changeCoords.height}%`
                        }}
                      >
                        {showChangeMask && (
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded bg-red-600/90 text-white font-mono text-[10px] font-bold uppercase shadow-sm inline-block">
                              Detected: {activeRecord.category}
                            </span>
                            <p className="text-[10px] text-red-200 font-medium hidden sm:block">
                              ΔNDBI: {activeRecord.spectralDetails.deltaNdbi || '+0.48'} (Area: {activeRecord.changeAreaSqFt.toLocaleString()} sq.ft)
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Cadastral Boundary Overlay */}
                      {showCadastralBorders && (
                        <div className="absolute inset-10 border-2 border-yellow-400/80 rounded-lg pointer-events-none">
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-yellow-300 font-mono text-[9px] font-bold">
                            Parcel S.No {activeRecord.surveyNumber} ({activeRecord.parcelExtentAcres} Acres)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* After Label Badge */}
                    <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-xs border border-white/20 text-white text-xs font-mono">
                      <strong className="text-emerald-400 block font-sans text-[11px] uppercase tracking-wider">After Satellite Capture</strong>
                      <span>{activeRecord.detectionDate} • Cartosat-3 / Sentinel-2</span>
                    </div>
                  </div>

                  {/* BEFORE IMAGE (CLIPPED OVERLAY VIA SLIDER) */}
                  <div 
                    className="absolute inset-0 bg-[#0B1521] bg-cover bg-center border-r-2 border-white shadow-2xl transition-none"
                    style={{ 
                      clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                      backgroundImage: "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/15021/23664.jpg')"
                    }}
                  >
                    {/* Satellite Terrain Texture Overlay (Before) */}
                    <div className="w-full h-full relative bg-emerald-950/30">
                      <div className="absolute inset-0 bg-[radial-gradient(#15803D_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                      
                      {/* Undisturbed Fallow / Agricultural Field */}
                      <div 
                        className="absolute border border-dashed border-emerald-300/40 bg-emerald-900/20 rounded flex items-center justify-center text-center"
                        style={{
                          left: `${activeRecord.changeCoords.x}%`,
                          top: `${activeRecord.changeCoords.y}%`,
                          width: `${activeRecord.changeCoords.width}%`,
                          height: `${activeRecord.changeCoords.height}%`
                        }}
                      >
                        <span className="px-2 py-0.5 rounded bg-black/60 text-emerald-300 font-mono text-[9px]">
                          Baseline Surface (Undisturbed)
                        </span>
                      </div>

                      {/* Cadastral Boundary Overlay */}
                      {showCadastralBorders && (
                        <div className="absolute inset-10 border-2 border-yellow-400/80 rounded-lg pointer-events-none"></div>
                      )}
                    </div>

                    {/* Before Label Badge */}
                    <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-xs border border-white/20 text-white text-xs font-mono">
                      <strong className="text-slate-300 block font-sans text-[11px] uppercase tracking-wider">Before Satellite Capture</strong>
                      <span>{activeRecord.baselineDate} • Sentinel-2 Multi-Spectral</span>
                    </div>
                  </div>

                  {/* SLIDER DIVIDER LINE & HANDLE */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 pointer-events-none shadow-lg"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-[#102A43] flex items-center justify-center font-bold text-xs shadow-xl border-2 border-[#1D5FD1]">
                      ⇄
                    </div>
                  </div>

                </div>

                {/* RANGE SLIDER INPUT */}
                <div className="flex items-center space-x-3 text-xs text-slate-300 px-2">
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">Baseline: {activeRecord.baselineDate}</span>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="w-full accent-[#1D5FD1] cursor-pointer"
                  />
                  <span className="font-mono text-[11px] text-emerald-400 shrink-0">Target: {activeRecord.detectionDate}</span>
                </div>
              </div>
            ) : (
              /* SIDE-BY-SIDE SYNCHRONIZED COMPARISON */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* BEFORE SATELLITE IMAGE */}
                <div 
                  className="relative h-[360px] rounded-xl overflow-hidden border border-slate-700 bg-[#0B1521] bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/15021/23664.jpg')"
                  }}
                >
                  <div className="absolute inset-0 bg-emerald-950/30" />
                  <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded bg-black/80 text-white text-[11px] font-mono border border-white/20">
                    <strong className="text-slate-300 block text-[10px] uppercase font-sans">Before Satellite Image</strong>
                    <span>{activeRecord.baselineDate}</span>
                  </div>

                  <div className="w-full h-full relative flex items-center justify-center p-6">
                    <div 
                      className="border-2 border-dashed border-emerald-400/50 bg-emerald-900/40 rounded p-4 text-center space-y-1 backdrop-blur-[1px]"
                      style={{
                        width: `${activeRecord.changeCoords.width}%`,
                        height: `${activeRecord.changeCoords.height}%`
                      }}
                    >
                      <span className="text-[10px] font-mono font-bold text-emerald-300 block">Baseline Surface</span>
                      <p className="text-[10px] text-slate-300 leading-tight">{activeRecord.beforeVisual.label}</p>
                    </div>

                    {showCadastralBorders && (
                      <div className="absolute inset-8 border-2 border-yellow-400/80 rounded-lg pointer-events-none">
                        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-yellow-300 font-mono text-[9px]">
                          S.No {activeRecord.surveyNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* AFTER SATELLITE IMAGE */}
                <div 
                  className="relative h-[360px] rounded-xl overflow-hidden border border-slate-700 bg-[#0B1521] bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/16/30043/47328.jpg')"
                  }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded bg-black/80 text-white text-[11px] font-mono border border-white/20 text-right">
                    <strong className="text-emerald-400 block text-[10px] uppercase font-sans">After Satellite Image</strong>
                    <span>{activeRecord.detectionDate}</span>
                  </div>

                  <div className="w-full h-full relative flex items-center justify-center p-6">
                    <div 
                      className="border-2 border-red-500 bg-red-950/60 rounded p-4 text-center space-y-1 shadow-lg"
                      style={{
                        width: `${activeRecord.changeCoords.width}%`,
                        height: `${activeRecord.changeCoords.height}%`
                      }}
                    >
                      {showChangeMask && (
                        <>
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold uppercase inline-block">
                            {activeRecord.category}
                          </span>
                          <p className="text-[10px] text-red-200 leading-tight">
                            {activeRecord.detectedChange}
                          </p>
                          <span className="text-[9px] font-mono text-yellow-300 block">
                            Confidence: {activeRecord.confidence}%
                          </span>
                        </>
                      )}
                    </div>

                    {showCadastralBorders && (
                      <div className="absolute inset-8 border-2 border-yellow-400/80 rounded-lg pointer-events-none">
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-yellow-300 font-mono text-[9px]">
                          Area: {activeRecord.parcelExtentAcres} Acres
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* EXPLAINABLE SENSOR TELEMETRY METRICS STRIP */}
            <div className="mt-4 p-3 bg-black/60 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-3 font-mono">
              <div>
                <span className="text-slate-400">Optical Sensor: </span>
                <strong className="text-white">{activeRecord.source}</strong>
              </div>
              <div>
                <span className="text-slate-400">Radiometric Index: </span>
                <strong className="text-emerald-400">{activeRecord.radiometricIndex}</strong>
              </div>
              <div>
                <span className="text-slate-400">Cloud Interference: </span>
                <strong className="text-white">{activeRecord.spectralDetails.cloudCover}</strong>
              </div>
              <div>
                <span className="text-slate-400">Confidence Score: </span>
                <strong className="text-yellow-400 font-bold">{activeRecord.confidence}% (Spectral Match)</strong>
              </div>
            </div>

          </div>

        </div>

        {/* DETECTED PARCEL CHANGES TABLE & CATEGORY FILTERING */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl shadow-xs overflow-hidden space-y-4 p-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E8EF] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#102A43]">
                Detected Parcel Changes Catalog
              </h2>
              <p className="text-xs text-[#53627A]">
                Showing {filteredDetections.length} earth observation alerts requiring administrative evaluation
              </p>
            </div>

            {/* FIVE REQUIRED CATEGORIES FILTER PILLS */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                "ALL",
                "Potential Construction",
                "Land Use Change",
                "Vegetation Change",
                "Boundary Change",
                "Other Change"
              ].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    activeCategoryFilter === cat
                      ? "bg-[#1D5FD1] text-white shadow-2xs"
                      : "bg-[#F8FAFD] text-[#53627A] border border-[#E3E8EF] hover:bg-slate-100 hover:text-[#102A43]"
                  }`}
                >
                  {cat === "ALL" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE FOR DETECTED CHANGES */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFD] text-[#53627A] font-bold uppercase tracking-wider text-[11px] border-b border-[#E3E8EF]">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Parcel / ULPIN</th>
                  <th className="px-4 py-3 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 whitespace-nowrap">Detected Change</th>
                  <th className="px-4 py-3 whitespace-nowrap">Source</th>
                  <th className="px-4 py-3 whitespace-nowrap">Confidence</th>
                  <th className="px-4 py-3 whitespace-nowrap">Verification Status</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E3E8EF] text-[#102A43]">
                {filteredDetections.map((rec) => {
                  const isDispatched = dispatchedRecords[rec.id];
                  const isSelected = selectedParcelId === rec.id;

                  return (
                    <tr 
                      key={rec.id}
                      className={`hover:bg-[#F8FAFD] transition-colors h-[54px] ${
                        isSelected ? "bg-[#F1F5FB]/70" : ""
                      }`}
                    >
                      
                      {/* 1. PARCEL / ULPIN */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-[#102A43]">
                          S.No {rec.surveyNumber}
                        </div>
                        <div className="font-mono text-[10px] text-[#53627A]">
                          {rec.ulpin}
                        </div>
                      </td>

                      {/* 2. DATE */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-[#102A43]">{rec.detectionDate}</div>
                        <div className="text-[10px] text-[#53627A]">vs {rec.baselineDate}</div>
                      </td>

                      {/* 3. DETECTED CHANGE */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#102A43] line-clamp-1 max-w-[240px]" title={rec.detectedChange}>
                          {rec.detectedChange}
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#F1F5FB] text-[#1D5FD1] border border-[#CCE0FD]">
                            {rec.category}
                          </span>
                          <span className="text-[10px] text-[#53627A] truncate">
                            ({rec.changeAreaSqFt.toLocaleString()} sq.ft)
                          </span>
                        </div>
                      </td>

                      {/* 4. SOURCE */}
                      <td className="px-4 py-3">
                        <div className="text-[11px] text-[#102A43] truncate max-w-[150px]" title={rec.source}>
                          {rec.source}
                        </div>
                        <div className="font-mono text-[10px] text-[#53627A]">
                          {rec.spectralDetails.resolution}
                        </div>
                      </td>

                      {/* 5. CONFIDENCE */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-12 bg-[#E3E8EF] h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                rec.confidence > 90 ? "bg-[#16845B]" : "bg-[#E99A16]"
                              }`}
                              style={{ width: `${rec.confidence}%` }}
                            ></div>
                          </div>
                          <span className="font-mono font-bold text-[#102A43] text-xs">
                            {rec.confidence}%
                          </span>
                        </div>
                        <span className="text-[9px] text-[#53627A]">Spectral Match</span>
                      </td>

                      {/* 6. VERIFICATION STATUS */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isDispatched ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30">
                            <Check className="w-3 h-3" />
                            <span>DISPATCHED TO VAO</span>
                          </span>
                        ) : rec.verificationStatus === "FLAGGED_VIOLATION" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#FDEDEE] text-[#D9363E] border border-[#D9363E]/30">
                            <ShieldAlert className="w-3 h-3" />
                            <span>FLAGGED VIOLATION</span>
                          </span>
                        ) : rec.verificationStatus === "OFFICER_VERIFIED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>AUTHORIZED CLEARANCE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF5E7] text-[#E99A16] border border-[#E99A16]/30">
                            <Clock className="w-3 h-3" />
                            <span>PENDING INSPECTION</span>
                          </span>
                        )}
                      </td>

                      {/* 7. THREE REQUIRED ACTIONS: View Parcel, Compare Imagery, Send for Verification */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* ACTION 1: Compare Imagery */}
                          <button
                            onClick={() => {
                              setSelectedParcelId(rec.id);
                              setSelectedDistrict(rec.district);
                              setSelectedVillage(rec.village);
                              window.scrollTo({ top: 220, behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1.5 rounded bg-white hover:bg-[#F7F9FC] text-[#1D5FD1] text-xs font-semibold border border-[#CCE0FD] transition-colors shadow-2xs flex items-center space-x-1"
                            title="Focus in satellite comparison viewer"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Compare Imagery</span>
                          </button>

                          {/* ACTION 2: View Parcel */}
                          <button
                            onClick={() => handleOpenInspector(rec)}
                            className="px-2.5 py-1.5 rounded bg-[#F8FAFD] hover:bg-[#F1F5FB] text-[#102A43] text-xs font-semibold border border-[#E3E8EF] transition-colors shadow-2xs flex items-center space-x-1"
                            title="Inspect 8-tab statutory land details"
                          >
                            <Eye className="w-3 h-3 text-[#53627A]" />
                            <span>View Parcel</span>
                          </button>

                          {/* ACTION 3: Send for Verification */}
                          <button
                            onClick={() => handleSendForVerification(rec)}
                            disabled={isDispatched}
                            className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-colors shadow-2xs flex items-center space-x-1 ${
                              isDispatched
                                ? "bg-slate-100 text-slate-400 border border-[#E3E8EF] cursor-not-allowed"
                                : "bg-[#16845B] hover:bg-[#126b49] text-white"
                            }`}
                            title="Generate official field survey summons"
                          >
                            <Send className="w-3 h-3" />
                            <span>{isDispatched ? "Dispatched" : "Send for Verification"}</span>
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* 8-TAB PARCEL INSPECTOR DRAWER INTEGRATION */}
      {selectedParcelForInspector && (
        <ParcelInspector
          parcel={selectedParcelForInspector}
          onClose={() => setSelectedParcelForInspector(null)}
        />
      )}

    </OfficerProtectedGuard>
  );
}
