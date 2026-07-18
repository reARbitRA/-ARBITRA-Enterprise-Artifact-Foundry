
import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import { z } from 'zod';
import { validateData } from '../schemas/validation';
import { GroundingChunkSchema, AnalysisResultSchema, DemoSceneResultSchema } from '../schemas/toolkit.schemas';
import type { GroundingChunk, AnalysisResult, DemoSceneResult } from '../types/toolkit.types';

// --- HELPER FUNCTIONS ---

// Helper to convert blob to base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            resolve(base64data.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
};

// Helper function to decode base64 audio string
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to decode raw PCM audio data into an AudioBuffer
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Helper function to encode raw audio data to base64
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}


// --- API SERVICE ---

// Define discriminated union types for API responses
type SuccessResponse<T> = { success: true } & T;
type ErrorResponse = { success: false; error: string };

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleApiError = (error: unknown, context: string): ErrorResponse => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error in ${context}:`, error);
    return { success: false, error: `[${context}] ${errorMessage}` };
};

export const quickEdit = async (content: string, instruction: string): Promise<SuccessResponse<{ content: string }> | ErrorResponse> => {
    try {
        const prompt = `Based on the following instruction, please edit the content provided.
Instruction: "${instruction}"
---
Content:
---
${content}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return { success: true, content: response.text };
    } catch (error) {
        return handleApiError(error, 'quickEdit');
    }
};

export const analyzeImage = async (prompt: string, imageFile: File): Promise<SuccessResponse<{ text: string }> | ErrorResponse> => {
    try {
        const base64Data = await blobToBase64(imageFile);
        const imagePart = {
            inlineData: {
                mimeType: imageFile.type,
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
        return handleApiError(error, 'analyzeImage');
    }
};

export const generateImage = async (prompt: string, aspectRatio: string, style: string): Promise<SuccessResponse<{ image: string }> | ErrorResponse> => {
    try {
        const fullPrompt = style === 'None' ? prompt : `${prompt}, in a ${style.toLowerCase()} style.`;
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
            },
        });

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        return { success: true, image: imageUrl };
    } catch (error) {
        return handleApiError(error, 'generateImage');
    }
};

export const editImage = async (prompt: string, imageFile: File): Promise<SuccessResponse<{ image: string }> | ErrorResponse> => {
    try {
        const base64Data = await blobToBase64(imageFile);
        const imagePart = {
            inlineData: {
                mimeType: imageFile.type,
                data: base64Data,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            return { success: true, image: imageUrl };
        }
        return { success: false, error: 'No image was returned from the edit operation.' };
    } catch (error) {
        return handleApiError(error, 'editImage');
    }
};

export const groundedSearch = async (prompt: string, tool: 'googleSearch' | 'googleMaps'): Promise<SuccessResponse<{ text: string, sources: GroundingChunk[] }> | ErrorResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: tool === 'googleSearch' ? [{ googleSearch: {} }] : [{ googleMaps: {} }],
            },
        });

        const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const validationResult = validateData(z.array(GroundingChunkSchema), rawSources);

        let sources: GroundingChunk[] = [];
        if (validationResult.success) {
            sources = validationResult.data;
        } else {
            // FIX: Accessing validationResult.error is safe here because the type has been narrowed to ValidationError.
            console.warn('Grounding source validation failed:', validationResult.error);
        }

        return { success: true, text: response.text, sources };
    } catch (error) {
        return handleApiError(error, 'groundedSearch');
    }
};

export const generateCode = async (prompt: string, language: string): Promise<SuccessResponse<{ code: string }> | ErrorResponse> => {
    try {
        const fullPrompt = `You are an expert programmer. Generate a complete, production-ready code snippet for the following request. The language is ${language}.
Request: ${prompt}
---
RULES:
1.  Respond ONLY with the raw code.
2.  Do not include markdown fences (like \`\`\`javascript), explanations, or any text outside of the code itself.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
        });
        
        const cleanedCode = response.text.replace(/^```(?:\w+\n)?([\s\S]*?)```$/, '$1').trim();
        return { success: true, code: cleanedCode };
    } catch (error) {
        return handleApiError(error, 'generateCode');
    }
};

export const analyzeData = async (prompt: string, data: string): Promise<SuccessResponse<{ result: AnalysisResult }> | ErrorResponse> => {
    try {
        const fullPrompt = `Analyze the following data and respond in a specific JSON format.
Data:
---
${data}
---
Analysis Request: ${prompt}
---
RULES:
1. Your response MUST be a single, valid JSON object.
2. The JSON object must match this schema: { "summary": "string", "chartData": [{ "label": "string", "value": number }] }.
3. "summary" should be a concise, insightful text summary of the data based on the request.
4. "chartData" should be an array of objects suitable for a bar chart, derived from the data.
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        chartData: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    value: { type: Type.NUMBER },
                                },
                                required: ["label", "value"],
                            },
                        },
                    },
                     required: ["summary", "chartData"],
                },
            },
        });
        
        const json = JSON.parse(response.text.trim());
        const validationResult = validateData(AnalysisResultSchema, json);
        // Ensure type narrowing for discriminated union.
        if (validationResult.success) {
            return { success: true, result: validationResult.data };
        } else {
            // FIX: Accessing validationResult.error is safe here because the type has been narrowed to ValidationError.
            return { success: false, error: `Invalid JSON structure from API: ${validationResult.error}` };
        }
    } catch (error) {
        return handleApiError(error, 'analyzeData');
    }
};

export const transcribeAudio = async (audioBlob: Blob): Promise<SuccessResponse<{ text: string }> | ErrorResponse> => {
    try {
        const base64Data = await blobToBase64(audioBlob);
        const audioPart = {
            inlineData: {
                mimeType: audioBlob.type,
                data: base64Data,
            },
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, { text: "Transcribe the provided audio." }] },
        });
        
        return { success: true, text: response.text };
    } catch (error) {
        return handleApiError(error, 'transcribeAudio');
    }
};

export const generateSpeech = async (text: string, voice: string = 'Zephyr'): Promise<SuccessResponse<{ audioBuffer: AudioBuffer, audioContext: AudioContext }> | ErrorResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with an ultra-human, professional, and trustworthy-sounding voice, using a clean, standard British accent: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            return { success: false, error: 'No audio data returned from API.' };
        }
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
        
        return { success: true, audioBuffer, audioContext };
    } catch (error) {
        return handleApiError(error, 'generateSpeech');
    }
};

export const generateVideo = async (prompt: string, resolution: '720p' | '1080p', aspectRatio: '16:9' | '9:16'): Promise<SuccessResponse<{ video: Blob }> | ErrorResponse> => {
    try {
        const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let operation = await videoAI.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config: { numberOfVideos: 1, resolution, aspectRatio }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await videoAI.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            return { success: false, error: 'Video generation completed but no download link was found.' };
        }
        
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            try {
                const errorJson = await videoResponse.json();
                const errorMessage = errorJson.error?.message || videoResponse.statusText;
                throw new Error(`Failed to download video (${videoResponse.status}): ${errorMessage}`);
            } catch (e) {
                throw new Error(`Failed to download video: ${videoResponse.statusText}`);
            }
        }
        const videoBlob = await videoResponse.blob();
        return { success: true, video: videoBlob };

    } catch (error) {
        return handleApiError(error, 'generateVideo');
    }
};

// Use `any` for sessionPromise since LiveSession type is not exported.
export const startLiveConversation = (callbacks: any): SuccessResponse<{ sessionPromise: Promise<any> }> | ErrorResponse => {
    try {
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks,
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
        });
        return { success: true, sessionPromise };
    } catch (error) {
        return handleApiError(error, 'startLiveConversation');
    }
};

export const synthesizeDemoScenes = async (script: string): Promise<SuccessResponse<{ result: DemoSceneResult }> | ErrorResponse> => {
    try {
        const fullPrompt = `You are an expert Creative Director and cinematic storyteller. Your task is to deconstruct a product demo script into a series of powerful, emotionally resonant scenes. For each scene, you must generate two distinct outputs: 1. A concise, professionally worded **narrative** suitable for a high-quality voiceover. 2. A rich, detailed, and cinematic **visual_prompt** for a video generation model like Veo. The visual prompt should specify camera angles (e.g., 'dolly shot', 'extreme close-up'), lighting ('dramatic Rembrandt lighting'), mood ('optimistic and inspiring'), and detailed scene composition.
        
Script:
---
${script}
---
RULES:
1. Your response MUST be a single, valid JSON object.
2. The JSON object must match this schema: { "scenes": [{ "scene": number, "narrative": "string", "visual_prompt": "string" }] }.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    scene: { type: Type.NUMBER },
                                    narrative: { type: Type.STRING },
                                    visual_prompt: { type: Type.STRING },
                                },
                                required: ["scene", "narrative", "visual_prompt"],
                            },
                        },
                    },
                    required: ["scenes"],
                },
            },
        });
        
        const json = JSON.parse(response.text.trim());
        const validationResult = validateData(DemoSceneResultSchema, json);
        // Ensure type narrowing for discriminated union.
        if (validationResult.success) {
            return { success: true, result: validationResult.data };
        } else {
            // FIX: Accessing validationResult.error is safe here because the type has been narrowed to ValidationError.
            return { success: false, error: `Invalid JSON structure from scene synthesis: ${validationResult.error}` };
        }
    } catch (error) {
        return handleApiError(error, 'synthesizeDemoScenes');
    }
};

const PromptSuggestionsSchema = z.object({
    suggestions: z.array(z.string().min(1, "Suggestion cannot be empty."))
        .min(1, "At least one suggestion must be provided.")
        .max(5, "Maximum 5 suggestions allowed.") // Limit to a reasonable number
});

export const getPromptSuggestions = async (userPrompt: string): Promise<SuccessResponse<{ suggestions: string[] }> | ErrorResponse> => {
    try {
        const fullPrompt = `You are an expert prompt engineer specializing in code generation. Your task is to analyze a given user prompt and provide 1 to 3 distinct, improved versions of that prompt. Each improved prompt should be clearer, more comprehensive, and more effective at eliciting high-quality code from an AI model. Focus on aspects like:
- Specificity (e.g., exact requirements, constraints, edge cases)
- Format (e.g., desired output structure, comments, error handling)
- Context (e.g., environment, dependencies, target audience)
- Examples (if applicable, though do not generate new examples here, just suggest including them)

Return your suggestions as a JSON array of strings, where each string is a fully refined prompt.

User Prompt to improve:
---
${userPrompt}
---

RULES:
1. Your response MUST be a single, valid JSON object.
2. The JSON object must match this schema: { "suggestions": ["string", "string", ...] }.
3. Provide between 1 and 3 suggestions.
4. Each suggestion should be a complete, standalone prompt.
5. Do not include any explanations or conversational text outside the JSON object.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            minItems: 1,
                            maxItems: 3,
                        },
                    },
                    required: ["suggestions"],
                },
            },
        });
        
        const json = JSON.parse(response.text.trim());
        const validationResult = validateData(PromptSuggestionsSchema, json);
        // Ensure type narrowing for discriminated union.
        if (validationResult.success) {
            return { success: true, suggestions: validationResult.data.suggestions };
        } else {
            // FIX: Accessing validationResult.error is safe here because the type has been narrowed to ValidationError.
            return { success: false, error: `Invalid JSON structure from prompt suggestions: ${validationResult.error}` };
        }
    } catch (error) {
        return handleApiError(error, 'getPromptSuggestions');
    }
};