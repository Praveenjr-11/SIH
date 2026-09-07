import { Request, Response } from 'express';
import { analyticsData, architectureData } from '../data/db.js';

export const getAnalytics = (req: Request, res: Response) => {
  res.json({
    success: true,
    analytics: analyticsData
  });
};

export const getArchitectureSpecs = (req: Request, res: Response) => {
  res.json({
    success: true,
    architecture: architectureData
  });
};
