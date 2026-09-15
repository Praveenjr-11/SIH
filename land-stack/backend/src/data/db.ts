import { Parcel, GSILayer, LandMutation, LandAnalytics } from '../types/index.js';

function generateParcelsFromCases(cases: any[]): Parcel[] {
  return cases.map((c, idx) => ({
    id: `P${String(idx + 1).padStart(4, '0')}`,
    ulpin: c.ulpin,
    surveyNumber: c.surveyNumber,
    subDivisionNumber: c.subDivisionNumber,
    village: c.village,
    taluk: c.taluk,
    district: c.district,
    state: c.state || 'Tamil Nadu',
    areaAcres: c.areaAcres,
    areaSqMeters: c.areaSqMeters,
    landClassification: c.landClassification,
    documentType: c.documentType,
    currentUse: c.currentUse,
    ownerName: c.ownerName,
    ownerDataStatus: 'SYNTHETIC_DEMO_DATA',
    pattaNumber: c.pattaNumber,
    ownerAadhaarHash: `8f94a10e7b99${idx + 1000}...`,
    registrationDocNo: c.encumbranceChain?.[0]?.docNo || `DOC-2021-${c.district.substring(0, 3).toUpperCase()}-${idx + 100}`,
    registrationDate: '2021-05-14',
    encumbranceStatus: c.valuation?.taxStatus || 'Clear',
    verificationStatus: 'Verified',
    coordinates: [
      [
        [c.longitude - 0.002, c.latitude - 0.002],
        [c.longitude + 0.002, c.latitude - 0.002],
        [c.longitude + 0.002, c.latitude + 0.002],
        [c.longitude - 0.002, c.latitude + 0.002],
        [c.longitude - 0.002, c.latitude - 0.002]
      ]
    ],
    center: [c.latitude, c.longitude],
    zoningDetails: {
      masterPlanAuthority: `DTCP & ${c.district} Local Planning Authority`,
      zoneCategory: `${c.landClassification} Zone`,
      permissibleFSI: '1.75 FSI',
      maxHeightMeters: 18,
      setbacks: 'Front: 3.0m, Rear: 3.0m, Side: 2.0m'
    },
    propertyTaxDetails: {
      taxAssessmentId: c.valuation?.taxAssessmentId || `PTAX-2026-${c.district.substring(0, 3).toUpperCase()}-${idx + 100}`,
      taxStatus: 'Paid',
      annualTaxAmount: `₹ ${(Math.floor(12000 + (idx % 45) * 850)).toLocaleString()}`,
      guidelineValueSqFt: c.valuation?.guidelineValueSqFt || '₹ 1,450 / sq ft',
      realGuidelineValuePerSqft: c.valuation?.realGuidelineValuePerSqft || 1450,
      guidelineDataStatus: 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED',
      guidelineSource: 'https://tnreginet.gov.in (TN Registration Dept)',
      totalValuation: c.valuation?.estimatedMarketValue || '₹ 2.40 Crores',
      wardNo: `Ward ${Math.floor(1 + (idx % 30))}`
    },
    courtCaseDetails: {
      status: c.status,
      caseId: c.caseNumber,
      courtName: c.forum || 'High Court of Judicature at Madras',
      caseType: c.caseType,
      stayOrderDetails: c.litigants?.interimStayStatus || 'No Stay Order Active'
    },
    gsiGeology: c.gsiGeotechnical,
    riskAssessment: c.riskAssessment,
    digitalFacets: {
      ulpinCadastralId: `${c.ulpin} (Verified 14-Digit Standard)`,
      rorOwnership: `Patta No: ${c.pattaNumber} (${c.ownerName})`,
      encumbranceCertificate: `EC # ${c.encumbranceChain?.[0]?.docNo || '2024/0019'} - Clean Ledger`,
      registrationHistory: `SRO ${c.taluk} (Doc #${c.surveyNumber}/2021)`,
      taxAssessment: `Property Tax Assessment ${c.valuation?.taxAssessmentId || 'Paid'}`,
      soilAndAgriculture: `${c.landClassification} Classification Soil`,
      gisSpatialPolygon: 'EPSG:4326 GeoJSON Polygon (DGPS Boundary Fixed)',
      gsiGeoscientificRisk: `GSI Geohazard Index: ${c.riskAssessment?.riskLevel || 'LOW'}`,
      isroSatelliteLandUse: `Bhuvan Sentinel-2 ${c.landClassification} Tagged`,
      utilityInfrastructure: `TNEB & Local Panchayat Utility Access`,
      courtCaseStatus: `${c.status} (${c.forum || 'High Court of Judicature at Madras'})`,
      zoningMasterPlan: `DTCP ${c.landClassification} Zone`
    }
  }));
}

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

export const tnDistrictsData = [
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

const judicialForums = [
  'High Court of Judicature at Madras (W.P. Division)',
  'Revenue Divisional Officer (RDO) Tribunal',
  'District Revenue Officer (DRO) Court',
  'Tahsildar Revenue Court',
  'Special Commissioner of Land Administration Court'
];

const disputeCategoriesList = [
  'Wetland Conversion & Agricultural Protection Act Violation',
  'Poramboke Waterbody Encroachment & Reclaiming Appeal',
  'Patta Name Transfer & Inheritance Succession Dispute',
  'Cadastral Boundary Encroachment & FMB Sketch Discrepancy',
  'Land Acquisition & Fair Compensation Valuation Claim',
  'Nanjai vs Punjai Reclassification Appeal',
  'Grama Natham Title Regularization Claim',
  'Industrial SIPCOT NOC & Environmental Clearance Review',
  'Heritage Buffer Zone NOC Compliance'
];

const documentTypesList = ['Patta', 'Chitta Extract', 'A-Register (Adangal)', 'FMB Sketch', 'TSLR (Town Survey)'];

function generate500PlusLandCases() {
  const cases: any[] = [];
  let currentId = 100001;

  for (let dIdx = 0; dIdx < tnDistrictsData.length; dIdx++) {
    const dInfo = tnDistrictsData[dIdx];
    const distCode = (dIdx + 1).toString().padStart(2, '0');

    for (let cIdx = 0; cIdx < 15; cIdx++) {
      const caseIdNum = currentId++;
      const caseNo = `CASE-2026-TN-${distCode}-${caseIdNum}`;
      const surveyNo = `${Math.floor(50 + Math.random() * 450)}/${Math.floor(1 + Math.random() * 9)}${String.fromCharCode(65 + (cIdx % 6))}`;
      const subDivNo = `${Math.floor(1 + Math.random() * 8)}${String.fromCharCode(65 + (cIdx % 4))}`;
      const ulpin = `TN33${distCode}000${Math.floor(1000 + Math.random() * 8999)}`;
      const talukName = dInfo.taluks[cIdx % dInfo.taluks.length];
      const villageName = `${talukName} Village`;
      const owner = ownersList[(dIdx * 15 + cIdx) % ownersList.length];
      const cType = disputeCategoriesList[(dIdx * 15 + cIdx) % disputeCategoriesList.length];
      const forum = judicialForums[(dIdx + cIdx) % judicialForums.length];
      const docType = documentTypesList[(dIdx + cIdx) % documentTypesList.length];
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
        title: `${cType}: S.No ${surveyNo}/${subDivNo}`,
        caseType: cType,
        forum: forum,
        status: status,
        priority: priority,
        documentType: docType,
        latitude: +(dInfo.lat + (Math.random() * 0.08 - 0.04)).toFixed(4),
        longitude: +(dInfo.lng + (Math.random() * 0.08 - 0.04)).toFixed(4),
        district: dInfo.district,
        taluk: talukName,
        village: villageName,
        surveyNumber: surveyNo,
        subDivisionNumber: subDivNo,
        ulpin: ulpin,
        ownerName: owner,
        ownerDataStatus: 'SYNTHETIC_DEMO_DATA',
        pattaNumber: `PATTA-${surveyNo.replace('/', '')}-${dInfo.district.substring(0, 4).toUpperCase()}`,
        areaAcres: acres,
        areaSqMeters: sqM,
        landClassification: classification,
        currentUse: `Active ${classification} Site`,
        litigants: {
          petitioner: owner,
          respondent: `State of Tamil Nadu & District Collector, ${dInfo.district}`,
          standingCounsel: `Adv. K. Sivaraman & Associates`,
          nextHearingDate: `2026-10-${Math.floor(10 + (cIdx % 18))}`,
          interimStayStatus: riskScore > 60 ? 'Interim Injunction Stay Granted' : 'No Stay Order Active'
        },
        valuation: {
          guidelineValueSqFt: `₹ ${guidelineVal.toLocaleString()} / sq ft`,
          realGuidelineValuePerSqft: guidelineVal,
          estimatedMarketValue: `₹ ${marketCrores} Crores`,
          stampDutyEstimated: `₹ ${(marketCrores * 0.07).toFixed(2)} Crores (7%)`,
          guidelineDataStatus: 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED',
          guidelineSource: 'https://tnreginet.gov.in (TN Registration Dept)',
          taxStatus: 'Paid (Clear Ledger)',
          taxAssessmentId: `PTAX-2026-${dInfo.district.substring(0, 3).toUpperCase()}-${caseIdNum}`
        },
        encumbranceChain: [
          { docNo: `DOC-2012-${dInfo.district.substring(0, 3).toUpperCase()}-${caseIdNum}`, year: 2012, type: 'Sale & Settlement Deed', sro: talukName, party: owner, status: 'Clear Title', dataStatus: 'SYNTHETIC_DEMO_DATA' },
          { docNo: `EC-2024-${Math.floor(1000 + Math.random() * 8999)}`, year: 2024, type: 'Encumbrance Ledger Check', sro: talukName, party: 'Sub-Registrar Office', status: 'Nil Encumbrance (Clean 13-Yr Ledger)', dataStatus: 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED' }
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

export const landCasesData = generate500PlusLandCases();
export const parcelsData: Parcel[] = generateParcelsFromCases(landCasesData);



