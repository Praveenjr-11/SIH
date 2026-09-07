# GSI Geological Data — Download Instructions

## Source
**Geological Survey of India (GSI)**
National Geoscience Data Repository (NGDR)

## Official Portal
https://geodataindia.gov.in/

## How to Download

1. **Register** for a free account at https://geodataindia.gov.in/
2. **Login** to the NGDR portal
3. **Navigate** to: Map Services → Geological Map of India
4. **Select** the dataset you need (e.g., Lithology, Rock Type, Geological Age)
5. **Download** in GeoJSON or Shapefile format
6. **Place** the downloaded `.geojson` file in this directory

## Expected File Format

The importer expects GeoJSON FeatureCollections with geological attributes.

### Common property names the importer auto-detects:

| GSI Property | Maps To |
|---|---|
| `GLG_CODE` / `MAP_SYMBOL` | `geology_code` |
| `UNIT_NAME` / `MAP_UNIT` | `unit_name` |
| `ROCK_TYPE` | `rock_type` |
| `LITHOLOGY` / `LITHO` | `lithology` |
| `AGE` / `GEO_AGE` | `age` |
| `FORMATION` | `formation` |
| `DESCRIPTIO` | `description` |
| `ROCK_FORM` / `ROCK_FORMATION` | `rock_formation` |
| `GEO_UNIT` | `geomorphology_unit` |

## Running the Import

After placing files here, run:

```bash
cd backend
npm run gis:import-gsi
```

## Important Notes

- Do NOT fabricate data. Only place genuinely downloaded GSI files here.
- The importer auto-detects CRS and property mappings.
- Data flows: Raw File → Validation → Staging Table → Production Table
- An ingestion report is generated for every import.

## Attribution

All imported GSI data must be attributed to:
**Geological Survey of India (GSI), Ministry of Mines, Government of India**
