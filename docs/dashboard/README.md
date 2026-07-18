# Dashboard Domain

This directory contains all components and logic related to the main user dashboard and generation control panel.

## Overview

The dashboard is the primary interface for the user to interact with the artifact generation process. It provides:

1.  **Generation Control:** Buttons to trigger the generation of all artifacts or individual categories.
2.  **AI Genius Mode:** Advanced controls to apply a specific focus (e.g., frontend, backend) to the generation process.
3.  **Real-time Feedback:** Visual indicators for loading states, completed categories, and overall progress.
4.  **State Management:** Disables controls during generation to prevent conflicting actions and provides clear feedback on the application's state.

## Key Components

-   `Dashboard.tsx`: The main container that lays out the control panel and manages the state of the generation process.
-   `CategoryButton.tsx`: A reusable button component that represents a single artifact category, showing its status (pending, loading, completed).
-   `GeniusPanel.tsx`: The component for selecting and triggering the AI Genius Mode.

## Future Enhancements

-   **Metrics Display:** Integrate charts and KPIs to visualize generation statistics (e.g., generation time, success rate, token usage).
-   **History/Logs:** A tab to view the history of generation runs and their outcomes.
-   **Configuration:** UI controls to tweak generation parameters (e.g., select AI model, temperature).