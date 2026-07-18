# AI Toolkit Domain

This directory contains the components, services, and hooks related to the "AI Assistant" toolkit.

## Overview

The AI Toolkit is a secondary feature set within the Arbitra Foundry that provides direct access to various multimodal AI capabilities, independent of the main artifact generation workflow. It serves as a powerful, general-purpose assistant for developers and users.

The toolkit is designed to be:

-   **Modular:** Each capability (Image Analysis, Code Generation, etc.) is encapsulated in its own tab and corresponding service function.
-   **Stateful:** User input and results for each tab are persisted in local storage via the `useLocalStorage` hook, providing a seamless user experience across sessions.
-   **Robust:** API calls include error handling and provide clear feedback to the user.

## Features

The toolkit is organized into several tabs, each targeting a specific AI function:

1.  **Analyze (Image Analysis):**
    -   Allows users to upload an image and ask questions about it.
    -   Uses the Gemini model's vision capabilities.

2.  **Generate (Image Generation):**
    -   Generates images from a text prompt using the Imagen model.
    -   Provides options for aspect ratio and style presets.

3.  **Video (Video Generation):**
    -   Generates short videos from a text prompt using the Veo model.
    -   Requires a user-selected API key with billing enabled.

4.  **Search (Grounded Search):**
    -   Answers questions using real-time information from Google Search or Google Maps.
    -   Displays the summarized answer and lists the sources used.

5.  **Code (Code Generation):**
    -   Generates code snippets in various languages based on a user's request.

6.  **Data (Data Analysis):**
    -   Analyzes a raw dataset (e.g., CSV) and provides a textual summary and a simple bar chart visualization.
    -   Uses Gemini's JSON mode with a response schema for structured output.

7.  **File (File Generation):**
    -   A utility to generate the complete content for a single file of any specified language.