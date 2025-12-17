
import { GoogleGenAI } from "@google/genai";
import { RescueReport } from '../types';

// Utility to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

export const analyzeInjury = async (imageFile: File, description: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set. Returning mock data.");
    return `**Mock AI Analysis:**
- **Animal Type:** Suspected domestic dog.
- **Observed Condition:** Laceration visible on the left hind leg. Animal appears distressed.
- **Urgency:** Moderate. Recommend prompt attention.
- **First Aid Suggestion (for user):** Do not approach if the animal is aggressive. If safe, provide water and keep a safe distance. Do not attempt to treat the wound directly. Await professional help.`;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imageBase64 = await fileToBase64(imageFile);

  const imagePart = {
    inlineData: {
      mimeType: imageFile.type,
      data: imageBase64,
    },
  };

  const textPart = {
    text: `Analyze the attached image of an animal and the user's description. Provide a brief report for an animal rescue NGO. 
    The report should include:
    1.  A likely identification of the animal type.
    2.  An assessment of the visible injury or condition.
    3.  An estimated urgency level (e.g., Low, Moderate, High).
    4.  A short, safe first-aid suggestion for the user to follow while waiting for the NGO. Emphasize user safety.
    
    User's description: "${description}"`,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing injury with Gemini:", error);
    return "Could not analyze the image. Please assess the situation based on the user's description.";
  }
};
