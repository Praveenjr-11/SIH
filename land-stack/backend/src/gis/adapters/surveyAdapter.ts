import { IdentifiedParcel } from '../tngis/tngisIdentifyAdapter.js';

export interface SurveyRecordResponse {
  parcel_id: string;
  fmb_available: boolean;
  boundary_status: string;
  subdivision_status: string;
  verificationStatus: string;
  findings: any[];
}

export async function getSurveyRecord(
  parcel: IdentifiedParcel,
  options?: { officerAuthenticated?: boolean }
): Promise<SurveyRecordResponse> {
  const boundaryMatch = true; 
  return {
    parcel_id: parcel.parcel_id,
    fmb_available: true,
    boundary_status: boundaryMatch ? 'MATCHED' : 'CONFLICT',
    subdivision_status: 'VERIFIED',
    verificationStatus: boundaryMatch ? 'VERIFIED' : 'CONFLICT_FOUND',
    findings: [
      {
        field: 'boundary',
        status: boundaryMatch ? 'MATCHED' : 'CONFLICT',
        source: 'CollabLand',
        message: boundaryMatch ? 'FMB geometry matches spatial parcel.' : 'Geometry mismatch detected.'
      }
    ]
  };
}
