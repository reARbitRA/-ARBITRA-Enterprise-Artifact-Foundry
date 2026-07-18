
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Artifact } from '../types/artifact.types';
import type { GeniusFocus, GeniusGenerationResult } from '../types/dashboard.types';
import type { GroundingChunk } from '../types/toolkit.types';
import { dashboardCategories, type Category } from './artifactRegistry';
import { validateData } from '../schemas/validation';
import { GroundingChunkSchema } from '../schemas/toolkit.schemas';
import { z } from 'zod';
import { Config } from '../config'; // Import Config

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerationResult {
    success: boolean;
    artifacts: Artifact[];
    errorLog: string[];
}

/**
 * Utility to retry a function with exponential backoff.
 * Configured with base delay and maximum number of retries from Config.toolkit.
 * Logs retry attempts to console and logs the final error to the provided errorLog array if all retries fail.
 * @param fn The asynchronous function to execute and retry.
 * @param errorLog An array to push the final error message to if all retries fail.
 * @returns The result of the function if successful.
 * @throws The last error encountered if all retries fail.
 */
async function withRetry<T>(fn: () => Promise<T>, errorLog: string[]): Promise<T> {
  const retries = Config.toolkit.maxRetries;
  const baseDelay = Config.toolkit.retryDelay;
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const currentDelay = baseDelay * Math.pow(2, i);
      console.warn(`API call attempt ${i + 1} of ${retries} failed. Retrying in ${currentDelay}ms...`, error);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, currentDelay));
      }
    }
  }
  const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
  const logMessage = `API call failed after ${retries} retries. Error: ${errorMessage}`;
  console.error(logMessage, lastError);
  errorLog.push(logMessage); // Log to errorLog on final failure
  throw lastError;
}

const getDetailedPromptForFile = (filename: string, category: Category, corpus: string, focusInstruction?: string): string => {
    let baseInstruction = `You are ARBITRA, a world-class AI system architect and principal engineer operating an Enterprise Artifact Foundry. 
Your purpose is to generate the raw content for a single, specific file based on a global source corpus. Your output must be cutting-edge, secure, scalable, and immediately usable in a modern enterprise environment.`;

    if (focusInstruction) {
        baseInstruction += `\n\n**IMPORTANT GLOBAL FOCUS:**\n${focusInstruction}`;
    }

    if (category.useGrounding) {
        baseInstruction += `\n**You have access to Google Search.** Use it to find up-to-date information, statistics, and benchmarks relevant to the request. Cite your sources in a 'Sources' section at the end if generating a markdown file.`;
    }

    baseInstruction += `\n
CORE PRINCIPLES:
- **Security First:** Incorporate best practices (e.g., OWASP Top 10 principles for web-related artifacts).
- **Scalability & Performance:** Design for high-throughput and low-latency where applicable.
- **Maintainability:** Produce clean, well-documented and modular content.
- **Cutting-Edge:** Utilize modern patterns, technologies, and syntax.

RULES:
1.  **Focus on ONE File:** Your entire response will be the content for the file: "${filename}".
2.  **Use the Corpus:** The provided global source corpus is the single source of truth. All generated content must be derived from and consistent with it.
3.  **Produce Production-Ready Content:** The content must be fully-hydrated, enterprise-grade, and complete. Do not use placeholders like "<...>" or "TBD".
4.  **Raw Content Only:** You MUST respond ONLY with the raw, complete content for the file. Do not include the filename, any commentary, markdown fences (like \`\`\`json or \`\`\`markdown), or any text outside of the file's content itself.

---
Global Source Corpus:
---
${corpus || 'No global corpus provided. Generate content based on general best practices and the file type.'}
---

Current Task: Generate the content for the file **${filename}** within the **${category.name}** category.
`;

    // Specific instructions per file
    switch (filename) {
        // Strategic & Business Case
        case 'executive-summary.md':
            return `${baseInstruction}\nThis is a high-level executive summary for C-suite stakeholders. It must be concise, professional, and impactful. Quantify benefits with data-driven projections. It should cover: 1. The Core Problem, 2. The Proposed Solution (derived from the corpus), 3. Key Business Benefits & ROI, 4. Market Opportunity & Strategic Positioning, 5. A concluding Call to Action.`;
        case 'industry-benchmarks.md':
            return `${baseInstruction}\nThis document provides a comparative analysis against industry benchmarks. Create a markdown table comparing at least 4 key performance indicators (KPIs) from the corpus against typical industry averages. Include columns for: KPI, Project Metric, Industry Average, and Competitive Advantage. Follow the table with a deep analysis of the findings, identifying key strategic opportunities and potential risks.`;
        case 'roi-calculator.xlsx':
            return `${baseInstruction}\nThis file represents a sophisticated Return on Investment (ROI) calculator. Generate the content as a markdown table that can be conceptually translated to a spreadsheet. It must include columns for: Metric, Input Value (with realistic placeholders), Calculation/Formula, and Projected Return. Include at least 5 key metrics for calculating ROI (e.g., Initial Investment, Operational Savings, Revenue Uplift, Payback Period, Net Present Value). The entire output should be a single markdown table.`;
        case 'revenue-dashboard-template.xlsx':
            return `${baseInstruction}\nThis file represents a template for an advanced revenue dashboard. Generate the content as a markdown table. This table should define the structure of the dashboard, including columns for: Widget Title, Chart Type (e.g., Line Chart, Bar Chart, KPI, Funnel), Primary Metric, Data Source (e.g., 'CRM API'), and Description/Purpose. Define at least 6 widgets for a comprehensive dashboard.`;
        case 'future-needs-prediction.md':
            return `${baseInstruction}\nThis document outlines future predictions and strategic recommendations. Based on the corpus, analyze market trends and project future needs. Structure the document with these sections: 1. Current State Analysis, 2. Key Trend Identification (at least 3, with data), 3. Predicted Future State (in 3-5 years) with scenario analysis (bull, base, bear cases), 4. Strategic Recommendations to capitalize on trends and mitigate risks.`;
        case 'case-study-template.md':
            return `${baseInstruction}\nThis is a template for creating future compelling case studies. It should be a complete markdown file with placeholder text in brackets (e.g., [Customer Name]). The template must include the following sections: 1. Customer Profile, 2. The Challenge (with quantifiable business pain points), 3. The Solution (detailing the implementation), 4. The Results (with specific, impactful metrics like '[Percentage] increase in efficiency'), 5. Customer Testimonial.`;
        
        // AI Asset Valuation
        case 'valuation-report.md':
            return `${baseInstruction}\nThis is a comprehensive 'AI Asset Valuation Report' based on the AAVM (AI Asset Valuation Matrix) framework. It must be written by a Lead AI Asset Valuation Strategist. The report should include: 1. **Technical Audit**: Assess the prompt's complexity, token efficiency, and robustness (Score 1-10). 2. **ROI Analysis**: Estimate the Operational Impact (OI) based on time saved vs. manual execution. 3. **Market Scarcity**: Analyze how unique or reproducible this capability is. 4. **Pricing Strategy**: Recommend a licensing model (e.g., per-seat, per-execution) and a base asset value in USD.`;
        case 'roi-model.xlsx':
             return `${baseInstruction}\nThis file represents a financial model for the AI asset. Generate the content as a markdown table. Columns must include: 'Task Category', 'Manual Hours/Task', 'AI Latency (min)', 'Hourly Rate ($)', 'Executions/Month', and 'Operational Impact ($)'. Explicitly apply the formula: (Hours Saved * Hourly Rate) * Executions. Include a 'Total Monthly Value' row at the bottom.`;
        case 'asset-manifest.json':
            return `${baseInstruction}\nThis file is a machine-readable IP manifest for the prompt. It must be valid JSON. structure: { "asset_id": "UUID", "asset_name": "string", "version": "string", "scores": { "TCS": number (1-10), "OI": number (1-100), "MS": number (1-10), "RF": number (1-10) }, "classification": "STANDARD" | "GOLD" | "PREMIUM", "tags": ["string"], "usage_rights": "string" }. Calculate the scores based on the complexity and utility of the corpus.`;
        case 'optimization-strategy.md':
            return `${baseInstruction}\nThis document provides a strategic roadmap to increase the valuation of the AI asset. Focus specifically on improving the Market Scarcity (MS) and Reusability Factor (RF). Sections: 1. **Current Valuation Gaps**, 2. **Prompt Engineering Enhancements** (e.g., adding few-shot examples, chain-of-thought), 3. **Integration Opportunities** (how to embed this in larger workflows), 4. **IP Protection** (techniques to obfuscate or watermark the prompt logic).`;

        // Product & Technical Specification
        case 'README.md':
            return `${baseInstruction}\nThis is the main README for the project. It must be comprehensive and professional, including sections for Project Title, a detailed Description with a 'Why' section, Installation instructions with prerequisites, advanced Usage examples, API Reference, a Contributing guide (with code of conduct), and License. Use badges for build status, coverage, etc. (with placeholder URLs).`;
        case 'technical-specifications.md':
            return `${baseInstruction}\nThis is a detailed technical specification document. It must include the following sections, fully detailed: 1. Introduction & Goals, 2. System Architecture (provide detailed descriptions and use Mermaid markdown for diagrams where possible: C4 diagrams, sequence diagrams), 3. Data Models & Schemas (including relationships, constraints, and types), 4. Core Modules & Functionality, 5. Security Considerations (covering authentication, authorization, data encryption, and vulnerability management per OWASP guidelines), 6. Scalability & Performance (addressing load balancing, caching strategies, and database optimization), 7. Deployment & CI/CD Strategy.`;
        case 'api-integration.json':
            return `${baseInstruction}\nThis file must be a valid and robust OpenAPI 3.1 specification. It should define at least two main API endpoints derived from the corpus, including paths, methods (GET, POST), detailed parameters with validation, and comprehensive request/response schemas with examples. Include detailed error response definitions (e.g., 400, 401, 403, 404, 500). Your entire output must be parseable JSON.`;
        case 'version-history.md':
            return `${baseInstruction}\nThis is a changelog file. Follow the "Keep a Changelog" format precisely. Create at least two realistic version entries (e.g., v1.1.0, v1.0.0) with sections for "Added", "Changed", "Deprecated", "Removed", "Fixed", and "Security".`;
        case 'domain-crosswalk.md':
            return `${baseInstruction}\nThis document maps internal data concepts to external or industry standards. Create a markdown table that "crosswalks" at least five key data entities from the corpus to an equivalent in a well-known standard (e.g., map an internal 'User' object to a 'Person' schema from Schema.org). Include columns for Internal Field, Standard Field, Data Type, Transformation Logic, and Notes.`;
        
        // Deployment & Operations
        case 'implementation-guide.md':
            return `${baseInstruction}\nThis is a step-by-step guide for deploying and implementing the solution in a production environment. It must include these sections: 1. Prerequisites (hardware, software, credentials), 2. Installation Steps (with shell commands), 3. Configuration Details (with clear examples for environment variables), 4. Verification & Smoke Testing (with explicit commands to run), 5. Observability (guidelines for logging, monitoring, and alerting), 6. Troubleshooting Common Issues (with solutions).`;
        case 'client-onboarding-kit/README.md':
            return `${baseInstruction}\nThis README file explains the purpose of the Client Onboarding Kit directory. It should describe the contents of a comprehensive kit, such as a welcome packet, initial setup checklist, key contact list, support SLAs, and links to detailed support documentation. It should be a guide for the team that uses this kit.`;
        case 'certification-program.md':
            return `${baseInstruction}\nThis document outlines a professional certification program. It should include sections on: 1. Program Overview & Goals, 2. Certification Levels (e.g., Certified Associate, Certified Professional) with prerequisites, 3. Learning Paths & Required Skills for each level, 4. Examination Process (including format and scoring), 5. Renewal Policy and Continuing Education.`;
        case 'automated-updates-system/README.md':
            return `${baseInstruction}\nThis README explains a robust automated updates system. It should describe the system's architecture (e.g., using a CI/CD pipeline with semantic versioning), how to configure the update frequency, how to monitor its status via a health check endpoint, and the detailed rollback procedure in case of a failed update.`;
        
        // Custom Artifacts
        case 'export-script.sh':
            return `${baseInstruction}\nThis is a robust shell script for exporting data or artifacts. It must include comprehensive error handling (set -e -u -o pipefail), command-line argument parsing (e.g., using getopt), a help/usage function, and clear echo statements for user feedback. The script should be well-commented and idempotent where possible.`;
        case 'custom-logic.py':
            return `${baseInstruction}\nGenerate a Python script for this custom artifact. The code must be clean, follow PEP 8 standards, include type hints, contain comprehensive docstrings for all functions/classes, and implement proper error handling using try-except blocks. It should be modular and include unit tests if applicable.`;
        case 'custom-visualization.js':
            return `${baseInstruction}\nGenerate a JavaScript file for a custom visualization. Use modern ES6+ syntax (e.g., async/await, modules). The code should be well-structured, modular, and include JSDoc comments explaining complex logic. If interacting with the DOM, use efficient and secure methods and ensure it is accessible.`;
        
        // Governance, Risk & Compliance
        case 'compliance-report.md':
             return `${baseInstruction}\nGenerate a formal compliance report. The report must address at least one major regulatory standard (e.g., GDPR, HIPAA, SOC 2) relevant to the corpus. It should include sections for: 1. Scope of Compliance, 2. Control Objectives, 3. Implementation and Evidence for at least 5 key controls, 4. Gap Analysis, and 5. Remediation Plan.`;

        // Blog Posts
        case 'introduction.md':
            return `${baseInstruction}\nThis file is an introductory blog post based on the corpus. It should be engaging, well-structured, and suitable for a public-facing company blog. It needs an attention-grabbing title, a concise introduction, a body that explains the core concepts from the corpus in an accessible way, and a concluding paragraph with a call-to-action.`;
        case 'content-guidelines.md':
            return `${baseInstruction}\nThis file outlines the content and style guidelines for the company blog. It should define the blog's tone of voice (e.g., professional yet approachable), target audience, preferred article structure, formatting rules (e.g., use of headings, bold text, lists), and rules for including images and links. This document will guide future authors.`;
        case 'seo-best-practices.md':
            return `${baseInstruction}\nThis file details the SEO best practices for writing blog posts for the company. It must include sections on: 1. Keyword Research and Usage (primary and secondary keywords), 2. On-Page SEO (title tags, meta descriptions, header usage), 3. Internal and External Linking strategies, and 4. Image Alt Text guidelines. Provide clear, actionable advice.`;

        default:
            return `${baseInstruction}\nGenerate the content for this file based on its name and a provided corpus. Ensure it is professional, complete, and adheres to modern best practices for its file type.`;
    }
};

const selectModelForFile = (filename: string): 'gemini-2.5-pro' | 'gemini-2.5-flash' => {
    const proFiles = [
        'technical-specifications.md',
        'api-integration.json',
        'compliance-report.md',
        'domain-crosswalk.md',
        'asset-manifest.json', // Use Pro for JSON structure
        'valuation-report.md', // Use Pro for detailed analysis
    ];
    const proExtensions = ['.json', '.sh', '.py', '.js'];
    if (proFiles.includes(filename) || proExtensions.some(ext => filename.endsWith(ext))) {
        return 'gemini-2.5-pro';
    }
    return 'gemini-2.5-flash';
};

export const generateArtifactsForCategory = async (category: Category, corpus: string, focusInstruction?: string): Promise<GenerationResult> => {
    console.log(`Generating artifacts for category: ${category.name} one by one.`);
    const generatedArtifacts: Artifact[] = [];
    const errorLog: string[] = [];

    for (const filename of category.files) {
        try {
            const prompt = getDetailedPromptForFile(filename, category, corpus, focusInstruction);
            
            const modelConfig: any = {};
            const modelName = selectModelForFile(filename);

            if (category.useThinkingMode) {
                if (modelName === 'gemini-2.5-pro') {
                    modelConfig.thinkingConfig = { thinkingBudget: 32768 };
                } else {
                    modelConfig.thinkingConfig = { thinkingBudget: 24576 };
                }
            }

            if (category.useGrounding === 'googleSearch') {
                modelConfig.tools = [{googleSearch: {}}];
            }
            
            const requestPayload = { model: modelName, contents: prompt, ...(Object.keys(modelConfig).length > 0 && { config: modelConfig }) };

            // Pass the local errorLog array to withRetry
            const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent(requestPayload), errorLog);
            
            let content = response.text.trim();
            
            const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const validationResult = validateData(z.array(GroundingChunkSchema), rawSources);
            
            let sources: GroundingChunk[] = [];
            // Ensure type narrowing for discriminated union.
            if (validationResult.success) {
                sources = validationResult.data;
            } else {
                // FIX: Accessing validationResult.error is safe here because the type has been narrowed to ValidationError.
                console.warn(`Grounding source validation failed for ${filename}:`, validationResult.error);
            }
                  
            if (sources.length > 0 && filename.endsWith('.md')) {
                const sourcesMarkdown = sources
                    .map((chunk, index) => (chunk.web?.uri && chunk.web?.title) ? `${index + 1}. [${chunk.web.title}](${chunk.web.uri})` : null)
                    .filter(Boolean)
                    .join('\n');
                
                if (sourcesMarkdown) {
                    content += `\n\n---\n\n### Sources\n\n${sourcesMarkdown}`;
                }
            }

            const cleanedContent = content.replace(/^```(?:\w+\n)?([\s\S]*?)```$/, '$1').trim();
            generatedArtifacts.push({ filename, content: cleanedContent, id: filename, name: filename, status: 'complete', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

        } catch (error) {
            // Errors from withRetry are already logged and pushed to errorLog
            // Only log here if it's an error that bypassed withRetry, or add more specific context.
            // For now, assume withRetry handles logging to errorLog
            // The catch block here is primarily for errors that occur *after* the API call,
            // or if withRetry throws an error, it will be caught here to prevent the loop from stopping.
            if (!(error instanceof Error && error.message.includes('API call failed after'))) { // Avoid duplicate logging of "all retries failed"
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`Error generating file "${filename}" for category "${category.name}":`, error);
                errorLog.push(`Generation failed for file: ${filename}. Error: ${errorMessage}`);
            }
        }
    }
    
    if (errorLog.length > 0) {
        errorLog.push(`Suggestion for failed files: Check your API key and quota. Try simplifying the corpus or re-generating the category.`);
    }

    return {
        success: generatedArtifacts.length > 0 && generatedArtifacts.length === category.files.length,
        artifacts: generatedArtifacts,
        errorLog: errorLog,
    };
};

export const generateAllArtifactsWithGeniusMode = async (
    corpus: string, 
    focus: GeniusFocus,
    onProgress: (categoryName: string, artifacts: Artifact[]) => void
): Promise<GeniusGenerationResult> => {
    let focusInstruction = '';
    switch (focus) {
        case 'frontend':
            focusInstruction = 'Your generation must have a hyper-focus on cutting-edge frontend architecture. Emphasize: Modern framework patterns (e.g., React Server Components, Vue Vapor Mode), advanced state management, atomic design principles for component libraries, comprehensive accessibility (WCAG 2.1 AA), and performance optimization (Core Web Vitals). Backend artifacts must provide robust, mockable API contracts for the frontend to consume.';
            break;
        case 'backend':
            focusInstruction = 'Your generation must have a hyper-focus on cutting-edge backend architecture. Emphasize: Microservices or well-structured modular monoliths, containerization (Dockerfiles), serverless patterns, robust database design (e.g., normalization, indexing), CQRS, event-driven architecture, and stringent security (OWASP Top 10, JWT/OAuth2). Frontend artifacts should be functional but primarily serve to demonstrate the backend APIs.';
            break;
        case 'fullstack':
            focusInstruction = 'Your generation must create a seamlessly integrated full-stack solution. Emphasize: End-to-end type safety (e.g., tRPC-style contracts), GraphQL or well-designed REST APIs, CI/CD pipeline definitions, infrastructure-as-code (e.g., Terraform/Pulumi concepts in docs), and comprehensive observability (logging, tracing, metrics). Both frontend and backend must be equally state-of-the-art.';
            break;
        case 'balanced':
        default:
            focusInstruction = 'Generate all artifacts with a balanced and equal emphasis on both frontend and backend quality, ensuring they are well-integrated and production-ready according to modern, cutting-edge standards.';
            break;
    }

    const allArtifacts: { [key: string]: Artifact[] } = {};
    const errorLog: string[] = [];
    let overallSuccess = true;

    for (const category of dashboardCategories) {
        console.log(`Genius Mode starting category: ${category.name}`);
        const result = await generateArtifactsForCategory(category, corpus, focusInstruction);
        
        if (result.success) {
            allArtifacts[category.name] = result.artifacts;
        } else {
            overallSuccess = false;
        }

        if (result.errorLog.length > 0) {
            errorLog.push(...result.errorLog);
        }

        onProgress(category.name, result.artifacts);
    }

    if (errorLog.length > 0) {
        errorLog.push(`Suggestion for failed categories: Check API key/quota or simplify corpus. Not all categories may have failed; check the output.`);
    }

    return { success: overallSuccess, allArtifacts, errorLog };
};