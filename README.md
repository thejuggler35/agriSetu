# AgriSetu (एग्रीसेतु) - Real-Time Localised AI Agroadvisory for Indian Farmers

AgriSetu is a farmer-first precision agricultural intelligence system providing real-time, hyper-localised regenerative agroadvisory and crop disease diagnosis using Gemini AI, OpenWeatherMap 5-day meteorological forecasts, Soil Health Card (SHC) parameters (data.gov.in standard), and Sentinel-2 satellite vegetation metrics (NDVI).

---

## 1. What's Live vs. What's Mocked / Seeded Today

| Component | Status Today | Real Data Source / Service |
| :--- | :--- | :--- |
| **Weather Forecast** | **LIVE** | OpenWeatherMap 5-Day Free API (`api.openweathermap.org/data/2.5/forecast`) queried via district latitude & longitude. *(Includes realistic seasonal fallback if API key is not yet configured).* |
| **AI Agroadvisory Engine** | **LIVE** | Google Gemini (`gemini-flash-latest` via `@google/genai` on Node/Express server) generating regenerative rotation strategies, NPK soil amendments, irrigation schedules, and climate risk alerts. *(Includes rule-based agronomist fallback if API key is not yet configured).* |
| **Crop Disease Doctor** | **LIVE** | Multimodal Gemini Vision (`gemini-flash-latest`) inspecting uploaded or photographed plant leaves to diagnose disease, urgency, confidence, organic remedies, chemical dosages, and field hygiene steps. |
| **Voice Audio Reader** | **LIVE** | Web Speech API (`window.speechSynthesis`) reading all advisories and diagnostic prescriptions aloud in clear Hindi (`hi-IN`) or English (`en-IN`). |
| **Soil Health Card Data** | **SEEDED / LOCAL FILE** | `/src/data/soil_and_ndvi.json` structured **identically** to the Government of India `data.gov.in` National Soil Health Card (SHC) schema (N, P, K in kg/ha, pH, Organic Carbon %, EC, Zinc, Iron). |
| **Satellite NDVI Index** | **SEEDED / LOCAL FILE** | `/src/data/soil_and_ndvi.json` formatted identically to a Copernicus Sentinel-2 MSI 10m surface reflectance NDVI query (mean NDVI 0.0 to 1.0, canopy health status, acquisition date). |

---

## 2. Exact Lines to Change to Go Live with `data.gov.in` and Google Earth Engine

### A. To Go Live with Government of India Soil Health Card (data.gov.in API)

Open `/server.ts` around **line 15-25**:

```typescript
// CURRENT CODE in server.ts (Reading from local data.gov.in harmonized JSON):
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'soil_and_ndvi.json');
let districtsData: any[] = [];
try {
  const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
  const parsed = JSON.parse(rawData);
  districtsData = parsed.districts || [];
} catch (err) { ... }
```

**Replace with live `data.gov.in` REST API call:**

```typescript
// LIVE data.gov.in INTEGRATION CODE:
async function fetchLiveSoilHealthCard(state: string, district: string) {
  const DATA_GOV_IN_API_KEY = process.env.DATA_GOV_IN_API_KEY;
  // Resource ID for National Soil Health Card Portal on data.gov.in:
  const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${DATA_GOV_IN_API_KEY}&format=json&filters[state]=${encodeURIComponent(state)}&filters[district]=${encodeURIComponent(district)}`;
  
  const response = await fetch(url);
  const data = await response.json();
  const record = data.records[0];
  
  return {
    shc_sample_id: record.sample_id,
    soil_type: record.soil_class_name,
    nitrogen_kg_ha: parseFloat(record.available_nitrogen),
    nitrogen_status: record.nitrogen_rating,
    phosphorus_kg_ha: parseFloat(record.available_phosphorus),
    phosphorus_status: record.phosphorus_rating,
    potassium_kg_ha: parseFloat(record.available_potassium),
    potassium_status: record.potassium_rating,
    ph: parseFloat(record.ph_value),
    ph_status: record.ph_rating,
    electrical_conductivity_dSm: parseFloat(record.ec_value),
    organic_carbon_percent: parseFloat(record.organic_carbon_percentage),
    zinc_ppm: parseFloat(record.zinc_value),
    iron_ppm: parseFloat(record.iron_value),
    testing_lab: record.lab_name
  };
}
```

---

### B. To Go Live with Google Earth Engine (GEE) Sentinel-2 NDVI

In `/server.ts` around **line 210-230** (inside `/api/advisory`), replace static `districtObj.ndvi` with live GEE query:

```javascript
// LIVE Google Earth Engine (GEE) Sentinel-2 NDVI QUERY:
import ee from '@google/earthengine';

async function fetchLiveSentinelNdvi(lat, lon) {
  // Point geometry with 5km agricultural buffer
  const point = ee.Geometry.Point([lon, lat]).buffer(5000);
  const now = ee.Date(new Date());
  const twoWeeksAgo = now.advance(-14, 'day');

  // Query Sentinel-2 Level-2A surface reflectance
  const s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(point)
    .filterDate(twoWeeksAgo, now)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

  // Compute Normalized Difference Vegetation Index: (B8 - B4) / (B8 + B4)
  const addNDVI = (img) => img.addBands(img.normalizedDifference(['B8', 'B4']).rename('NDVI'));
  const ndviCollection = s2.map(addNDVI).select('NDVI');
  const meanNdvi = ndviCollection.median().reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: point,
    scale: 10
  }).get('NDVI');

  const ndviValue = await new Promise((resolve) => meanNdvi.evaluate(resolve));
  return {
    mean_ndvi: Number(ndviValue.toFixed(2)),
    vegetation_status: ndviValue > 0.6 ? 'Vigorous Green Canopy' : ndviValue > 0.4 ? 'Moderate Canopy' : 'Sparse/Fallow',
    sensor: 'Sentinel-2 MSI (Copernicus GEE Live)',
    acquisition_date: new Date().toISOString().split('T')[0]
  };
}
```

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env.local` or set these in your hosting environment:

```env
# 1. Google Gemini API Key (Required for AI generation & Multimodal Vision)
GEMINI_API_KEY="AIzaSy..."

# 2. OpenWeatherMap API Key (Free tier 5-day forecast from openweathermap.org)
OPENWEATHERMAP_API_KEY="your_open_weather_map_key"

# 3. Optional: Live data.gov.in API Key
# DATA_GOV_IN_API_KEY="your_data_gov_in_key"
```

---

## 4. Open Data Model for States (Interoperability Standard)

AgriSetu is designed as **Digital Public Infrastructure (DPI)**. Any State Agriculture Department can publish district data in this shape:

```json
{
  "state": "Maharashtra",
  "district": "Nashik",
  "soil_health": {
    "soil_type": "Medium Black Cotton Soil",
    "nitrogen_kg_ha": 195,
    "phosphorus_kg_ha": 13.2,
    "potassium_kg_ha": 420,
    "ph": 7.9,
    "electrical_conductivity_dSm": 0.44,
    "organic_carbon_percent": 0.54,
    "zinc_ppm": 0.51,
    "iron_ppm": 4.1
  },
  "ndvi": {
    "mean_ndvi": 0.55,
    "vegetation_status": "Moderate Canopy",
    "sensor": "Sentinel-2 MSI",
    "acquisition_date": "2025-02-27"
  },
  "weather": {
    "forecast_5day": [
      {
        "date": "2025-03-01",
        "temp_max": 31,
        "temp_min": 18,
        "rain_probability_percent": 10,
        "rainfall_mm": 0,
        "humidity": 45
      }
    ]
  },
  "last_updated": "2025-03-01T06:00:00Z"
}
```

When a state publishes feeds conforming to this schema, the AgriSetu advisory engine immediately activates for all farmers in that state without any code alterations.
