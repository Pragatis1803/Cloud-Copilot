//@ts-nocheck
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

// Convert image file to base64
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Process image with OpenAI Vision API
export const analyzeArchitectureDiagram = async (imageFile: File) => {
  try {
    const base64Image = await convertToBase64(imageFile);
    
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify cloud service components, integrations, and connectivity patterns from architecture diagrams. Return the response as one list of json which has components, their usage and their connectivity as attributes."
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    if (response.choices && response.choices[0]?.message?.content) {
      const jsonResponse = JSON.parse(response.choices[0].message.content);
      console.log('OpenAI Architecture Analysis Response:', jsonResponse);
      return {
        success: true,
        data: jsonResponse
      };
    }
    
    return {
      success: false,
      error: 'Unexpected response format'
    };
    
  } catch (error) {
    console.error('Error processing image with OpenAI:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  analyzeArchitectureDiagram
};