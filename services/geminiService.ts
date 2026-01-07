import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem } from "../types";



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

    // Initialize client lazily to avoid top-level errors and ensure env vars are loaded
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found. If you just added .env.local, please RESTART your development server (Ctrl+C, then npm run dev).");
    }
    // Debugging: Check if key is loaded
    console.log("VITE_GEMINI_API_KEY status:", apiKey ? "Loaded (" + apiKey.substring(0, 4) + "...)" : "Not Found");

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