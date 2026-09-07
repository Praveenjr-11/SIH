import { Parcel, GSILayer, LandMutation, LandAnalytics } from '../types/index.js';

export const parcelsData: Parcel[] = [
  {
    id: 'P001',
    ulpin: 'TN33010000011',
    surveyNumber: '410/1C',
    village: 'Irungattukottai',
    taluk: 'Sriperumbudur',
    district: 'Kanchipuram',
    state: 'Tamil Nadu',
    areaAcres: 45.2,
    areaSqMeters: 182915,
    landClassification: 'Industrial SIPCOT',
    currentUse: 'Hyundai Motor India Factory Complex',
    ownerName: 'SIPCOT Industrial Growth Centre',
    ownerAadhaarHash: '8f94a10e7b99214...',
    registrationDocNo: 'DOC-2018-SIP-4101',
    registrationDate: '2018-04-12',
    encumbranceStatus: 'Clear',
    verificationStatus: 'Verified',
    coordinates: [
      [
        [79.95344, 12.94144],
        [79.95784, 12.94144],
        [79.95784, 12.94834],
        [79.95344, 12.94834],
        [79.95344, 12.94144]
      ]
    ],
    center: [12.94489, 79.95564],
    zoningDetails: {
      masterPlanAuthority: 'SIPCOT & DTCP Tamil Nadu Industrial Master Plan',
      zoneCategory: 'Heavy Industrial Growth Zone (Ind-2)',
      permissibleFSI: '2.50 FSI (Industrial Special Use)',
      maxHeightMeters: 30,
      setbacks: 'Front: 6.0m, Rear: 4.5m, Side: 4.5m'
    },
    propertyTaxDetails: {
      taxAssessmentId: 'PTAX-2026-KNC-8821',
      taxStatus: 'Paid',
      annualTaxAmount: '₹ 1,48,500',
      guidelineValueSqFt: '₹ 3,850 / sq ft',
      totalValuation: '₹ 75.60 Crores',
      wardNo: 'Industrial Ward 12'
    },
    courtCaseDetails: {
      status: 'Clear Title',
      caseId: 'None',
      courtName: 'High Court of Judicature at Madras',
      caseType: 'No Litigation Found',
      stayOrderDetails: 'Unencumbered & Clear Title Certificate Issued'
    },
    gsiGeology: {
      rockFormation: 'Charnockite & Granitic Gneiss Basement',
      lithology: 'Weathered Charnockitic Massif',
      geomorphologyUnit: 'Pediment Plain with Shallow Regolith',
      soilBearingCapacityKPa: 280,
      landslideRiskLevel: 'Low',
      seismicZone: 'Zone II',
      floodHazardIndex: 'Low',
      groundwaterDepthMeters: 8.5,
      gsiReportId: 'GSI-SRIPERUMBUDUR-QUAD-57O/16-2022',
      lastSurveyYear: 2022
    },
    digitalFacets: {
      ulpinCadastralId: 'TN33010000011 (Verified 14-Digit Standard)',
      rorOwnership: 'Patta No: 4101 (SIPCOT Industrial Board)',
      encumbranceCertificate: 'EC # 2024/9912 - Nil Encumbrance',
      registrationHistory: 'Sub-Registrar Office Sriperumbudur (Doc # 4101/2018)',
      taxAssessment: 'Property Tax Paid FY2025-26 (Receipt # TN-KNC-8821)',
      soilAndAgriculture: 'Non-Agricultural Heavy Industrial Soils (Red Sandy Loam)',
      gisSpatialPolygon: 'EPSG:4326 GeoJSON Polygon (Verified 0.05m RTK GPS Precision)',
      gsiGeoscientificRisk: 'GSI Index: LOW (Stable Basement, High Bearing Capacity 280 kPa)',
      isroSatelliteLandUse: 'Bhuvan Sentinel-2 Built-up Industrial Infrastructure',
      utilityInfrastructure: 'TNEB 110kV Industrial Feeder, CMWSSB Pipeline Access',
      courtCaseStatus: 'Clear Title (Madras High Court Verified)',
      zoningMasterPlan: 'SIPCOT Heavy Industrial Zone (Ind-2, 2.50 FSI)'
    }
  },
  {
    id: 'P002',
    ulpin: 'TN33010000007',
    surveyNumber: '178/3B',
    village: 'Irungattukottai',
    taluk: 'Sriperumbudur',
    district: 'Kanchipuram',
    state: 'Tamil Nadu',
    areaAcres: 18.6,
    areaSqMeters: 75271,
    landClassification: 'Industrial SIPCOT',
    currentUse: 'Automobile Ancillary & Engineering Sheds',
    ownerName: 'Precision Tools Pvt Ltd',
    ownerAadhaarHash: '3a11b98c5e0034...',
    registrationDocNo: 'DOC-2020-SRO-1783',
    registrationDate: '2020-09-18',
    encumbranceStatus: 'Clear',
    verificationStatus: 'Verified',
    coordinates: [
      [
        [79.94252, 12.95152],
        [79.95372, 12.95152],
        [79.95372, 12.95872],
        [79.94252, 12.95872],
        [79.94252, 12.95152]
      ]
    ],
    center: [12.95512, 79.94812],
    zoningDetails: {
      masterPlanAuthority: 'DTCP & Sriperumbudur New Town Development Authority',
      zoneCategory: 'General Industrial Zone (Ind-1)',
      permissibleFSI: '2.00 FSI',
      maxHeightMeters: 24,
      setbacks: 'Front: 5.0m, Rear: 3.5m, Side: 3.5m'
    },
    propertyTaxDetails: {
      taxAssessmentId: 'PTAX-2026-KNC-4412',
      taxStatus: 'Paid',
      annualTaxAmount: '₹ 62,400',
      guidelineValueSqFt: '₹ 3,400 / sq ft',
      totalValuation: '₹ 27.50 Crores',
      wardNo: 'Industrial Ward 10'
    },
    courtCaseDetails: {
      status: 'Clear Title',
      caseId: 'None',
      courtName: 'District Civil Court, Chengalpattu',
      caseType: 'No Active Litigation',
      stayOrderDetails: 'Lien Registered with Canara Bank (Mortgage Clear)'
    },
    gsiGeology: {
      rockFormation: 'Peninsular Gneissic Complex',
      lithology: 'Quartz-Feldspathic Gneiss',
      geomorphologyUnit: 'Denudational Uplands',
      soilBearingCapacityKPa: 240,
      landslideRiskLevel: 'Low',
      seismicZone: 'Zone II',
      floodHazardIndex: 'Low',
      groundwaterDepthMeters: 10.2,
      gsiReportId: 'GSI-SRIPERUMBUDUR-QUAD-57O/16-2022',
      lastSurveyYear: 2022
    },
    digitalFacets: {
      ulpinCadastralId: 'TN33010000007 (Verified 14-Digit Standard)',
      rorOwnership: 'Patta No: 1783 (Precision Tools Pvt Ltd)',
      encumbranceCertificate: 'EC # 2024/4412 - Mortgage with Canara Bank',
      registrationHistory: 'Sub-Registrar Office Sriperumbudur (Doc # 1783/2020)',
      taxAssessment: 'Commercial Property Tax Paid FY2025-26',
      soilAndAgriculture: 'Industrial Zone - Clayey Loam',
      gisSpatialPolygon: 'EPSG:4326 GeoJSON Polygon (DGPS Boundary Fixed)',
      gsiGeoscientificRisk: 'GSI Index: LOW (Good Foundation Stability 240 kPa)',
      isroSatelliteLandUse: 'Bhuvan Sentinel-2 Built-up Industrial Sheds',
      utilityInfrastructure: 'SIPCOT Water & TNEB Commercial Power Line',
      courtCaseStatus: 'Clear Title (District Court Clearance)',
      zoningMasterPlan: 'DTCP General Industrial Zone (Ind-1)'
    }
  },
  {
    id: 'P003',
    ulpin: 'TN33010000005',
    surveyNumber: '312/1',
    village: 'Pennalur',
    taluk: 'Sriperumbudur',
    district: 'Kanchipuram',
    state: 'Tamil Nadu',
    areaAcres: 32.4,
    areaSqMeters: 131118,
    landClassification: 'Nanjai (Wet)',
    currentUse: 'Protected Paddy Crop & Agricultural Wetland',
    ownerName: 'K. Ramaswamy & Family',
    ownerAadhaarHash: '1c44d77a8b1192...',
    registrationDocNo: 'DOC-1994-PENN-3121',
    registrationDate: '1994-02-10',
    encumbranceStatus: 'Clear',
    verificationStatus: 'Verified',
    coordinates: [
      [
        [79.9651, 12.9402],
        [79.9723, 12.9402],
        [79.9723, 12.9465],
        [79.9651, 12.9465],
        [79.9651, 12.9402]
      ]
    ],
    center: [12.94335, 79.9687],
    zoningDetails: {
      masterPlanAuthority: 'Tamil Nadu Agriculture & Land Use Regulatory Board',
      zoneCategory: 'Primary Agricultural Protection Zone (Agri-1)',
      permissibleFSI: '0.25 FSI (Farm House Only)',
      maxHeightMeters: 9,
      setbacks: 'Front: 6.0m, Rear: 6.0m, Side: 6.0m'
    },
    propertyTaxDetails: {
      taxAssessmentId: 'PTAX-2026-PENN-3121',
      taxStatus: 'Exempt',
      annualTaxAmount: '₹ 0 (Exempted Agricultural)',
      guidelineValueSqFt: '₹ 1,150 / sq ft',
      totalValuation: '₹ 16.20 Crores',
      wardNo: 'Pennalur Panchayat Ward 4'
    },
    courtCaseDetails: {
      status: 'Clear Title',
      caseId: 'None',
      courtName: 'Sub-Court Kanchipuram',
      caseType: 'No Dispute Recorded',
      stayOrderDetails: 'Ancestral Partition Completed & Clean Patta Issued'
    },
    gsiGeology: {
      rockFormation: 'Alluvial Floodplain Deposits',
      lithology: 'Silt, Clay & Fine Sand Layers',
      geomorphologyUnit: 'Fluvio-lacustrine Basin Plain',
      soilBearingCapacityKPa: 120,
      landslideRiskLevel: 'Low',
      seismicZone: 'Zone II',
      floodHazardIndex: 'Moderate',
      groundwaterDepthMeters: 2.1,
      gsiReportId: 'GSI-HYDROGEOLOGY-KNC-2023',
      lastSurveyYear: 2023
    },
    digitalFacets: {
      ulpinCadastralId: 'TN33010000005 (Agricultural Wet Land)',
      rorOwnership: 'Patta No: 3121 (Ancestral Agricultural Patta)',
      encumbranceCertificate: 'EC # 2024/0019 - Nil Encumbrance',
      registrationHistory: 'SRO Sriperumbudur (Inheritance Partition 1994)',
      taxAssessment: 'Agricultural Land Revenue Cess Exempted',
      soilAndAgriculture: 'Nanjai Wet Soil - High Alluvial Soil Water Table',
      gisSpatialPolygon: 'EPSG:4326 GeoJSON Polygon (Wetland Protection Tagged)',
      gsiGeoscientificRisk: 'GSI Hydrogeology Index: Moderate Inundation / Shallow Groundwater (2.1m)',
      isroSatelliteLandUse: 'Bhuvan Sentinel-2 Seasonal Crop Land (Green Paddy)',
      utilityInfrastructure: 'Pennalur Canal Irrigation Feed',
      courtCaseStatus: 'Clear Title (Clear Ancestral Patta)',
      zoningMasterPlan: 'Agricultural Protection Zone (Agri-1)'
    }
  },
  {
    id: 'P004',
    ulpin: 'TN33010000013',
    surveyNumber: '512/3',
    village: 'Sriperumbudur Rural',
    taluk: 'Sriperumbudur',
    district: 'Kanchipuram',
    state: 'Tamil Nadu',
    areaAcres: 64.0,
    areaSqMeters: 258998,
    landClassification: 'Waterbody Reserve',
    currentUse: 'Sriperumbudur Lake Buffer & Eco-Sensitive Zone',
    ownerName: 'Public Works Department (Water Resources Department)',
    ownerAadhaarHash: 'GOVT-PWD-WRD-TN-001',
    registrationDocNo: 'GOVT-GAZETTE-1972-WRD',
    registrationDate: '1972-01-01',
    encumbranceStatus: 'Government Encroachment Watch',
    verificationStatus: 'Verified',
    coordinates: [
      [
        [79.9312, 12.9688],
        [79.9415, 12.9688],
        [79.9415, 12.9772],
        [79.9312, 12.9772],
        [79.9312, 12.9688]
      ]
    ],
    center: [12.973, 79.93635],
    zoningDetails: {
      masterPlanAuthority: 'State Water Resources Department & MoEFCC',
      zoneCategory: 'Eco-Sensitive Water Catchment Protection Zone (No Development)',
      permissibleFSI: '0.00 (Strictly Prohibited Construction)',
      maxHeightMeters: 0,
      setbacks: '50m Buffer Restriction Line Enforced'
    },
    propertyTaxDetails: {
      taxAssessmentId: 'GOVT-PWD-WATER-512',
      taxStatus: 'Exempt',
      annualTaxAmount: 'Exempt (State Public Infrastructure)',
      guidelineValueSqFt: 'N/A (Government Reserve)',
      totalValuation: 'Public Eco-Asset',
      wardNo: 'Water Resources Catchment Zone'
    },
    courtCaseDetails: {
      status: 'Active Litigation',
      caseId: 'W.P. 11042 / 2025',
      courtName: 'High Court of Judicature at Madras (Green Bench)',
      caseType: 'Public Interest Litigation (PIL) Against Illegal Encroachment',
      stayOrderDetails: 'High Court Order Directing Immediate Demolition of Buffer Encroachments',
      hearingDate: '2026-10-15'
    },
    gsiGeology: {
      rockFormation: 'Quaternary Fluvial Silt & Lacustrine Beds',
      lithology: 'Black Cotton Soil & Soft Mud Silt',
      geomorphologyUnit: 'Natural Catchment Depressive Basin',
      soilBearingCapacityKPa: 80,
      landslideRiskLevel: 'Low',
      seismicZone: 'Zone II',
      floodHazardIndex: 'High',
      groundwaterDepthMeters: 0.5,
      gsiReportId: 'GSI-GEOHAZARD-WATERBODY-57O-2023',
      lastSurveyYear: 2023
    },
    digitalFacets: {
      ulpinCadastralId: 'TN33010000013 (Eco-Sensitive Buffer Zone)',
      rorOwnership: 'Government Poramboke Water Tank (PWD / WRD)',
      encumbranceCertificate: 'Non-Transferable Public Eco-Reserve',
      registrationHistory: 'State Revenue Gazette Notification # 512/1972',
      taxAssessment: 'Exempt Govt Eco Infrastructure',
      soilAndAgriculture: 'Hydro-Saturated Clay Silt Lake Buffer',
      gisSpatialPolygon: 'EPSG:4326 GeoJSON Polygon (Automated Encroachment Alert Active)',
      gsiGeoscientificRisk: 'GSI Geohazard Index: HIGH FLOOD HAZARD (Natural Retaining Catchment)',
      isroSatelliteLandUse: 'Bhuvan Sentinel-2 Inland Water Surface Layer',
      utilityInfrastructure: 'Natural Flood Outflow Channel to Palar Basin',
      courtCaseStatus: 'Active Litigation: W.P. 11042/2025 (Madras High Court Green Bench)',
      zoningMasterPlan: 'Eco-Sensitive Water Catchment Protection Zone (No Construction)'
    }
  },
  {
    id: 'P005',
    ulpin: 'TN33010000008',
    surveyNumber: '256/1A2',
    village: 'Mambakkam',
    taluk: 'Sriperumbudur',
    district: 'Kanchipuram',
    state: 'Tamil Nadu',
    areaAcres: 14.8,
    areaSqMeters: 59893,
    landClassification: 'Punjai (Dry)',
    currentUse: 'Agricultural Dry Farmlands',
    ownerName: 'S. Sundaram & Co-owners',
    ownerAadhaarHash: '99e21b0451a998...',
    registrationDocNo: 'DOC-2015-MAMB-2561',
    registrationDate: '2015-11-20',
    encumbranceStatus: 'Disputed',
    verificationStatus: 'Disputed',
    disputeReason: 'Overlap with proposed industrial corridor survey line',
    coordinates: [
      [
        [79.9622, 12.9482],
        [79.9705, 12.9482],
        [79.9705, 12.9541],
        [79.9622, 12.9541],
        [79.9622, 12.9482]
      ]
    ],
    center: [12.95115, 79.96635],
    zoningDetails: {
      masterPlanAuthority: 'Sriperumbudur Planning Authority & Highways Dept',
      zoneCategory: 'Mixed Agricultural & Infrastructure Expansion Zone',
      permissibleFSI: '1.50 FSI (Subject to Alignment Clearance)',
      maxHeightMeters: 15,
      setbacks: 'Front: 7.0m (Highway Alignment Buffer), Side: 3.0m'
    },
    propertyTaxDetails: {
      taxAssessmentId: 'PTAX-2026-MAMB-2561',
      taxStatus: 'Pending',
      annualTaxAmount: '₹ 8,400 (Pending Verification)',
      guidelineValueSqFt: '₹ 1,850 / sq ft',
      totalValuation: '₹ 11.80 Crores',
      wardNo: 'Mambakkam Ward 2'
    },
    courtCaseDetails: {
      status: 'Stay Order Issued',
      caseId: 'O.S. 342 / 2024',
      courtName: 'District Civil Court, Chengalpattu',
      caseType: 'Boundary Overlap & Title Partition Suit',
      stayOrderDetails: 'Interim Injunction Order Restraining Sale, Transfer, or Construction',
      hearingDate: '2026-11-04'
    },
    gsiGeology: {
      rockFormation: 'Charnockite Terrain',
      lithology: 'Red Gravelly Loam over Weathered Charnockite',
      geomorphologyUnit: 'Undulating Peneplain',
      soilBearingCapacityKPa: 210,
      landslideRiskLevel: 'Low',
      seismicZone: 'Zone II',
      floodHazardIndex: 'Low',
      groundwaterDepthMeters: 14.0,
      gsiReportId: 'GSI-SRIPERUMBUDUR-QUAD-57O/16-2022',
      lastSurveyYear: 2022
    },
    digitalFacets: {
      ulpinCadastralId: 'TN33010000008 (Spatial Dispute Flagged)',
      rorOwnership: 'Patta No: 2561 (Co-ownership Disputed in Revenue Court)',
      encumbranceCertificate: 'EC # 2024/7710 - Pending Lis Pendens Notice',
      registrationHistory: 'Sub-Registrar Office Sriperumbudur (Doc # 2561/2015)',
      taxAssessment: 'Dry Land Agricultural Revenue Cess Paid',
      soilAndAgriculture: 'Punjai Dry Red Sandy Clay',
      gisSpatialPolygon: 'EPSG:4326 GeoJSON Polygon (Boundary Dispute Highlighted in Amber)',
      gsiGeoscientificRisk: 'GSI Index: LOW (Stable Basement, Deep Water Table 14m)',
      isroSatelliteLandUse: 'Bhuvan Sentinel-2 Fallow Dry Cropland',
      utilityInfrastructure: 'Rural Agricultural Electricity Connection',
      courtCaseStatus: 'Stay Order Issued: O.S. 342/2024 (Injunction Active)',
      zoningMasterPlan: 'Mixed Agricultural & Infrastructure Corridor'
    }
  }
];

export const gsiLayersData: GSILayer[] = [
  {
    id: 'GSI-LAYER-01',
    layerName: 'Geohazard & Flood Vulnerability Map',
    category: 'Geohazard',
    provider: 'Geological Survey of India (GSI)',
    disclaimer: 'Geoscientific advisory layer published by GSI for spatial infrastructure planning. Not an ownership record.',
    datasetVersion: 'GSI-GEOHAZ-2024.1',
    features: [
      {
        id: 'GSI-FEAT-101',
        name: 'Sriperumbudur Low-lying Flood Catchment Zone',
        hazardScore: 85,
        description: 'High inundation risk during monsoonal discharge due to clay silt deposition and low natural slope.',
        recommendedAction: 'Prohibit heavy structural foundation without deep piling; enforce 50m green buffer.',
        coordinates: [
          [
            [79.930, 12.965],
            [79.945, 12.965],
            [79.945, 12.980],
            [79.930, 12.980],
            [79.930, 12.965]
          ]
        ]
      }
    ]
  }
];

export const mutationsData: LandMutation[] = [
  {
    id: 'MUT-2026-001',
    applicationId: 'APP-2026-0110',
    ulpin: 'TN33010000011',
    surveyNumber: '410/1C',
    buyerName: 'Hyundai Motor India Ltd',
    sellerName: 'SIPCOT Industrial Growth Centre',
    mutationType: 'Sale Transfer',
    status: 'Approved',
    appliedDate: '2026-01-10',
    updatedDate: '2026-01-18',
    spatialAuditStatus: 'Passed',
    gsiClearance: 'Cleared',
    remarks: 'Industrial leasehold sale transfer verified and updated in revenue records.'
  }
];

export const analyticsData: LandAnalytics = {
  totalParcels: 1420,
  verifiedParcels: 1390,
  disputedParcels: 30,
  pendingMutations: 12,
  totalAreaAcres: 4850.5,
  zoneDistribution: [
    { zone: 'Industrial Hub', count: 450, area: 2150.2 },
    { zone: 'Agricultural Belt', count: 620, area: 1800.8 },
    { zone: 'Residential Zone', count: 350, area: 899.5 }
  ],
  gsiHazardRiskBreakdown: [
    { level: 'Low', count: 1250 },
    { level: 'Moderate', count: 140 },
    { level: 'High', count: 30 }
  ],
  recentMutationsCount: 45
};

export const architectureData = {
  system: 'Bharat Land-Stack GIS Engine',
  version: '2.0.0',
  layers: ['PostGIS Spatial Engine', 'Nominatim OSM Reverse Geocoder', 'Overpass OSM API', 'Open Elevation API']
};

const tnDistrictsData = [
  { district: 'Kanchipuram', taluks: ['Sriperumbudur', 'Pennalur', 'Irungattukottai', 'Oragadam', 'Mambakkam'], lat: 12.8342, lng: 79.7036 },
  { district: 'Chengalpattu', taluks: ['Tambaram', 'Vandalur', 'Chengalpattu Town', 'Mahabalipuram', 'Guduvancheri'], lat: 12.6821, lng: 79.9865 },
  { district: 'Thiruvallur', taluks: ['Avadi', 'Ponneri', 'Gummidipoondi', 'Tiruttani', 'Thiruvallur Town'], lat: 13.1432, lng: 79.9085 },
  { district: 'Chennai', taluks: ['Ambattur', 'Guindy', 'Velachery', 'T. Nagar', 'Perambur'], lat: 13.0827, lng: 80.2707 },
  { district: 'Coimbatore', taluks: ['Singanallur', 'Peelamedu', 'Thudiyalur', 'Pollachi', 'Annur'], lat: 11.0168, lng: 76.9558 },
  { district: 'Madurai', taluks: ['Thiruparankundram', 'Melur', 'Usilampatti', 'Vadipatti', 'Madurai North'], lat: 9.9252, lng: 78.1198 },
  { district: 'Salem', taluks: ['Attur', 'Mettur', 'Omalur', 'Sankari', 'Salem South'], lat: 11.6643, lng: 78.1460 },
  { district: 'Tiruchirappalli', taluks: ['Srirangam', 'Lalgudi', 'Manapparai', 'Thottiyam', 'Trichy Town'], lat: 10.7905, lng: 78.7047 },
  { district: 'Tirunelveli', taluks: ['Palayamkottai', 'Ambasamudram', 'Nanguneri', 'Radhapuram', 'Tirunelveli West'], lat: 8.7139, lng: 77.7567 },
  { district: 'Thanjavur', taluks: ['Kumbakonam', 'Pattukkottai', 'Thiruvaiyaru', 'Orathanadu', 'Thanjavur Town'], lat: 10.7870, lng: 79.1378 },
  { district: 'Erode', taluks: ['Perundurai', 'Bhavani', 'Gobichettipalayam', 'Sathyamangalam', 'Erode South'], lat: 11.3410, lng: 77.7172 },
  { district: 'Vellore', taluks: ['Katpadi', 'Gudiyatham', 'Anaicut', 'K.V. Kuppam', 'Vellore Central'], lat: 12.9165, lng: 79.1325 },
  { district: 'Dindigul', taluks: ['Palani', 'Kodaikanal', 'Nattam', 'Nilakottai', 'Dindigul East'], lat: 10.3673, lng: 77.9803 },
  { district: 'Cuddalore', taluks: ['Chidambaram', 'Panruti', 'Vriddhachalam', 'Neyveli', 'Cuddalore Port'], lat: 11.7480, lng: 79.7714 },
  { district: 'Kanyakumari', taluks: ['Nagercoil', 'Thuckalay', 'Agastheeswaram', 'Vilavancode', 'Padmanabhapuram'], lat: 8.0883, lng: 77.5385 },
  { district: 'Ramanathapuram', taluks: ['Rameswaram', 'Paramakudi', 'Mudukulathur', 'Tiruvadanai', 'Ramanathapuram Town'], lat: 9.3639, lng: 78.8395 },
  { district: 'Virudhunagar', taluks: ['Sivakasi', 'Rajapalayam', 'Aruppukottai', 'Sattur', 'Virudhunagar Urban'], lat: 9.5680, lng: 77.9624 },
  { district: 'Karur', taluks: ['Kulithalai', 'Aravakurichi', 'Manmangalam', 'Karur Town'], lat: 10.9601, lng: 78.0766 },
  { district: 'Namakkal', taluks: ['Rasipuram', 'Tiruchengode', 'Paramathi Velur', 'Namakkal Urban'], lat: 11.2189, lng: 78.1674 },
  { district: 'Nilgiris', taluks: ['Udhagamandalam', 'Coonoor', 'Kotagiri', 'Gudalur'], lat: 11.4102, lng: 76.6950 },
  { district: 'Perambalur', taluks: ['Perambalur Town', 'Veppanthattai', 'Alathur', 'Kunnam'], lat: 11.2342, lng: 78.8820 },
  { district: 'Pudukkottai', taluks: ['Aranthangi', 'Viralimalai', 'Thirumayam', 'Pudukkottai Urban'], lat: 10.3833, lng: 78.8000 },
  { district: 'Ranipet', taluks: ['Ranipet Industrial Hub', 'Arcot', 'Walajah', 'Sholinghur'], lat: 12.9224, lng: 79.3327 },
  { district: 'Tenkasi', taluks: ['Tenkasi Town', 'Sankarankovil', 'Kadayanallur', 'Shenkottai'], lat: 8.9593, lng: 77.3148 },
  { district: 'Theni', taluks: ['Bodinayakanur', 'Periyakulam', 'Uthamapalayam', 'Theni Urban'], lat: 10.0104, lng: 77.4768 },
  { district: 'Thoothukudi', taluks: ['Thoothukudi Port Zone', 'Kovilpatti', 'Tiruchendur', 'Ettayapuram'], lat: 8.7642, lng: 78.1348 },
  { district: 'Tirupathur', taluks: ['Ambur', 'Vaniyambadi', 'Tirupathur Urban', 'Natrampalli'], lat: 12.4925, lng: 78.5678 },
  { district: 'Tiruppur', taluks: ['Avinashi', 'Palladam', 'Dharapuram', 'Udumalaipettai', 'Tiruppur North'], lat: 11.1085, lng: 77.3411 },
  { district: 'Tiruvarur', taluks: ['Mannargudi', 'Thiruthuraipoondi', 'Nannilam', 'Tiruvarur Urban'], lat: 10.7726, lng: 79.6365 },
  { district: 'Tiruvannamalai', taluks: ['Arani', 'Cheyyar', 'Polur', 'Chengam', 'Tiruvannamalai Temple Zone'], lat: 12.2253, lng: 79.0747 },
  { district: 'Viluppuram', taluks: ['Tindivanam', 'Gingee', 'Vikravandi', 'Viluppuram Urban'], lat: 11.9401, lng: 79.4861 },
  { district: 'Kallakurichi', taluks: ['Sankarapuram', 'Tirukoilur', 'Ulundurpet', 'Kallakurichi Urban'], lat: 11.7383, lng: 78.9639 },
  { district: 'Mayiladuthurai', taluks: ['Sirkazhi', 'Tharangambadi', 'Kuttalam', 'Mayiladuthurai Town'], lat: 11.1018, lng: 79.6522 },
  { district: 'Nagapattinam', taluks: ['Kilvelur', 'Vedaranyam', 'Nagapattinam Port', 'Thirukkuvalai'], lat: 10.7672, lng: 79.8449 },
  { district: 'Krishnagiri', taluks: ['Hosur Industrial Zone', 'Denkanikottai', 'Pochampalli', 'Bargur', 'Krishnagiri Town'], lat: 12.5186, lng: 78.2137 },
  { district: 'Dharmapuri', taluks: ['Harur', 'Palacode', 'Pennagaram', 'Pappireddipatti', 'Dharmapuri Urban'], lat: 12.1211, lng: 78.1582 },
  { district: 'Ariyalur', taluks: ['Jayamkondam', 'Sendurai', 'Udayarpalayam', 'Ariyalur Town'], lat: 11.1401, lng: 79.0782 },
  { district: 'Sivaganga', taluks: ['Karaikudi Heritage Zone', 'Devakottai', 'Manamadurai', 'Kalaiyarkoil', 'Sivaganga Urban'], lat: 9.8433, lng: 78.4809 }
];

const caseTypesList = [
  'Zone Conversion & NOC Clearance',
  'Industrial SIPCOT Clearance',
  'Patta Boundary Demarcation',
  'Commercial CBD FSI NOC',
  'Eco-Sensitive Catchment Clearance',
  'Commercial IT Corridor NOC',
  'Grama Natham Regularization',
  'Environmental Clearance NOC',
  'Heritage Buffer NOC'
];

const ownersList = [
  'Thiru K. Ramaswamy & Family',
  'SIPCOT Industrial Growth Centre',
  'Thiru M. Loganathan',
  'S. Sundaram & Co-owners',
  'Public Works Dept (WRD)',
  'Ambattur Infrastructure Parks Ltd',
  'Renault-Nissan Suppliers Hub',
  'Tmt. V. Lakshmi Devi',
  'Coimbatore Textile Infrastructure Ltd',
  'Heritage Temple Trust Committee',
  'Thiru A. Subramanian',
  'Tmt. N. Meenakshi Sundaram',
  'Thiru P. Karuppasamy',
  'Sriperumbudur Auto Logistics Pvt Ltd',
  'Tmt. S. Kanagavalli & Sons',
  'Thiru R. Selvakumar, IRS',
  'TN Industrial Development Corp (TIDCO)',
  'Tmt. G. Bhavani Ammal',
  'Thiru M. Palanisamy & Family',
  'Kaveri Delta Farmers Society'
];

const statusOptions = ['OFFICER_REVIEW', 'FIELD_INSPECTION', 'DOCUMENT_VERIFICATION', 'APPROVED', 'REJECTED'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const classificationOptions = ['Industrial SIPCOT', 'Nanjai (Wet)', 'Punjai (Dry)', 'Grama Natham', 'Commercial IT Zone', 'Waterbody Reserve', 'Heritage Protection Zone'];

function generate100PlusLandCases() {
  const cases: any[] = [];
  let currentId = 100001;

  for (let dIdx = 0; dIdx < tnDistrictsData.length; dIdx++) {
    const dInfo = tnDistrictsData[dIdx];
    const distCode = (dIdx + 1).toString().padStart(2, '0');

    for (let cIdx = 0; cIdx < 3; cIdx++) {
      const caseIdNum = currentId++;
      const caseNo = `CASE-2026-${caseIdNum}`;
      const surveyNo = `${Math.floor(50 + Math.random() * 450)}/${Math.floor(1 + Math.random() * 5)}${String.fromCharCode(65 + (cIdx % 4))}`;
      const ulpin = `TN33${distCode}000${Math.floor(1000 + Math.random() * 8999)}`;
      const talukName = dInfo.taluks[cIdx % dInfo.taluks.length];
      const villageName = `${talukName} Village`;
      const owner = ownersList[(dIdx * 3 + cIdx) % ownersList.length];
      const cType = caseTypesList[(dIdx * 3 + cIdx) % caseTypesList.length];
      const status = statusOptions[(dIdx + cIdx) % statusOptions.length];
      const priority = priorityOptions[(dIdx + cIdx) % priorityOptions.length];
      const classification = classificationOptions[(dIdx + cIdx) % classificationOptions.length];
      const acres = +(1.5 + Math.random() * 48).toFixed(2);
      const sqM = Math.round(acres * 4046.86);
      const guidelineVal = Math.floor(950 + Math.random() * 5500);
      const marketCrores = +((acres * guidelineVal * 43.56) / 10000000).toFixed(2);
      const riskScore = Math.floor(10 + Math.random() * 80);
      const riskLevel = riskScore > 65 ? 'HIGH' : riskScore > 35 ? 'MODERATE' : 'LOW';

      cases.push({
        id: caseIdNum,
        caseNumber: caseNo,
        title: `${cType}: S.No ${surveyNo}`,
        caseType: cType,
        status: status,
        priority: priority,
        latitude: +(dInfo.lat + (Math.random() * 0.04 - 0.02)).toFixed(4),
        longitude: +(dInfo.lng + (Math.random() * 0.04 - 0.02)).toFixed(4),
        district: dInfo.district,
        taluk: talukName,
        village: villageName,
        surveyNumber: surveyNo,
        ulpin: ulpin,
        ownerName: owner,
        pattaNumber: `PATTA-${surveyNo.replace('/', '')}-${dInfo.district.substring(0, 4).toUpperCase()}`,
        areaAcres: acres,
        areaSqMeters: sqM,
        landClassification: classification,
        currentUse: `Active ${classification} Site`,
        valuation: {
          guidelineValueSqFt: `₹ ${guidelineVal.toLocaleString()} / sq ft`,
          estimatedMarketValue: `₹ ${marketCrores} Crores`,
          stampDutyEstimated: `₹ ${(marketCrores * 0.07).toFixed(2)} Crores (7%)`,
          taxStatus: 'Paid (Clear Ledger)',
          taxAssessmentId: `PTAX-2026-${dInfo.district.substring(0, 3).toUpperCase()}-${caseIdNum}`
        },
        encumbranceChain: [
          { docNo: `DOC-2012-${dInfo.district.substring(0, 3).toUpperCase()}-${caseIdNum}`, year: 2012, type: 'Sale & Settlement Deed', sro: talukName, party: owner, status: 'Clear Title' },
          { docNo: `EC-2024-${Math.floor(1000 + Math.random() * 8999)}`, year: 2024, type: 'Encumbrance Ledger Check', sro: talukName, party: 'Sub-Registrar Office', status: 'Nil Encumbrance (Clean 13-Yr Ledger)' }
        ],
        dgpsBoundaryVertices: [
          { point: 'P1', lat: +(dInfo.lat).toFixed(4), lng: +(dInfo.lng).toFixed(4), accuracy: '0.02m (RTK DGPS)' },
          { point: 'P2', lat: +(dInfo.lat + 0.003).toFixed(4), lng: +(dInfo.lng + 0.003).toFixed(4), accuracy: '0.02m (RTK DGPS)' },
          { point: 'P3', lat: +(dInfo.lat + 0.003).toFixed(4), lng: +(dInfo.lng).toFixed(4), accuracy: '0.02m (RTK DGPS)' },
          { point: 'P4', lat: +(dInfo.lat).toFixed(4), lng: +(dInfo.lng + 0.003).toFixed(4), accuracy: '0.02m (RTK DGPS)' }
        ],
        gsiGeotechnical: {
          rockFormation: 'Peninsular Gneissic Basement & Charnockite',
          lithology: 'Weathered Granitic Regolith over Stable Basement',
          bearingCapacityKPa: 220 + Math.floor(Math.random() * 100),
          seismicZone: 'Zone II',
          floodHazardIndex: riskScore > 60 ? 'Moderate Inundation Hazard' : 'Low Flood Risk',
          groundwaterDepthMeters: +(3.5 + Math.random() * 10).toFixed(1),
          isroSatelliteTag: `Bhuvan Sentinel-2 ${classification} Tagged`
        },
        riskAssessment: {
          compositeScore: riskScore,
          riskLevel: riskLevel,
          factors: [
            { category: 'Foundation Stability', score: Math.max(10, 100 - riskScore), detail: 'Peninsular Gneissic Basement foundation evaluated.' }
          ]
        }
      });
    }
  }

  return cases;
}

export const landCasesData = generate100PlusLandCases();



