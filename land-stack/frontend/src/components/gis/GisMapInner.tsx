"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { Parcel } from "@/types";
import { ClickedLocation, BasemapType } from "@/types/gis";
import MapClickHandler from "./MapClickHandler";
import MapControls from "./MapControls";
import { reverseGeocode } from "@/services/gisService";
import { fetchLocationAnalysis } from "@/services/gisAnalysisService";
import { resolveMasterPlanZone } from "@/utils/zoneResolver";

// Fix missing marker icon issue in Leaflet + Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface GisMapInnerProps {
  parcels?: Parcel[];
  onSelectParcel?: (parcel: Parcel) => void;
  clickedLocation: ClickedLocation | null;
  setClickedLocation: (loc: ClickedLocation | null) => void;
  targetFlyTo: { lat: number; lng: number; zoom?: number } | null;
}

// Controller to fly map smoothly to target coordinates
function FlyToController({ target }: { target: { lat: number; lng: number; zoom?: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom || 13, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

// Fix map container size calculation on mount
function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function GisMapInner({
  parcels = [],
  onSelectParcel,
  clickedLocation,
  setClickedLocation,
  targetFlyTo,
}: GisMapInnerProps) {
  const [basemap, setBasemap] = useState<BasemapType>("satellite");
  const [zoneData, setZoneData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const basemapUrls = {
    osm: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  };

  const basemapAttributions = {
    osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    satellite: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    topo: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  };

  useEffect(() => {
    if (!clickedLocation) {
      setZoneData(null);
      setAnalysisData(null);
      return;
    }

    // Always compute authentic location-driven zoning & polygon bounds
    const resolvedZoning = resolveMasterPlanZone(
      clickedLocation.lat,
      clickedLocation.lng,
      clickedLocation.displayName,
      clickedLocation.addressDetails
    );

    setZoneData(resolvedZoning);

    async function loadZone() {
      try {
        const analysis = await fetchLocationAnalysis(clickedLocation!.lat, clickedLocation!.lng);
        if (analysis) {
          setAnalysisData(analysis);
          if (analysis.zoningMarking) {
            setZoneData(analysis.zoningMarking);
          }
        }
      } catch (err) {
        console.error("Error loading zone marking:", err);
      }
    }

    loadZone();
  }, [clickedLocation?.lat, clickedLocation?.lng, clickedLocation?.displayName]);

  const handleMapClick = async (lat: number, lng: number) => {
    setClickedLocation({
      lat,
      lng,
      displayName: `Locating place details...`,
      loading: true,
    });

    const details = await reverseGeocode(lat, lng);
    setClickedLocation({
      lat,
      lng,
      displayName: details.displayName,
      addressDetails: details.addressDetails,
      loading: false,
    });
  };

  const survey = analysisData?.cadastralSurvey;
  const tax = analysisData?.propertyTax;
  const court = analysisData?.courtCase;
  const admin = analysisData?.administration;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[20.5937, 78.9629]} // Centered on India by default
        zoom={5} // Zoom level covering whole India
        zoomControl={false} // Custom controls used
        className="w-full h-full z-10"
        style={{ width: "100%", height: "100%", minHeight: "500px" }}
      >
        <MapResizeFix />

        <TileLayer
          key={basemap}
          url={basemapUrls[basemap]}
          attribution={basemapAttributions[basemap]}
          maxZoom={19}
        />

        {basemap === "satellite" && (
          <TileLayer
            key="satellite-labels"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />
        )}

        {/* FlyTo Helper */}
        <FlyToController target={targetFlyTo} />

        {/* Click Anywhere Event Handler */}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Custom Map Control Panel */}
        <MapControls currentBasemap={basemap} onSelectBasemap={(b) => setBasemap(b)} />

        {/* Dynamic Zone Polygon Overlay when a Location is Clicked */}
        {clickedLocation && zoneData && zoneData.polygonCoordinates && (
          <Polygon
            key={`zone-${clickedLocation.lat}-${clickedLocation.lng}`}
            positions={zoneData.polygonCoordinates}
            pathOptions={{
              color: zoneData.color || "#10b981",
              fillColor: zoneData.fillColor || "#10b981",
              fillOpacity: 0.35,
              weight: 3,
              dashArray: "6, 6",
            }}
          >
            <Tooltip permanent direction="top" className="custom-zone-tooltip shadow-xl border-none">
              <span className="font-bold text-xs tracking-tight" style={{ color: zoneData.color || "#059669" }}>
                {zoneData.zoneTitle}
              </span>
            </Tooltip>
          </Polygon>
        )}

        {/* Marker for Clicked GIS Location */}
        {clickedLocation && (
          <Marker position={[clickedLocation.lat, clickedLocation.lng]}>
            <Popup className="text-xs font-sans max-w-xs md:max-w-sm">
              <div className="p-1 space-y-2 min-w-[260px]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-slate-900 text-xs">CADASTRAL PARCEL RECORD</span>
                  </div>
                  {zoneData && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase"
                      style={{ backgroundColor: zoneData.color || "#10b981" }}
                    >
                      {zoneData.zoneType?.replace(/_/g, " ")}
                    </span>
                  )}
                </div>

                {/* Survey & Owner Details */}
                {survey ? (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="bg-blue-50/80 p-2 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-blue-900 text-xs">{survey.surveyNumber}</span>
                        <span className="font-mono text-[9px] bg-blue-200 text-blue-900 font-bold px-1.5 py-0.5 rounded">
                          {survey.ulpin}
                        </span>
                      </div>
                      <div className="mt-1 text-slate-700">
                        <span className="font-semibold text-slate-900 block">Owner: {survey.ownerName}</span>
                        <span className="text-[10px] text-slate-600">Patta: {survey.pattaNumber} | Area: {survey.areaAcres} Acres ({survey.areaSqMeters} m²)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                      <div className="bg-slate-100 p-1.5 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[9px]">Reg Doc No</span>
                        <span className="font-bold text-slate-800">{survey.registrationDocNo?.split('(')[0] || 'Doc Verified'}</span>
                      </div>
                      <div className="bg-slate-100 p-1.5 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[9px]">Guideline Rate</span>
                        <span className="font-bold text-emerald-700">{tax?.guidelineValueSqFt || '₹ 2,500/sqft'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 font-mono italic animate-pulse">
                    Fetching land registry survey details...
                  </div>
                )}

                {/* Zoning Details */}
                {zoneData && (
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] space-y-0.5">
                    <span className="font-bold block" style={{ color: zoneData.color || "#059669" }}>
                      {zoneData.zoneTitle}
                    </span>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      {zoneData.permissibleUse}
                    </p>
                    <div className="flex items-center justify-between pt-1 font-mono text-[9px] text-slate-700 border-t border-slate-200 mt-1">
                      <span>FSI: {zoneData.fsiLimit}</span>
                      <span>Max Height: {zoneData.maxBuildingHeight}</span>
                    </div>
                  </div>
                )}

                {/* Location Address */}
                <div className="text-[10px] text-slate-600 border-t border-slate-200 pt-1.5">
                  <span className="font-mono text-slate-400 block text-[9px]">
                    {clickedLocation.lat.toFixed(6)}° N, {clickedLocation.lng.toFixed(6)}° E
                  </span>
                  <p className="text-slate-800 font-medium leading-tight mt-0.5">
                    {admin ? `${admin.village ? admin.village + ', ' : ''}${admin.subdistrict ? admin.subdistrict + ', ' : ''}${admin.district ? admin.district + ', ' : ''}${admin.state || 'India'} ${admin.pincode ? '- ' + admin.pincode : ''}` : clickedLocation.displayName}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render Parcel Polygons if available */}
        {parcels.map((parcel) => (
          <Polygon
            key={parcel.ulpin}
            positions={parcel.coordinates[0].map(([lng, lat]) => [lat, lng])}
            pathOptions={{
              color: parcel.verificationStatus === "Verified" ? "#059669" : "#d97706",
              fillColor: parcel.verificationStatus === "Verified" ? "#10b981" : "#f59e0b",
              fillOpacity: 0.25,
              weight: 2,
            }}
            eventHandlers={{
              click: () => onSelectParcel && onSelectParcel(parcel),
            }}
          >
            <Popup>
              <div className="p-1 text-xs">
                <span className="font-mono font-bold text-blue-700 block">{parcel.ulpin}</span>
                <span className="font-semibold text-slate-900">{parcel.currentUse}</span>
                <span className="text-[10px] block text-slate-500">S.No {parcel.surveyNumber} ({parcel.areaAcres} Acres)</span>
              </div>
            </Popup>
          </Polygon>
        ))}
      </MapContainer>
    </div>
  );
}
