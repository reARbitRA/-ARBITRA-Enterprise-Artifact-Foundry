import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { Artifact, GeniusFocus, GeniusGenerationResult } from '../types';
import { dashboardCategories, type Category } from './artifactRegistry';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerationResult {
    success: boolean;
    artifacts: Artifact[];
    errorLog: string[];
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`API call attempt ${i + 1} of ${retries} failed. Retrying in ${delay * Math.pow(2, i)}ms...`, error);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
      }
    }
  }
  console.error("API call failed after all retries.", lastError);
  throw lastError;
}

const getDetailedPromptForFile = (filename: string, category: Category, corpus: string): string => {
    const baseInstruction = `You are ARBITRA, a hyper-advanced AI system that functions as an Enterprise Artifact Foundry. 
Your purpose is to generate the raw content for a single, specific file based on a global source corpus.

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
        case 'executive-summary.md':
            return `${baseInstruction}\nThis is a high-level executive summary for C-suite stakeholders. It must be concise, professional, and impactful. It should cover: 1. The Core Problem, 2. The Proposed Solution (derived from the corpus), 3. Key Business Benefits & ROI, 4. Market Opportunity, 5. A concluding Call to Action.`;
        case 'industry-benchmarks.md':
            return `${baseInstruction}\nThis document provides a comparative analysis against industry benchmarks. Create a markdown table comparing at least 4 key performance indicators (KPIs) from the corpus against typical industry averages. Include columns for: KPI, Project Metric, Industry Average, and Competitive Advantage. Follow the table with a brief analysis of the findings.`;
        case 'roi-calculator.xlsx':
            return `${baseInstruction}\nThis file represents a Return on Investment (ROI) calculator. Generate the content as a markdown table that can be conceptually translated to a spreadsheet. It must include columns for: Metric, Input Value (with realistic placeholders), Calculation, and Projected Return. Include at least 5 key metrics for calculating ROI (e.g., Initial Investment, Operational Savings, Revenue Uplift, Payback Period). The entire output should be a single markdown table.`;
        case 'revenue-dashboard-template.xlsx':
            return `${baseInstruction}\nThis file represents a template for a revenue dashboard. Generate the content as a markdown table. This table should define the structure of the dashboard, including columns for: Widget Title, Chart Type (e.g., Line Chart, Bar Chart, KPI), Primary Metric, and Description/Purpose. Define at least 6 widgets for a comprehensive dashboard.`;
        case 'future-needs-prediction.md':
            return `${baseInstruction}\nThis document outlines future predictions and strategic recommendations. Based on the corpus, analyze market trends and project future needs. Structure the document with these sections: 1. Current State Analysis, 2. Key Trend Identification (at least 3), 3. Predicted Future State (in 3-5 years), 4. Strategic Recommendations to meet future needs.`;
        case 'case-study-template.md':
            return `${baseInstruction}\nThis is a template for creating future case studies. It should be a complete markdown file with placeholder text in brackets (e.g., [Customer Name]). The template must include the following sections: 1. Customer Profile, 2. The Challenge, 3. The Solution provided by the project, 4. The Results (with specific metrics like '[Percentage] increase in efficiency'), 5. Customer Testimonial.`;
        case 'README.md':
            return `${baseInstruction}\nThis is the main README for the project. It should be comprehensive, including sections for Project Title, Description, Installation, Usage, API Reference, Contributing, and License. The tone should be professional and clear.`;
        case 'technical-specifications.md':
            return `${baseInstruction}\nThis is a detailed technical specification document. It must include the following sections, fully detailed: 1. Introduction & Goals, 2. System Architecture (diagrams described in Mermaid markdown), 3. Data Models & Schemas, 4. Core Modules & Functionality, 5. Security Considerations, 6. Scalability & Performance, 7. Deployment & CI/CD Strategy.`;
        case 'api-integration.json':
            return `${baseInstruction}\nThis file must be a valid JSON object representing an OpenAPI 3.0 specification snippet. It should define at least two main API endpoints derived from the corpus, including paths, methods (GET, POST), parameters, and example request/response schemas. Your entire output must be parseable JSON.`;
        case 'version-history.md':
            return `${baseInstruction}\nThis is a changelog file. Follow the "Keep a Changelog" format. Create at least two realistic version entries (e.g., v1.1.0, v1.0.0) with sections for "Added", "Changed", and "Fixed".`;
        case 'domain-crosswalk.md':
            return `${baseInstruction}\nThis document maps internal data concepts to external or industry standards. Create a markdown table that "crosswalks" at least five key data entities from the corpus to an equivalent in a well-known standard (e.g., map an internal 'User' object to a 'Person' schema from Schema.org). Include columns for Internal Field, Standard Field, Data Type, and Notes.`;
        case 'implementation-guide.md':
            return `${baseInstruction}\nThis is a step-by-step guide for deploying and implementing the solution. It must include these sections: 1. Prerequisites (hardware, software, credentials), 2. Installation Steps (for production), 3. Configuration Details (environment variables, config files), 4. Verification & Smoke Testing, 5. Troubleshooting Common Issues.`;
        case 'client-onboarding-kit/README.md':
            return `${baseInstruction}\nThis README file explains the purpose of the Client Onboarding Kit directory. It should describe the contents of a typical kit, such as a welcome packet, initial setup checklist, key contact list, and links to support documentation. It should be a guide for the team that uses this kit.`;
        case 'certification-program.md':
            return `${baseInstruction}\nThis document outlines a certification program for users or developers. It should include sections on: 1. Program Overview & Goals, 2. Certification Levels (e.g., Certified Associate, Certified Professional), 3. Learning Paths & Required Skills for each level, 4. Examination Process, 5. Renewal Policy.`;
        case 'automated-updates-system/README.md':
            return `${baseInstruction}\nThis README explains the automated updates system. It should describe the system's architecture (e.g., using a cron job, a webhook, or a CI/CD pipeline), how to configure the update frequency, how to monitor its status, and the rollback procedure in case of a failed update.`;
        default:
            return `${baseInstruction}\nGenerate the content for this file based on its name and the provided corpus. Ensure it is professional and complete.`;
    }
};

const generateSpecialCategoryArtifacts = async (category: Category, corpus: string): Promise<GenerationResult> => {
    console.log(`Using advanced generation for category: ${category.name}`);
    const generatedArtifacts: Artifact[] = [];
    const errorLog: string[] = [];
    
    const generationPromises = category.files.map(async (filename) => {
        try {
            const prompt = getDetailedPromptForFile(filename, category, corpus);
            
            const apiCall = () => ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 8192 } 
                }
            });
            
            const response: GenerateContentResponse = await withRetry(apiCall);
            
            const content = response.text.trim();
            const cleanedContent = content.replace(/^```(?:\w+\n)?([\s\S]*?)```$/, '$1').trim();

            return { filename, content: cleanedContent };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Error generating file "${filename}" for category "${category.name}":`, error);
            errorLog.push(`Generation failed for file: ${filename}. Error: ${errorMessage}`);
            return null;
        }
    });

    const results = await Promise.all(generationPromises);
    
    results.forEach(result => {
        if (result) {
            generatedArtifacts.push(result);
        }
    });

    return {
        success: generatedArtifacts.length > 0,
        artifacts: generatedArtifacts,
        errorLog: errorLog,
    };
};

export const generateArtifactsForCategory = async (category: Category, corpus: string): Promise<GenerationResult> => {
  const specialCategories = ["Product & Technical Specification", "Deployment & Operations", "Strategic & Business Case"];
  if (specialCategories.includes(category.name)) {
    return generateSpecialCategoryArtifacts(category, corpus);
  }

  const fileList = category.files.join(', ');
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
        artifacts: {
            type: Type.ARRAY,
            description: `An array of generated file artifacts for the "${category.name}" category ONLY. It must contain exactly these files: ${fileList}`,
            items: {
                type: Type.OBJECT,
                properties: {
                    filename: {
                        type: Type.STRING,
                        description: `The full filename, including extension. Must be one of: ${fileList}.`,
                    },
                    content: {
                        type: Type.STRING,
                        description: "The complete, raw, production-ready content of the file."
                    }
                },
                required: ["filename", "content"]
            }
        },
    },
    required: ["artifacts"]
  };
    
  const basePrompt = `You are ARBITRA, a hyper-advanced AI system that functions as an Enterprise Artifact Foundry. Your purpose is to take a high-level user prompt and a specific category of artifacts, and generate ONLY the artifacts for that category.

RULES:
1.  **Adhere Strictly to the Category:** You will be given a category name and a list of specific filenames to generate. Do NOT generate any file not in that list.
2.  **Use the Corpus:** Use the provided global source corpus as the context for generating the content of each file.
3.  **Produce Production-Ready Content:** The content for each artifact must be fully-hydrated, enterprise-grade, and complete. Do not use placeholders like "<...>" or "TBD".
4.  **Format Output:** You MUST respond ONLY with a single, valid JSON object. Do not include any text, markdown, or commentary outside of the JSON structure.
    
---
    
Global Source Corpus:
---
${corpus || 'No global corpus provided. Generate artifacts based on general best practices.'}
---

Current Task: Generate all artifacts for the **${category.name}** category.

This category is described as: "${category.description}".

You must generate all of the following files, and ONLY these files:
- ${category.files.join('\n- ')}
`;

  let modelName: string;
  let prompt: string;
  let modelConfig: any;

  if (category.useThinkingMode) {
    modelName = 'gemini-2.5-pro';
    modelConfig = {
        thinkingConfig: { thinkingBudget: 32768 }
    };
    prompt = `${basePrompt}\n\nYour output must adhere strictly to the following JSON schema:\n${JSON.stringify(responseSchema, null, 2)}`;
  } else {
    modelName = 'gemini-2.5-flash';
    modelConfig = {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    };
    prompt = basePrompt;
  }


  try {
    const apiCall = () => ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: modelConfig,
    });
    
    const response: GenerateContentResponse = await withRetry(apiCall);

    const jsonText = response.text.trim();
    const cleanedJson = jsonText.replace(/^```json\s*|```\s*$/g, '');
    const result: { artifacts: Artifact[] } = JSON.parse(cleanedJson);

    if (!result.artifacts || result.artifacts.length === 0) {
        return {
            success: false,
            artifacts: [],
            errorLog: [`Generation failed for category "${category.name}": Model returned no artifacts.`]
        };
    }

    return {
        success: true,
        artifacts: result.artifacts,
        errorLog: [],
    };

  } catch (error) {
    console.error(`Error generating artifacts for category "${category.name}":`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      artifacts: [],
      errorLog: [
          `Foundry pipeline failed for category: ${category.name}.`,
          `API Error after multiple retries: ${errorMessage}`,
          `Please check the console for full details.`
      ],
    };
  }
};

export const generateAllArtifactsWithGeniusMode = async (corpus: string, focus: GeniusFocus): Promise<GeniusGenerationResult> => {
    const fileStructure = dashboardCategories.map(cat => 
        `### ${cat.name}\n${cat.files.map(f => `- ${f}`).join('\n')}`
    ).join('\n\n');

    let focusInstruction = '';
    switch (focus) {
        case 'frontend':
            focusInstruction = 'Your generation must have a strong focus on frontend concerns: UI/UX, user experience, component architecture, design systems, and accessibility. Backend artifacts should be functional but less detailed.';
            break;
        case 'backend':
            focusInstruction = 'Your generation must have a strong focus on backend concerns: System architecture, database schemas, API design, security, and scalability. Frontend artifacts should be functional but less detailed.';
            break;
        case 'fullstack':
            focusInstruction = 'Your generation must deeply consider the integration between frontend and backend. Focus on data flow, state management, API contracts, and end-to-end architecture. Ensure seamless consistency between both sides.';
            break;
        case 'balanced':
        default:
            focusInstruction = 'Generate all artifacts with a balanced and equal emphasis on both frontend and backend quality, ensuring they are well-integrated and production-ready.';
            break;
    }

    const prompt = `You are ARBITRA, a hyper-advanced Integrated Genius System, combining the expertise of NEXUS-UI SUPREME (Frontend Genius) and CODEX-ARCHITECT SUPREME (Backend Genius).
Your mission is to transform a project corpus into a complete ecosystem of production-ready artifacts.

**CORE INSTRUCTIONS:**
1.  **Comprehensive Analysis:** Analyze the entire provided corpus from both frontend and backend perspectives.
2.  **Ecosystem Generation:** You must generate the content for ALL files in the provided file structure. Do not omit any.
3.  **Apply Focus:** Adhere to the specified generation focus: ${focusInstruction}
4.  **Production-Ready:** All content must be fully-hydrated, enterprise-grade, and complete. No placeholders.
5.  **JSON Output:** Your entire response MUST be a single, valid JSON object. The JSON object should have keys corresponding to the category names, and the values should be an array of artifact objects.

---
**GLOBAL SOURCE CORPUS:**
---
${corpus}
---

---
**REQUIRED ARTIFACT ECOSYSTEM STRUCTURE:**
---
${fileStructure}
---

Now, begin generation. Produce the complete JSON output that adheres strictly to the provided schema.`;
    
    const categoryProperties = dashboardCategories.reduce((acc, category) => {
        acc[category.name] = {
            type: Type.ARRAY,
            description: `An array of all artifacts for the "${category.name}" category.`,
            items: {
                type: Type.OBJECT,
                properties: {
                    filename: { type: Type.STRING, description: `The full filename, e.g., "${category.files[0]}"` },
                    content: { type: Type.STRING, description: "The complete, raw content of the file." }
                },
                required: ["filename", "content"]
            }
        };
        return acc;
    }, {} as any);

    const responseSchema = {
        type: Type.OBJECT,
        properties: categoryProperties,
        required: dashboardCategories.map(c => c.name)
    };
    
    try {
        const apiCall = () => ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                thinkingConfig: { thinkingBudget: 32768 }
            },
        });

        const response: GenerateContentResponse = await withRetry(apiCall);
        
        const jsonText = response.text.trim().replace(/^```json\s*|```\s*$/g, '');
        const result: { [key: string]: Artifact[] } = JSON.parse(jsonText);

        return { success: true, allArtifacts: result, errorLog: [] };
    } catch (error) {
        console.error(`Error during Genius Mode generation:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          allArtifacts: {},
          errorLog: [
              `Genius Mode pipeline failed.`,
              `API Error after multiple retries: ${errorMessage}`,
              `Please check the console for full details.`
          ],
        };
    }
};
