'use client';

import React, { useState } from 'react';
import { CaseStatus } from '../../types';

interface ConsolidatedReviewPanelProps {
  caseId: string | number;
  overallStatus: CaseStatus | string;
  timeline: any[];
  onDecision: (verdict: string, remarks: string) => void;
}

export default function ConsolidatedReviewPanel({ caseId, overallStatus, timeline, onDecision }: ConsolidatedReviewPanelProps) {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const conflicts = timeline.filter(t => t.status === 'CONFLICT_FOUND' || t.status === 'REJECTED');
  const allVerified = timeline.length > 0 && timeline.every(t => ['VERIFIED', 'NOT_APPLICABLE', 'APPROVED'].includes(t.status));

  const handleAction = async (verdict: string) => {
    if (!remarks.trim() && verdict !== 'APPROVED') {
      alert('Remarks are required for this action.');
      return;
    }
    setLoading(true);
    await onDecision(verdict, remarks);
    setLoading(false);
  };

  if (overallStatus !== 'CONSOLIDATED_REVIEW' && overallStatus !== 'CLARIFICATION_REQUIRED' && overallStatus !== 'OFFICER_RECOMMENDATION') {
    return null; // Only show when the case is ready for final review
  }

  return (
    <div className="bg-white rounded-lg border border-yellow-300 shadow-sm overflow-hidden mt-6">
      <div className="px-5 py-4 border-b border-yellow-200 bg-yellow-50 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-yellow-900 text-lg flex items-center gap-2">
            <span>⚖️</span> Consolidated Review & Final Decision
          </h3>
          <p className="text-sm text-yellow-700">Competent Authority Review Panel</p>
        </div>
        <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
          {overallStatus.replace(/_/g, ' ')}
        </span>
      </div>
      
      <div className="p-5">
        {conflicts.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h4 className="font-bold text-red-800 flex items-center gap-2 mb-2">
              <span>⚠️</span> Department Conflicts Detected
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {conflicts.map((c, idx) => (
                <li key={idx} className="text-sm text-red-700">
                  <strong>{c.departmentCode}</strong>: {c.remarks || 'Conflict reported without remarks'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {allVerified && conflicts.length === 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h4 className="font-bold text-green-800 flex items-center gap-2">
              <span>✅</span> All Departments Cleared
            </h4>
            <p className="text-sm text-green-700 mt-1">No conflicts found across revenue, survey, registration, and other checks.</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Officer Remarks / Justification</label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Enter final decision rationale..."
            ></textarea>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              disabled={loading}
              onClick={() => handleAction('APPROVED')}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md shadow-sm transition-colors disabled:opacity-50"
            >
              Approve Case
            </button>
            <button
              disabled={loading}
              onClick={() => handleAction('CLARIFICATION_REQUIRED')}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-md shadow-sm transition-colors disabled:opacity-50"
            >
              Request Clarification
            </button>
            <button
              disabled={loading}
              onClick={() => handleAction('REJECTED')}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md shadow-sm transition-colors disabled:opacity-50"
            >
              Reject Case
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
