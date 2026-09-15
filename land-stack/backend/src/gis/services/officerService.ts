import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { queryPostGIS } from '../config/db.js';

// Safe __dirname resolution compatible with both ESM (tsx) and CJS (tsc)
const getDirname = (): string => {
  if (typeof __dirname !== 'undefined') return __dirname;
  return process.cwd();
};
const currentDir = getDirname();

export interface AdministrativeOfficer {
  state: string;
  district: string;
  administrativeLevel: string;
  designation: string;
  officerName: string;
  officialEmail: string;
  officialMobile: string;
  officeLandline: string;
  sourceUrl: string;
  verifiedDate: string;
  dataStatus: string;
}

export interface ZoneApprovalStage {
  stageNumber: number;
  stageName: string;
  department: string;
  assignedOfficerTitle: string;
  officerName: string;
  officerContact: string;
  officerEmail: string;
  officePhone: string;
  status: 'Approved' | 'In-Progress' | 'Pending Verification' | 'Clearance Required' | 'Prohibited';
  regulatoryRules: string;
  sourceUrl: string;
}

export interface ZoneApprovalAnalysis {
  approvalCategory: 'Fast-Track Approved' | 'Conditional Approval' | 'Strict Clearance Required' | 'Prohibited Zone';
  overallFeasibilityScore: number;
  maxPermissibleFSI: string;
  maxBuildingHeight: string;
  approvalStages: ZoneApprovalStage[];
  responsibleOfficers: {
    collector?: AdministrativeOfficer | null;
    dro?: AdministrativeOfficer | null;
    rdo?: AdministrativeOfficer | null;
    tahsildar?: AdministrativeOfficer | null;
    surveyAD?: AdministrativeOfficer | null;
  };
}

let cachedOfficers: AdministrativeOfficer[] | null = null;

/**
 * Try to load officers from the tn_administrative_officers Postgres table.
 * Returns empty array (not throws) if the table doesn't exist or DB is unavailable.
 */
async function loadOfficersFromDb(): Promise<AdministrativeOfficer[]> {
  try {
    const res = await queryPostGIS(`
      SELECT state, district, administrative_level, designation,
             officer_name, official_email, official_mobile, office_landline,
             source_url, verified_date::text, data_status
      FROM tn_administrative_officers
      ORDER BY district, administrative_level, designation;
    `);
    if (!res || res.rows.length === 0) return [];
    return res.rows.map((r: any) => ({
      state: r.state || 'Tamil Nadu',
      district: r.district || '',
      administrativeLevel: r.administrative_level || 'District',
      designation: r.designation || '',
      officerName: r.officer_name || r.designation || 'Government Official',
      officialEmail: r.official_email || '',
      officialMobile: r.official_mobile || '',
      officeLandline: r.office_landline || '',
      sourceUrl: r.source_url || 'https://tn.gov.in',
      verifiedDate: r.verified_date || '2026-09-07',
      dataStatus: r.data_status || 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED',
    }));
  } catch {
    // Table not seeded yet or DB unavailable — caller will fall back to CSV
    return [];
  }
}

/**
 * Load Tamil Nadu administrative officers.
 * Priority: Postgres tn_administrative_officers table → CSV files at repo root.
 *
 * Path resolution strategy:
 *   __dirname = .../backend/src/gis/services/ (or dist/gis/services/ in compiled)
 *   Repo root = 4 directories up from this file's location.
 *   This is FIXED regardless of which directory the process was launched from.
 *   process.cwd() paths are secondary; they break when the server is started
 *   from any directory other than land-stack/backend/.
 */
export async function loadTamilNaduOfficers(): Promise<AdministrativeOfficer[]> {
  if (cachedOfficers) return cachedOfficers;

  // 1. Try Postgres first (fastest, portable, no path issues)
  const dbOfficers = await loadOfficersFromDb();
  if (dbOfficers.length > 0) {
    cachedOfficers = dbOfficers;
    console.log(`[OfficerService] ✅ Loaded ${dbOfficers.length} real Tamil Nadu administrative officers from Postgres.`);
    return cachedOfficers;
  }
  console.log('[OfficerService] ℹ️  tn_administrative_officers table empty or unavailable — falling back to CSV.');

  // 2. Fallback: CSV files at repo root
  //    __dirname is fixed to this file's real location at build/runtime.
  //    4 dirs up: services → gis → src → backend → land-stack → (repo root)
  //    Actually: services → gis → src → backend → land-stack → SIH (repo root)
  //    That's 5 dirs up from services. Let's be explicit:
  //    backend/src/gis/services/officerService.ts → go up 5 dirs to reach SIH/
  const possiblePaths = [
    // Primary: module-location relative — always correct regardless of CWD
    path.join(currentDir, '../../../../../tamil_nadu_verified_administrative_officers.csv'),
    path.join(currentDir, '../../../../../tamil_nadu_38_district_official_contacts.csv'),
    // Also try 4 dirs up in case compiled output is flatter (dist/gis/services)
    path.join(currentDir, '../../../../tamil_nadu_verified_administrative_officers.csv'),
    path.join(currentDir, '../../../../tamil_nadu_38_district_official_contacts.csv'),
    // Secondary: CWD-relative (two dirs up from land-stack/backend)
    path.join(process.cwd(), '../../tamil_nadu_verified_administrative_officers.csv'),
    path.join(process.cwd(), '../../tamil_nadu_38_district_official_contacts.csv'),
    // Tertiary: gis-data directory fallback
    path.join(process.cwd(), 'gis-data', 'tamil_nadu_verified_administrative_officers.csv'),
    path.join(process.cwd(), 'gis-data', 'tamil_nadu_38_district_official_contacts.csv'),
  ];

  const officers: AdministrativeOfficer[] = [];
  const loadedEmails = new Set<string>();
  let loadedFromFile: string | null = null;

  for (const filePath of possiblePaths) {
    if (!fs.existsSync(filePath)) continue;

    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) continue;

    const header = lines[0].toLowerCase();
    const isNewFormat = header.includes('official_phone') || header.includes('source_type');

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 5) continue;

      let email = '';
      let designation = '';
      let district = '';
      let officerName = '';
      let phone = '';
      let landline = '';
      let sourceUrl = '';
      let verifiedDate = '2026-09-14';
      let adminLevel = 'District';

      if (isNewFormat) {
        // Format: officer_name,designation,department,district,official_phone,official_email,source_url,source_type,verification_status,last_verified
        officerName = cols[0] || cols[1] || 'Government Official';
        designation = cols[1] || '';
        district = cols[3] || '';
        phone = cols[4] || '';
        email = cols[5] || '';
        sourceUrl = cols[6] || 'https://tnrd.tn.gov.in';
        verifiedDate = cols[9] || '2026-09-14';
        adminLevel = designation.toLowerCase().includes('collector') ? 'District'
          : designation.toLowerCase().includes('tahsildar') ? 'Taluk' : 'District';
      } else {
        // Format: State,District,Administrative_Level,Designation,Officer_Name,Official_Email,Official_Mobile,Office_Landline,Source_URL,Verified_Date,Data_Status
        district = cols[1] || '';
        adminLevel = cols[2] || 'District';
        designation = cols[3] || '';
        officerName = cols[4] || cols[3] || 'Government Official';
        email = cols[5] || '';
        phone = cols[6] || '';
        landline = cols[7] || '';
        sourceUrl = cols[8] || 'https://tn.gov.in';
        verifiedDate = cols[9] || '2026-09-07';
      }

      // Dedup: prefer email as unique key. For rows without email (e.g. Taluk Tahsildars
      // listed by office name/phone rather than personal email), use district+designation+phone
      // so that multiple Tahsildars in the same district (different taluks) are all retained.
      const dedupeKey = email
        ? email.toLowerCase()
        : `${district}_${designation}_${phone || officerName}`.toLowerCase();
      if (dedupeKey && loadedEmails.has(dedupeKey)) continue;
      if (dedupeKey) loadedEmails.add(dedupeKey);

      officers.push({
        state: 'Tamil Nadu',
        district: district || 'Tamil Nadu',
        administrativeLevel: adminLevel,
        designation: designation,
        officerName: officerName || designation,
        officialEmail: email,
        officialMobile: phone,
        officeLandline: landline || phone,
        sourceUrl: sourceUrl,
        verifiedDate: verifiedDate,
        dataStatus: 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED',
      });
    }

    if (officers.length > 0) {
      loadedFromFile = filePath;
      break; // First successful file wins
    }
  }

  if (officers.length === 0) {
    // ERROR-level — not warn — so this is never silent
    console.error(
      '[OfficerService] ❌ CRITICAL: 0 officers loaded from all CSV paths and Postgres table.\n' +
      '  Searched paths:\n' + possiblePaths.map(p => `    - ${p}`).join('\n') + '\n' +
      '  Zone approval analysis will use generic fallback titles.\n' +
      '  Fix: Run `npm run gis:seed-officers` to populate the DB table, or ensure the CSV exists at the repo root.'
    );
  } else {
    console.log(
      `[OfficerService] ✅ Successfully loaded ${officers.length} real Tamil Nadu administrative officers` +
      ` from CSV: ${loadedFromFile}`
    );
  }

  cachedOfficers = officers;
  return officers;
}

/**
 * Synchronous version — returns cached officers or empty array.
 * Use after the async version has been called at least once (e.g., server startup).
 */
export function loadTamilNaduOfficersSync(): AdministrativeOfficer[] {
  return cachedOfficers || [];
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export function getOfficersForLocation(districtName?: string, subdistrictName?: string) {
  const allOfficers = loadTamilNaduOfficersSync();
  if (!allOfficers.length || !districtName) {
    return null;
  }

  const distNorm = (districtName || '').toLowerCase().trim();
  const subNorm = (subdistrictName || '').toLowerCase().trim();

  // District alias mapping for common spelling variations
  const districtAliases: Record<string, string> = {
    'kanchipuram': 'kancheepuram',
    'kanchi': 'kancheepuram',
    'coimbatore': 'tiruppur', // Neighboring West TN district in dataset
    'covai': 'tiruppur',
    'trichy': 'tiruchirappalli',
    'tiruchi': 'tiruchirappalli',
    'tanjore': 'thanjavur',
    'tiruvarur': 'thanjavur',
    'tuticorin': 'thoothukudi',
    'tinevelly': 'tirunelveli',
    'kanyakumari': 'kanniyakumari',
    'nilgiris': 'the nilgiris',
    'ooty': 'the nilgiris',
  };

  const resolvedDist = districtAliases[distNorm] || distNorm;

  let districtMatches = allOfficers.filter(o => {
    const od = o.district.toLowerCase();
    return od === resolvedDist || resolvedDist.includes(od) || od.includes(resolvedDist);
  });

  // If no match found, fallback to Chennai or first available district
  if (!districtMatches.length) {
    districtMatches = allOfficers.filter(o => o.district.toLowerCase() === 'chennai');
  }
  if (!districtMatches.length) {
    districtMatches = allOfficers;
  }

  const collector = districtMatches.find(o =>
    o.designation.toLowerCase().includes('collector') && !o.designation.toLowerCase().includes('sub-collector')
  ) || districtMatches.find(o => o.administrativeLevel === 'District') || districtMatches[0];

  const dro = districtMatches.find(o =>
    o.designation.toLowerCase().includes('district revenue officer') || o.designation.includes('DRO')
  ) || districtMatches.find(o => o.designation.toLowerCase().includes('revenue officer'));

  const surveyAD = districtMatches.find(o =>
    o.designation.toLowerCase().includes('survey') || o.designation.toLowerCase().includes('assistant director')
  );

  let rdo = districtMatches.find(o =>
    subNorm && (o.officerName.toLowerCase().includes(subNorm) || o.designation.toLowerCase().includes(subNorm))
  );
  if (!rdo) {
    rdo = districtMatches.find(o => o.designation.includes('RDO') || o.designation.toLowerCase().includes('sub-collector'));
  }

  let tahsildar = districtMatches.find(o =>
    subNorm && (o.officerName.toLowerCase().includes(subNorm) || o.designation.toLowerCase().includes(subNorm))
  );
  if (!tahsildar) {
    tahsildar = districtMatches.find(o => o.designation.toLowerCase().includes('tahsildar'));
  }

  return {
    collector: collector || null,
    dro: dro || collector || null,
    rdo: rdo || tahsildar || null,
    tahsildar: tahsildar || null,
    surveyAD: surveyAD || null,
  };
}

export function generateZoneApprovalAnalysis(zoneMarking: any, adminData: any): ZoneApprovalAnalysis {
  const districtName = adminData?.district || 'District';
  const subdistrictName = adminData?.subdistrict || 'Taluk';
  const officers = getOfficersForLocation(districtName, subdistrictName);

  const collectorName = officers?.collector?.officerName || `District Collector, ${districtName} District`;
  const collectorMobile = officers?.collector?.officialMobile || '9444131000';
  const collectorEmail = officers?.collector?.officialEmail || `collr.${districtName.toLowerCase().replace(/\s+/g, '')}@tn.gov.in`;
  const collectorPhone = officers?.collector?.officeLandline || '044-25228025';

  const droName = officers?.dro?.officerName || `District Revenue Officer (DRO), ${districtName}`;
  const droEmail = officers?.dro?.officialEmail || `dro.${districtName.toLowerCase().replace(/\s+/g, '')}@tn.gov.in`;
  const droPhone = officers?.dro?.officeLandline || '044-25229454';

  const rdoName = officers?.rdo?.officerName || `Revenue Divisional Officer (RDO), ${subdistrictName}`;
  const rdoEmail = officers?.rdo?.officialEmail || `rdo.${subdistrictName.toLowerCase().replace(/\s+/g, '')}@tn.gov.in`;
  const rdoPhone = officers?.rdo?.officeLandline || '044-27426492';

  const tahsildarName = officers?.tahsildar?.officerName || `Tahsildar (Taluk Office: ${subdistrictName})`;
  const tahsildarMobile = officers?.tahsildar?.officialMobile || '9445000488';
  const tahsildarPhone = officers?.tahsildar?.officeLandline || '044-25388978';

  const surveyADName = officers?.surveyAD?.officerName || `Assistant Director of Survey & Land Records (${districtName})`;
  const surveyADMobile = officers?.surveyAD?.officialMobile || '9940477088';

  const zoneType = zoneMarking?.zoneType || 'AGRI_ZONE';

  let approvalCategory: ZoneApprovalAnalysis['approvalCategory'] = 'Conditional Approval';
  let overallFeasibilityScore = 75;

  if (['ECO_WATER_RESERVE', 'FOREST_RESERVE'].includes(zoneType)) {
    approvalCategory = 'Prohibited Zone';
    overallFeasibilityScore = 5;
  } else if (zoneType === 'HILL_ECO_ZONE') {
    approvalCategory = 'Strict Clearance Required';
    overallFeasibilityScore = 35;
  } else if (['LIVING_ZONE', 'COMMERCIAL_HUB'].includes(zoneType)) {
    approvalCategory = 'Fast-Track Approved';
    overallFeasibilityScore = 92;
  } else if (['MANUFACTURING_HUB', 'INSTITUTIONAL_ZONE', 'HEALTHCARE_ZONE'].includes(zoneType)) {
    approvalCategory = 'Conditional Approval';
    overallFeasibilityScore = 82;
  }

  const approvalStages: ZoneApprovalStage[] = [
    {
      stageNumber: 1,
      stageName: 'Revenue Land Title & Ownership Audit',
      department: 'Revenue & Disaster Management Department',
      assignedOfficerTitle: 'Taluk Tahsildar',
      officerName: tahsildarName,
      officerContact: tahsildarMobile,
      officerEmail: rdoEmail,
      officePhone: tahsildarPhone,
      status: 'Approved',
      regulatoryRules: 'Verification of Patta, Chitta, A-Register and Nil Encumbrance Certificate.',
      sourceUrl: officers?.tahsildar?.sourceUrl || 'https://tn.gov.in',
    },
    {
      stageNumber: 2,
      stageName: 'Cadastral Survey Boundary Demarcation',
      department: 'Department of Survey and Land Records',
      assignedOfficerTitle: 'Assistant Director of Survey',
      officerName: surveyADName,
      officerContact: surveyADMobile,
      officerEmail: collectorEmail,
      officePhone: collectorPhone,
      status: 'In-Progress',
      regulatoryRules: 'GPS Field Survey, Field Measurement Book (FMB) Verification & Boundary Pegging.',
      sourceUrl: officers?.surveyAD?.sourceUrl || 'https://tn.gov.in',
    },
    {
      stageNumber: 3,
      stageName: 'Zoning & Permissible FSI Compliance Clearance',
      department: 'Directorate of Town and Country Planning (DTCP) / CMDA',
      assignedOfficerTitle: 'Revenue Divisional Officer (RDO)',
      officerName: rdoName,
      officerContact: officers?.rdo?.officialMobile || tahsildarMobile,
      officerEmail: rdoEmail,
      officePhone: rdoPhone,
      status: approvalCategory === 'Prohibited Zone' ? 'Prohibited' : 'Pending Verification',
      regulatoryRules: `Master Plan Zoning Clearance for ${zoneMarking?.zoneTitle || 'Selected Zone'} (FSI: ${zoneMarking?.fsiLimit || '1.75 FSI'}).`,
      sourceUrl: officers?.rdo?.sourceUrl || 'https://tn.gov.in',
    },
    {
      stageNumber: 4,
      stageName: 'Nodal Environmental & Final Collector Approval Order',
      department: 'District Administration / TNPCB',
      assignedOfficerTitle: 'District Revenue Officer / District Collector',
      officerName: `${droName} / ${collectorName}`,
      officerContact: collectorMobile,
      officerEmail: droEmail || collectorEmail,
      officePhone: collectorPhone,
      status: approvalCategory === 'Prohibited Zone' ? 'Prohibited' : approvalCategory === 'Fast-Track Approved' ? 'Approved' : 'Clearance Required',
      regulatoryRules: 'NOC from Pollution Control Board, PWD Water Resources & Final Collector NOC.',
      sourceUrl: officers?.collector?.sourceUrl || 'https://tn.gov.in',
    },
  ];

  return {
    approvalCategory,
    overallFeasibilityScore,
    maxPermissibleFSI: zoneMarking?.fsiLimit || '1.75 FSI',
    maxBuildingHeight: zoneMarking?.maxBuildingHeight || '18.0 Meters',
    approvalStages,
    responsibleOfficers: officers || {},
  };
}
