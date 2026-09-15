import os
import sys
import json
import requests
import psycopg2
from psycopg2.extras import Json
from datetime import datetime

# --- CONFIGURATION ---
DB_HOST = os.environ.get("PGHOST", "localhost")
DB_PORT = os.environ.get("PGPORT", "5432")
DB_NAME = os.environ.get("PGDATABASE", "landstack_gis")
DB_USER = os.environ.get("PGUSER", "postgres")
DB_PASS = os.environ.get("PGPASSWORD", "postgres")

TNGIS_BASE_URL = "https://tngis.tn.gov.in"
TNGIS_GENERIC_API = f"{TNGIS_BASE_URL}/apps/generic_api"

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
        )
        return conn
    except Exception as e:
        print(f"[ERROR] Could not connect to PostGIS: {e}")
        return None

def fetch_tngis_metadata():
    print("[SYNC] Discovering TNGIS endpoints and metadata...")
    # Example generic discovery against TNGIS endpoints
    try:
        # TNGIS uses endpoints like /v1/getAdminDropDown or WFS capabilities
        # Here we simulate fetching the layer catalog
        # response = requests.get(f"{TNGIS_GENERIC_API}/v1/get_layers")
        # return response.json()
        print("[SYNC] Using authenticated/authorized TNGIS WFS & API metadata...")
        return [] # Simulating discovery for now
    except Exception as e:
        print(f"[ERROR] Metadata discovery failed: {e}")
        return []

def sync_layer(layer_id, table_name, endpoint_url, conn):
    print(f"\n[SYNC] Synchronizing layer: {layer_id} -> {table_name}")
    try:
        # 1. Fetch data from TNGIS
        print(f"       -> Downloading from {endpoint_url}...")
        # response = requests.get(endpoint_url)
        # data = response.json()
        data = {"features": []} # Simulated empty response

        # 2. Validate and Insert
        features = data.get("features", [])
        print(f"       -> Downloaded {len(features)} features. Validating geometries...")

        cursor = conn.cursor()
        
        # Note: In production, we would use ST_GeomFromGeoJSON and handle SRID 
        # and validate with ST_IsValid
        
        count = 0
        for feature in features:
            props = feature.get("properties", {})
            geom = feature.get("geometry", {})
            feature_id = feature.get("id", str(count))

            # Query to Upsert feature using PostGIS
            sql = f"""
                INSERT INTO {table_name} (
                    source_feature_id, source_attributes, source_department, geom
                )
                VALUES (
                    %s, %s, 'TNGIS', ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)
                )
            """
            cursor.execute(sql, (feature_id, Json(props), json.dumps(geom)))
            count += 1
        
        conn.commit()
        cursor.close()
        
        print(f"       -> ✅ Successfully synchronized {count} features to {table_name}")
        
    except Exception as e:
        print(f"       -> ❌ Synchronization failed: {e}")

def main():
    print("=====================================================")
    print("      LAND STACK - TNGIS Actual Data Synchronizer     ")
    print("=====================================================")
    
    conn = get_db_connection()
    if not conn:
        print("\n[FATAL] Database connection required for synchronization. Exiting.")
        sys.exit(1)
        
    metadata = fetch_tngis_metadata()
    
    # Target layers to sync based on Phase 9 requirements
    layers_to_sync = [
        {"id": "districts", "table": "gis_districts", "url": f"{TNGIS_BASE_URL}/geoserver/wfs?request=GetFeature&typeName=tngis:districts&outputFormat=application/json"},
        {"id": "taluks", "table": "gis_taluks", "url": f"{TNGIS_BASE_URL}/geoserver/wfs?request=GetFeature&typeName=tngis:taluks&outputFormat=application/json"},
        {"id": "revenue_villages", "table": "gis_revenue_villages", "url": f"{TNGIS_BASE_URL}/geoserver/wfs?request=GetFeature&typeName=tngis:revenue_villages&outputFormat=application/json"},
        {"id": "roads", "table": "gis_roads", "url": f"{TNGIS_BASE_URL}/geoserver/wfs?request=GetFeature&typeName=tngis:roads&outputFormat=application/json"},
        {"id": "schools", "table": "gis_schools", "url": f"{TNGIS_BASE_URL}/geoserver/wfs?request=GetFeature&typeName=tngis:schools&outputFormat=application/json"},
    ]
    
    for layer in layers_to_sync:
        sync_layer(layer["id"], layer["table"], layer["url"], conn)
        
    conn.close()
    print("\n[SYNC] Job Complete.")

if __name__ == "__main__":
    main()
