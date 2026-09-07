import { Request, Response } from 'express';
import { mutationsData } from '../data/db.js';

export const getMutations = (req: Request, res: Response) => {
  const { status, ulpin } = req.query;

  let result = [...mutationsData];

  if (status) {
    result = result.filter(m => m.status.toLowerCase() === (status as string).toLowerCase());
  }

  if (ulpin) {
    result = result.filter(m => m.ulpin.toLowerCase() === (ulpin as string).toLowerCase());
  }

  res.json({
    success: true,
    total: result.length,
    mutations: result
  });
};

export const createMutation = (req: Request, res: Response) => {
  const { ulpin, surveyNumber, buyerName, sellerName, mutationType } = req.body;

  if (!ulpin || !buyerName || !sellerName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: ulpin, buyerName, sellerName'
    });
  }

  const newMutation = {
    id: `MUT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    applicationId: `APP-TN-${Math.floor(100000 + Math.random() * 900000)}`,
    ulpin,
    surveyNumber: surveyNumber || 'N/A',
    buyerName,
    sellerName,
    mutationType: mutationType || 'Sale Transfer',
    status: 'Spatial Verification' as const,
    appliedDate: new Date().toISOString().split('T')[0],
    updatedDate: new Date().toISOString().split('T')[0],
    spatialAuditStatus: 'Passed' as const,
    gsiClearance: 'Cleared' as const,
    remarks: 'Application logged via LAND STACK DPI backend API.'
  };

  mutationsData.push(newMutation);

  res.status(201).json({
    success: true,
    message: 'Mutation application submitted successfully',
    mutation: newMutation
  });
};
