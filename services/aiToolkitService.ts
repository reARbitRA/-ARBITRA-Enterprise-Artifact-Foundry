import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GroundingChunk } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error("Failed to convert blob to base64"));
        }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


export const analyzeImage = async (prompt: string, imageBlob: Blob): Promise<{ success: boolean; text?: string; error?: string; }> => {
    try {
        const base64Data = await blobToBase64(imageBlob);
        const imagePart = {
            inlineData: {
                mimeType: imageBlob.type,
                data: base64Data,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return { success: true, text: response.text };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
    }
};

export const generateImage = async (prompt: string, aspectRatio: string, style: string): Promise<{ success: boolean; image?: string; error?: string; }> => {
    try {
        let finalPrompt = prompt;
        if (style && style.toLowerCase() !== 'none') {
            finalPrompt = `${style}, ${prompt}`;
        }

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: finalPrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: aspectRatio,
            },
        });
        const base64Image = response.generatedImages[0].image.imageBytes;
        return { success: true, image: `data:image/png;base64,${base64Image}` };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
    }
};

type SearchTool = 'googleSearch' | 'googleMaps';
export const groundedSearch = async (prompt: string, tool: SearchTool): Promise<{ success: boolean; text?: string; sources?: GroundingChunk[]; error?: string; }> => {
    try {
        const modelConfig: any = { tools: [{ [tool]: {} }] };

        if (tool === 'googleMaps') {
             try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                modelConfig.toolConfig = {
                    retrievalConfig: {
                        latLng: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }
                    }
                }
            } catch (geoError) {
                console.warn("Geolocation failed or was denied. Proceeding without location data.", geoError);
            }
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: modelConfig,
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
        return { success: true, text: response.text, sources };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
    }
};

export const quickEdit = async (content: string, instruction: string): Promise<{ success: boolean; content: string; error?: string; }> => {
    try {
        const fullPrompt = `${instruction}\n\n---\n\n${content}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: fullPrompt
        });
        return { success: true, content: response.text };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, content: content, error: errorMessage };
    }
};

export const generateCode = async (prompt: string, language: string): Promise<{ success: boolean; code?: string; error?: string; }> => {
    try {
        const fullPrompt = `You are an expert ${language} programmer. Based on the following request, generate only the raw code. Do not include any markdown fences (like \`\`\`${language.toLowerCase()}), explanations, or any text other than the code itself.\n\nRequest: ${prompt}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt
        });
        
        return { success: true, code: response.text };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
    }
};

export interface ChartData {
    label: string;
    value: number;
}
export interface AnalysisResult {
    summary: string;
    chartData: ChartData[];
}
export const analyzeData = async (prompt: string, data: string): Promise<{ success: boolean; result?: AnalysisResult; error?: string; }> => {
    try {
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                summary: {
                    type: Type.STRING,
                    description: "A concise, insightful summary of the provided data based on the user's prompt."
                },
                chartData: {
                    type: Type.ARRAY,
                    description: "An array of data points suitable for a bar chart. Each point must have a 'label' (string) and a 'value' (number).",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: { type: Type.STRING },
                            value: { type: Type.NUMBER }
                        },
                        required: ["label", "value"]
                    }
                }
            },
            required: ["summary", "chartData"]
        };

        const fullPrompt = `Analyze the following data based on the user's request. Provide a summary and generate data for a bar chart visualization.

User Request: ${prompt}

--- DATA ---
${data}
--- END DATA ---
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const resultJson = response.text.trim().replace(/^```json\s*|```\s*$/g, '');
        const result: AnalysisResult = JSON.parse(resultJson);

        return { success: true, result };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to analyze data. ${errorMessage}` };
    }
};

export const generateVideo = async (
    prompt: string,
    resolution: '720p' | '1080p',
    aspectRatio: '16:9' | '9:16'
): Promise<{ success: boolean; video?: Blob; error?: string; }> => {
    try {
        // Instantiate a new client on each call to ensure the latest API key is used.
        const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let operation = await videoAI.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config: {
                numberOfVideos: 1,
                resolution,
                aspectRatio,
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await videoAI.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was provided.");
        }
        
        // The API key must be appended to the download URL for authentication.
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video file. Status: ${videoResponse.status}`);
        }

        const videoBlob = await videoResponse.blob();
        return { success: true, video: videoBlob };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
    }
};