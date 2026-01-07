import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyAWpj1GV3DxT16n6Dh-abxw-Ky62tQagQs";

async function testKey() {
    console.log("Testing API Key with model listing...");
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Try to perform a simple request to check validity
        // Since generateContent failed with 404 on the model, the AUTH is likely OK.
        // Let's try a different model name that is definitely standard.

        console.log("Trying gemini-1.5-flash-8b...");
        try {
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash-8b",
                contents: {
                    parts: [{ text: "Hello" }]
                }
            });
            console.log("Success with gemini-1.5-flash-8b!");
            console.log(response.text);
            return;
        } catch (e) {
            console.log("gemini-1.5-flash-8b failed: " + e.message);
        }

        console.log("Trying gemini-2.0-flash-exp...");
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash-exp",
                contents: {
                    parts: [{ text: "Hello" }]
                }
            });
            console.log("Success with gemini-2.0-flash-exp!");
            console.log(response.text);
            return;
        } catch (e) {
            console.log("gemini-2.0-flash-exp failed: " + e.message);
        }

    } catch (error) {
        console.error("Critical Error:");
        console.error(error);
    }
}

testKey();
