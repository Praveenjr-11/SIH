import { IdentifiedParcel } from '../tngis/tngisIdentifyAdapter.js';

export interface RegistrationRecordResponse {
  parcel_id: string;
  registration_status: string;
  encumbrance_status: string;
  encumbrance_entries: any[];
  market_value: string;
  verificationStatus: string;
  findings: any[];
}

export async function getRegistrationRecord(
  parcel: IdentifiedParcel,
  options?: { officerAuthenticated?: boolean }
): Promise<RegistrationRecordResponse> {
  const isClear = parcel.survey_number !== 'DISPUTED_123';
  return {
    parcel_id: parcel.parcel_id,
    registration_status: 'REGISTERED',
    encumbrance_status: isClear ? 'NIL_ENCUMBRANCE' : 'ACTIVE_ENCUMBRANCE',
    encumbrance_entries: isClear ? [] : [{
      doc_no: 'DOC-1234/2023',
      type: 'Mortgage',
      date: '2023-05-10'
    }],
    market_value: '₹ 15,00,000',
    verificationStatus: isClear ? 'VERIFIED' : 'CONFLICT_FOUND',
    findings: [
      {
        field: 'encumbrance',
        status: isClear ? 'MATCHED' : 'CONFLICT',
        source: 'TNREGINET',
        message: isClear ? 'No active encumbrances found.' : 'Active mortgage found.'
      }
    ]
  };
}
