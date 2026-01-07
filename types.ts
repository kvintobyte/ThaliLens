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
  aiAdvice?: string;
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

export type Meal = FoodItem;

export interface LogEntry {
  id: string;
  timestamp: string;
  title: string;
  items: FoodItem[];
  totalCalories: number;
  entryFeedback?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  totalCalories: number;
  waterIntake: number;
  currentWeight: number;
  entries: LogEntry[];  // Replaces flat 'meals' list
  dailyFeedback?: string;
}

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string;
  dateOfBirth: string; // YYYY-MM-DD
  createdAt: string;

  // Onboarding Data
  sex?: 'male' | 'female';
  height?: number; // cm
  currentWeight?: number; // kg
  activityLevel?: number; // multiplier
  goal?: 'lose' | 'maintain' | 'gain';
  targetWeight?: number;
  goalPace?: number; // kg/week

  // Calculated Results
  bmr?: number;
  tdee?: number;
  dailyBudget?: number;
  additionalMetrics?: ('fat' | 'protein' | 'water' | 'carbs')[];
}