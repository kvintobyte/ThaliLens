import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem, LogEntry } from "../types";

// ... existing fileToGenerativePart ...
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeIndianFood = async (imageFile: File): Promise<FoodItem[]> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found. If you just added .env.local, please RESTART your development server (Ctrl+C, then npm run dev).");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Analyze this image of Indian food. Identify each distinct dish or item (e.g., Butter Chicken, Dal Makhani, Garlic Naan, Basmati Rice, Raita).
      For each item, estimate the serving size visible in the image and provide the estimated nutritional content (calories, protein, carbs, fat).
      Be realistic with Indian cooking methods which often use ghee/oil.
      Provide a short, appetizing description for each.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: {
        parts: [
          imagePart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the dish" },
              portionSize: { type: Type.STRING, description: "Estimated portion size (e.g. 1 bowl, 2 pieces)" },
              calories: { type: Type.INTEGER, description: "Estimated calories (kcal)" },
              protein: { type: Type.INTEGER, description: "Protein in grams" },
              carbs: { type: Type.INTEGER, description: "Carbohydrates in grams" },
              fat: { type: Type.INTEGER, description: "Fat in grams" },
              description: { type: Type.STRING, description: "Short description of the dish" }
            },
            required: ["name", "portionSize", "calories", "protein", "carbs", "fat", "description"]
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(response.text);
    return data as FoodItem[];

  } catch (error) {
    console.error("Error analyzing food:", error);
    throw error;
  }
};

export const getNutritionForText = async (foodName: string): Promise<FoodItem> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
          Provide nutritional information for one standard serving of "${foodName}".
          Include typical Indian preparation style if applicable.
          Be realistic with calories and macros.
        `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the dish" },
            portionSize: { type: Type.STRING, description: "Standard portion size (e.g. 1 bowl, 1 piece)" },
            calories: { type: Type.INTEGER, description: "Estimated calories (kcal)" },
            protein: { type: Type.INTEGER, description: "Protein in grams" },
            carbs: { type: Type.INTEGER, description: "Carbohydrates in grams" },
            fat: { type: Type.INTEGER, description: "Fat in grams" },
            description: { type: Type.STRING, description: "Short description of the dish" }
          },
          required: ["name", "portionSize", "calories", "protein", "carbs", "fat", "description"]
        }
      }
    });

    if (!response.text) throw new Error("No response from Gemini");
    return JSON.parse(response.text) as FoodItem;
  } catch (error) {
    console.error("Error getting nutrition for text:", error);
    throw error;
  }
};

export interface DailyInsight {
  summary: string;
  mealFeedback: { name: string, advice: string }[];
}

export const analyzeDailyIntake = async (entries: LogEntry[], goal: string): Promise<DailyInsight> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
              Analyze the detailed daily food intake for a user whose goal is "${goal}".
              Entries: ${JSON.stringify(entries)}.
              
              1. Provide a "Daily Summary" paragraph (max 50 words) evaluating their overall performance today.
              2. DO NOT provide meal-specific feedback here, only the summary.
              
              Return as JSON.
            `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            mealFeedback: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, advice: { type: Type.STRING } } } } // keeping structure for compatibility but will be empty
          }
        }
      }
    });

    if (!response.text) throw new Error("No response from Gemini");
    return JSON.parse(response.text) as DailyInsight;
  } catch (error) {
    console.error("Error analyzing daily intake:", error);
    throw error;
  }
};

export const analyzeMealEntry = async (items: FoodItem[]): Promise<{ title: string, feedback: string }> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey });

    const itemsJson = JSON.stringify(items.map(m => ({ name: m.name, calories: m.calories })));

    const prompt = `
            Analyze this meal consisting of: ${itemsJson}.
            
            1. Generate a short, descriptive title for this meal (e.g. "South Indian Lunch", "Afternoon Snacks", "Heavy Dinner").
            2. Provide specific, nutritional advice/feedback for this meal given it's typically consumed in India. Max 2 sentences.
            
            Return as JSON.
        `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            feedback: { type: Type.STRING }
          },
          required: ["title", "feedback"]
        }
      }
    });

    if (!response.text) throw new Error("No response from Gemini");
    return JSON.parse(response.text);

  } catch (error) {
    console.error("Error analyzing meal entry:", error);
    return { title: "Meal", feedback: "Good job tracking!" };
  }
}