'use client';

import React, { useState } from 'react';
import { DepartmentVerificationStatus, VerificationResult } from '../../types';

interface CaseDepartmentTimelineProps {
  caseId: string | number;
  timeline: any[];
  officerRole?: string;
  onRefresh?: () => void;
}

const STATUS_STYLES: Record<string, { bg: string, text: string, label: string, icon: string }> = {
  PENDING: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Pending', icon: '⏳' },
  IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'In Progress', icon: '🔄' },
  VERIFIED: { bg: 'bg-green-50', text: 'text-green-700', label: 'Verified', icon: '✅' },
  CONFLICT_FOUND: { bg: 'bg-red-50', text: 'text-red-700', label: 'Conflict', icon: '❌' },
  DOCUMENT_REQUIRED: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Doc Required', icon: '📄' },
  FIELD_INSPECTION_REQUIRED: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Inspection', icon: '🗺️' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', icon: '⛔' },
  NOT_APPLICABLE: { bg: 'bg-gray-50', text: 'text-gray-400', label: 'N/A', icon: '➖' },
};

const DEPARTMENTS = [
  { code: 'REVENUE', label: 'Revenue Department' },
  { code: 'SURVEY', label: 'Survey & Settlement' },
  { code: 'REGISTRATION', label: 'Registration Department' },
  { code: 'GOVERNMENT_LAND', label: 'Govt. Land (CLA)' },
  { code: 'PLANNING', label: 'Planning (DTCP/CMDA)' },
  { code: 'ENVIRONMENT', label: 'Environment / PWD' }
];

export default function CaseDepartmentTimeline({ caseId, timeline, officerRole, onRefresh }: CaseDepartmentTimelineProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (deptCode: string, action: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('officerToken');
      const res = await fetch(`http://localhost:3001/api/v1/cases/${caseId}/department-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          departmentCode: deptCode,
          verdict: action,
          remarks: `${action} submitted by ${officerRole}`
        })
      });
      if (res.ok && onRefresh) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-bold text-gray-800 text-lg">Department Verifications</h3>
        <p className="text-sm text-gray-500">Parallel inter-departmental clearance checks</p>
      </div>
      
      <div className="p-5">
        <div className="space-y-4">
          {DEPARTMENTS.map(dept => {
            const record = timeline.find(t => t.departmentCode === dept.code) || { status: 'PENDING' };
            const style = STATUS_STYLES[record.status] || STATUS_STYLES.PENDING;
            const canAct = officerRole === dept.code || officerRole === 'SYSTEM_ADMIN';
            
            return (
              <div key={dept.code} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{style.icon}</span>
                    <h4 className="font-semibold text-gray-800">{dept.label}</h4>
                  </div>
                  {record.remarks && (
                    <p className="mt-1 text-sm text-gray-600 ml-7">{record.remarks}</p>
                  )}
                  {record.officerName && (
                    <p className="mt-1 text-xs text-gray-400 ml-7">
                      Verified by {record.officerName} on {new Date(record.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2 w-full sm:w-auto ml-7 sm:ml-0">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                  
                  {canAct && record.status === 'PENDING' && (
                    <div className="flex gap-2 mt-2">
                      <button 
                        disabled={loading}
                        onClick={() => handleAction(dept.code, 'VERIFIED')}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded shadow-sm disabled:opacity-50"
                      >
                        Verify
                      </button>
                      <button 
                        disabled={loading}
                        onClick={() => handleAction(dept.code, 'CONFLICT_FOUND')}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded shadow-sm disabled:opacity-50"
                      >
                        Report Conflict
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
