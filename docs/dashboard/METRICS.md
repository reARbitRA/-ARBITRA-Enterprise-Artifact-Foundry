# Dashboard Metrics Definitions

This document defines the key performance indicators (KPIs) and metrics that could be displayed on the Arbitra Foundry dashboard.

## Generation Metrics

-   **Artifacts Created (`artifacts_created`)**
    -   **Description:** The total count of individual artifact files successfully generated.
    -   **Use Case:** Tracks overall output and productivity of the system.
    -   **Chart Type:** KPI, Line Chart (over time).

-   **Generation Time (`generation_time`)**
    -   **Description:** The average time taken to generate a single artifact or a full category, measured in seconds.
    -   **Use Case:** Monitors the performance and latency of the AI model and the service layer.
    -   **Chart Type:** Bar Chart (by category), Line Chart (over time).

-   **Success Rate (`success_rate`)**
    -   **Description:** The percentage of artifact generation attempts that completed without errors.
    -   **Use Case:** Measures the reliability and stability of the generation process.
    -   **Chart Type:** KPI, Gauge Chart.

## AI & Cost Metrics

-   **Token Usage (`token_usage`)**
    -   **Description:** The total number of tokens consumed by the Gemini API for both prompts and completions.
    -   **Use Case:** Monitors API usage to manage quotas and understand the complexity of generations.
    -   **Chart Type:** Bar Chart (by model or category).

-   **Estimated Cost (`cost`)**
    -   **Description:** The estimated financial cost of the API calls based on the token usage and the model's pricing.
    -   **Use Case:** Provides crucial financial oversight for the service.
    -   **Chart Type:** KPI, Line Chart (cumulative cost over time).

## User Engagement Metrics

-   **User Engagement (`user_engagement`)**
    -   **Description:** A composite score or set of metrics tracking user interactions, such as categories generated, sessions saved, or artifacts downloaded.
    -   **Use Case:** Helps understand how users are interacting with the application and which features are most valuable.
    -   **Chart Type:** Funnel Chart, Bar Chart (by feature).