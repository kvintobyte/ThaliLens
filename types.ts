export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem extends NutritionInfo {
  name: string;
  portionSize: string;
  description: string;
}

export interface AnalysisResult {
  items: FoodItem[];
  total: NutritionInfo;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}