export type Language = 'en' | 'hi';

export interface SoilHealthData {
  shc_sample_id: string;
  soil_type: string;
  soil_type_hi?: string;
  nitrogen_kg_ha: number;
  nitrogen_status: string;
  phosphorus_kg_ha: number;
  phosphorus_status: string;
  potassium_kg_ha: number;
  potassium_status: string;
  ph: number;
  ph_status: string;
  electrical_conductivity_dSm: number;
  ec_status: string;
  organic_carbon_percent: number;
  organic_carbon_status: string;
  zinc_ppm: number;
  zinc_status: string;
  iron_ppm: number;
  iron_status: string;
  sample_depth_cm: string;
  testing_lab: string;
}

export interface NdviData {
  mean_ndvi: number;
  vegetation_status: string;
  vegetation_status_hi?: string;
  sensor: string;
  acquisition_date: string;
  cloud_cover_percent: number;
}

export interface DistrictInfo {
  id: string;
  state: string;
  state_hi: string;
  district: string;
  district_hi: string;
  agro_climatic_zone: string;
  lat: number;
  lon: number;
  major_crops: string[];
  major_crops_hi: string[];
  soil_health: SoilHealthData;
  ndvi: NdviData;
}

export interface DailyWeatherForecast {
  date: string;
  day_name: string;
  day_name_hi: string;
  temp_max: number;
  temp_min: number;
  humidity: number;
  rain_probability_percent: number;
  rainfall_mm: number;
  wind_speed_kmh: number;
  weather_main: string;
  weather_description: string;
  icon: string;
}

export interface WeatherData {
  district: string;
  state: string;
  lat: number;
  lon: number;
  is_live: boolean;
  source: string;
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed_kmh: number;
    description: string;
    icon: string;
  };
  forecast_5day: DailyWeatherForecast[];
}

export interface ClimateRiskFlag {
  title: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  mitigation: string;
}

export interface AdvisoryResponse {
  crop: string;
  district: string;
  state: string;
  language: Language;
  timestamp: string;
  summary: string;
  regenerativeRecommendation: {
    title: string;
    plantingRotationStrategy: string;
    coverCropIntercrop: string;
    biodiversityBenefit: string;
  };
  soilAmendments: {
    title: string;
    npkAdjustment: string;
    organicMatterPlan: string;
    micronutrientsAndPhCare: string;
    bioFertilizers: string;
  };
  irrigationSchedule: {
    title: string;
    forecastAnalysis: string;
    wateringAction: string;
    moistureConservationTip: string;
  };
  climateRiskFlags: ClimateRiskFlag[];
  audioText: string;
  audioUrl?: string;
  meta: {
    modelUsed: string;
    weatherSource: string;
    soilDataSource: string;
    ndviSource: string;
  };
}

export interface DiseaseDiagnosisResponse {
  diseaseName: string;
  diseaseNameLocal: string;
  cropDetected: string;
  confidencePercent: number;
  urgency: 'low' | 'moderate' | 'high' | 'critical';
  symptoms: string[];
  pathogenType: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'nutrient_deficiency' | 'environmental' | 'unknown';
  organicTreatment: {
    remedyName: string;
    ingredients: string;
    applicationMethod: string;
    timing: string;
  };
  chemicalTreatment: {
    chemicalName: string;
    dosagePerAcre: string;
    safetyPrecautions: string;
    waitingPeriodDays: number;
  };
  prevention: string[];
  audioText: string;
  audioUrl?: string;
  meta: {
    modelUsed: string;
    timestamp: string;
  };
}

export interface StateDataModelSpec {
  schema_name: string;
  version: string;
  description: string;
  fields: {
    fieldName: string;
    type: string;
    required: boolean;
    description: string;
    example: string | number | object;
  }[];
}

export interface WhisperQueryResponse {
  transcription?: string;
  query: string;
  detectedLanguage: string;
  response: string;
  audioText: string;
  audioUrl?: string;
  keyActionPoints: string[];
  category: 'crop_advisory' | 'fertilizer' | 'pest_disease' | 'weather_irrigation' | 'market_general';
  suggestedFollowUps?: string[];
  timestamp: string;
  meta?: {
    modelUsed: string;
  };
}

export interface DemoVideoScene {
  id: string;
  title: string;
  title_hi?: string;
  durationSeconds: number;
  badge?: string;
  badge_hi?: string;
  description?: string;
  description_hi?: string;
  caption?: string;
  visualDescription?: string;
  keyTakeaway?: string;
  actionableTip?: string;
  audioNarration_en?: string;
  audioNarration_hi?: string;
  keyPoints?: string[];
  keyPoints_hi?: string[];
  visualType?: 'overview' | 'weather_soil' | 'advisory' | 'crop_doctor' | 'whisper_voice';
}

