import { Request, Response } from 'express';
import { parcelsData } from '../data/db.js';

export const getAllParcels = (req: Request, res: Response) => {
  const { status, classification, search } = req.query;

  let result = [...parcelsData];

  if (status) {
    result = result.filter(
      p => p.verificationStatus.toLowerCase() === (status as string).toLowerCase()
    );
  }

  if (classification) {
    result = result.filter(
      p => p.landClassification.toLowerCase().includes((classification as string).toLowerCase())
    );
  }

  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(
      p =>
        p.ulpin.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: result.length,
    parcels: result
  });
};

export const getParcelByUlpin = (req: Request, res: Response) => {
  const { ulpin } = req.params;
  const parcel = parcelsData.find(p => p.ulpin.toLowerCase() === ulpin.toLowerCase());

  if (!parcel) {
    return res.status(404).json({
      success: false,
      error: `Parcel with ULPIN '${ulpin}' not found.`
    });
  }

  res.json({
    success: true,
    parcel
  });
};

export const getParcelGeoJSON = (req: Request, res: Response) => {
  const geojsonFeatures = parcelsData.map(p => ({
    type: 'Feature',
    id: p.id,
    properties: {
      ulpin: p.ulpin,
      surveyNumber: p.surveyNumber,
      ownerName: p.ownerName,
      landClassification: p.landClassification,
      verificationStatus: p.verificationStatus,
      gsiRiskLevel: p.gsiGeology.landslideRiskLevel,
      areaAcres: p.areaAcres
    },
    geometry: {
      type: 'Polygon',
      coordinates: p.coordinates
    }
  }));

  res.json({
    type: 'FeatureCollection',
    features: geojsonFeatures
  });
};
