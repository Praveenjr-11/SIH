import { Request, Response } from 'express';
import { gsiLayersData, parcelsData } from '../data/db.js';

export const getGSILayers = (req: Request, res: Response) => {
  res.json({
    success: true,
    provider: 'Geological Survey of India (GSI)',
    disclaimer: 'GSI geoscientific and geohazard advisory layers integrated for spatial land governance.',
    totalLayers: gsiLayersData.length,
    layers: gsiLayersData
  });
};

export const getGSIRiskAnalysis = (req: Request, res: Response) => {
  const { ulpin } = req.query;

  if (ulpin) {
    const parcel = parcelsData.find(p => p.ulpin.toLowerCase() === (ulpin as string).toLowerCase());
    if (!parcel) {
      return res.status(404).json({ success: false, error: 'Parcel not found for GSI risk lookup' });
    }
    return res.json({
      success: true,
      ulpin: parcel.ulpin,
      gsiAssessment: parcel.gsiGeology
    });
  }

  const overallAssessment = parcelsData.map(p => ({
    ulpin: p.ulpin,
    surveyNumber: p.surveyNumber,
    gsiGeology: p.gsiGeology
  }));

  res.json({
    success: true,
    provider: 'Geological Survey of India (GSI)',
    assessments: overallAssessment
  });
};
