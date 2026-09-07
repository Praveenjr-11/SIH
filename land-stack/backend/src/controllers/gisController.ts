import { Request, Response } from 'express';
import { adminBoundaries, gisLayersList, analyzeAnyLocationInIndia } from '../data/gisData.js';

export const getBoundaries = (req: Request, res: Response) => {
  const { level, state } = req.query;

  let result = [...adminBoundaries];

  if (level) {
    result = result.filter(b => b.level.toLowerCase() === (level as string).toLowerCase());
  }

  if (state) {
    result = result.filter(b => b.stateName.toLowerCase().includes((state as string).toLowerCase()));
  }

  res.json({
    success: true,
    total: result.length,
    boundaries: result
  });
};

export const getGisLayers = (req: Request, res: Response) => {
  res.json({
    success: true,
    total: gisLayersList.length,
    layers: gisLayersList
  });
};

export const analyzeLocation = (req: Request, res: Response) => {
  const latStr = (req.query.lat || req.body.lat) as string;
  const lngStr = (req.query.lng || req.body.lng) as string;

  if (!latStr || !lngStr) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: lat and lng (e.g. ?lat=28.6139&lng=77.2090)'
    });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid coordinates provided. Must be numeric lat and lng.'
    });
  }

  const analysis = analyzeAnyLocationInIndia(lat, lng);

  res.json({
    success: true,
    analysis
  });
};
