# Artifact Domain Architecture

This document outlines the architecture of the artifact generation and management system within the Arbitra Foundry.

## Core Concepts

-   **Corpus:** The single source of truth provided by the user. It can be any text-based input that defines the project.
-   **Artifact:** A single generated file, such as `README.md` or `api-integration.json`. Each artifact has content and metadata.
-   **Category:** A logical grouping of related artifacts, such as "Strategic & Business Case" or "Deployment & Operations".
-   **Foundry Service:** The core service responsible for orchestrating the generation of artifacts by interacting with the Gemini API.

## Data Flow for Generation

1.  **User Input:** The user provides a `corpus` in the `CorpusInput` component.
2.  **Trigger:** The user clicks a button in the `Dashboard` component to generate a single category or all categories.
3.  **Service Call:** The `App` component calls the `foundryService` (`generateArtifactsForCategory` or `generateAllArtifactsWithGeniusMode`).
4.  **Prompt Engineering:** The `foundryService` iterates through the required files for the category. For each file, it constructs a detailed, context-aware prompt using the `getDetailedPromptForFile` function. This prompt combines:
    -   A base instruction persona (ARBITRA).
    -   Core principles (Security, Scalability, etc.).
    -   Strict output rules (raw content only).
    -   The user's `corpus`.
    -   Specific, fine-tuned instructions for the target file (`README.md`, `api-integration.json`, etc.).
    -   Optional "Genius Mode" focus instructions.
5.  **API Interaction:**
    -   The service makes a `generateContent` call to the Gemini API (`gemini-2.5-pro` or `gemini-2.5-flash`).
    -   It configures the model with `thinkingConfig` or `tools` (like Google Search) based on the category's requirements defined in `artifactRegistry.ts`.
    -   The call is wrapped in a `withRetry` utility to handle transient API errors.
6.  **Response Handling:**
    -   The raw text response is extracted from the API result.
    -   Any markdown fences (e.g., ` ```json `) are stripped from the content.
    -   If grounding was used, grounding metadata (sources) is extracted and appended to markdown files.
7.  **State Update:** The `foundryService` returns the generated artifacts. The `App` component updates its state, causing the `ArtifactDisplay` component to re-render and show the new files.

## Schema and Validation (`/schemas`)

-   **`artifact.schemas.ts`:** Defines the Zod schema for the `Artifact` type. This ensures that any data representing an artifact (e.g., from a saved session) conforms to the expected structure (`filename`, `content`, optional `metadata`).
-   **`validation.ts`:** Provides a generic `validateData` helper function that safely parses data against any Zod schema, returning a structured success or error result. This is used to validate API responses and loaded data.

## Key Components

-   **`App.tsx`:** The root component that manages global state, including the `corpus`, `artifacts`, loading states, and error logs. It orchestrates the calls to the services.
-   **`foundryService.ts`:** The brain of the operation. It contains all the logic for communicating with the Gemini API, including prompt construction, retry logic, and response parsing.
-   **`artifactRegistry.ts`:** A configuration file that acts as a manifest for the entire system. It defines all categories, the files within them, and special generation flags (`useThinkingMode`, `useGrounding`).
-   **`ArtifactDisplay.tsx`:** The primary output component. It receives the map of generated artifacts and renders them in categorized, collapsible groups (`CategoryGroup`) containing individual `ArtifactCard`s. It also manages file selection and the zip download process.
-   **`Modal.tsx`:** Displays the content of a selected artifact and provides quick AI-powered editing features by calling the `aiToolkitService`.