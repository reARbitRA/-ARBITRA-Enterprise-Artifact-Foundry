# AI Toolkit Service API

This document outlines the functions exposed by the `aiToolkitService.ts` module. These functions provide a simplified and consistent interface for interacting with various Gemini API features.

## `analyzeImage(prompt, imageBlob)`

Analyzes an image with a corresponding text prompt.

-   **Parameters:**
    -   `prompt: string`: The question or instruction related to the image.
    -   `imageBlob: Blob`: The image file as a Blob object.
-   **Returns:** `Promise<{ success: boolean; text?: string; error?: string; }>`
    -   On success, returns the textual analysis from the model.
    -   On failure, returns an error message.

## `generateImage(prompt, aspectRatio, style)`

Generates an image based on a text prompt.

-   **Parameters:**
    -   `prompt: string`: The description of the image to generate.
    -   `aspectRatio: string`: The desired aspect ratio (e.g., '1:1', '16:9').
    -   `style: string`: A style preset (e.g., 'Photorealistic', 'Anime').
-   **Returns:** `Promise<{ success: boolean; image?: string; error?: string; }>`
    -   On success, returns a base64-encoded data URL of the generated PNG image.
    -   On failure, returns an error message.

## `groundedSearch(prompt, tool)`

Performs a search grounded in Google Search or Google Maps.

-   **Parameters:**
    -   `prompt: string`: The search query.
    -   `tool: 'googleSearch' | 'googleMaps'`: The grounding tool to use.
-   **Returns:** `Promise<{ success: boolean; text?: string; sources?: GroundingChunk[]; error?: string; }>`
    -   On success, returns the summarized text answer and an array of source links.
    -   On failure, returns an error message.

## `generateCode(prompt, language)`

Generates a code snippet based on a prompt.

-   **Parameters:**
    -   `prompt: string`: The description of the code to generate.
    -   `language: string`: The programming language (e.g., 'JavaScript', 'Python').
-   **Returns:** `Promise<{ success: boolean; code?: string; error?: string; }>`
    -   On success, returns the raw code as a string.
    -   On failure, returns an error message.

## `analyzeData(prompt, data)`

Analyzes a dataset and returns a structured JSON response.

-   **Parameters:**
    -   `prompt: string`: The instruction for the analysis.
    -   `data: string`: The raw data (e.g., in CSV or JSON format).
-   **Returns:** `Promise<{ success: boolean; result?: AnalysisResult; error?: string; }>`
    -   On success, returns a structured object with a summary and chart data.
    -   On failure, returns an error message.

## `generateVideo(prompt, resolution, aspectRatio)`

Generates a video based on a text prompt.

-   **Parameters:**
    -   `prompt: string`: The description of the video.
    -   `resolution: '720p' | '1080p'`: The video resolution.
    -   `aspectRatio: '16:9' | '9:16'`: The video aspect ratio.
-   **Returns:** `Promise<{ success: boolean; video?: Blob; error?: string; }>`
    -   On success, returns the generated video as a Blob.
    -   On failure, returns an error message.