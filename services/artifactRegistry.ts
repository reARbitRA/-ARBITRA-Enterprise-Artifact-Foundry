export interface Category {
  name: string;
  description: string;
  files: string[];
  useThinkingMode?: boolean;
}

export const dashboardCategories: Category[] = [
  {
    name: "Strategic & Business Case",
    description: "The 'Why': Establish business value, market position, and financial justification.",
    files: [
      "executive-summary.md",
      "industry-benchmarks.md",
      "roi-calculator.xlsx",
      "revenue-dashboard-template.xlsx",
      "future-needs-prediction.md",
      "case-study-template.md"
    ],
    useThinkingMode: true,
  },
  {
    name: "Product & Technical Specification",
    description: "The 'What': Define the solution, its architecture, and how it works.",
    files: [
      "README.md",
      "technical-specifications.md",
      "api-integration.json",
      "version-history.md",
      "domain-crosswalk.md"
    ],
    useThinkingMode: true,
  },
  {
    name: "Go-to-Market & Sales",
    description: "The 'How to Sell': Equip sales, marketing, and partners to generate revenue.",
    files: [
      "sales-materials.md",
      "demo-script.txt",
      "partner-referral-system.md",
      "multilingual-content-library/"
    ]
  },
  {
    name: "Deployment & Operations",
    description: "The 'How to Use': Ensure a successful customer journey from onboarding to daily use.",
    files: [
      "implementation-guide.md",
      "client-onboarding-kit/README.md",
      "certification-program.md",
      "automated-updates-system/README.md"
    ]
  },
  {
    name: "Governance, Risk & Compliance",
    description: "The 'How to Trust': Prove the solution is secure, compliant, and trustworthy.",
    files: [
      "compliance-report.md",
      "legal-documents.md",
      "watermark-info.txt",
      "audit-trail.json",
      "translation-metadata.json",
      "regulatory-monitoring.json"
    ]
  },
  {
    name: "AI Engine Interface",
    description: "The 'How to Re-create': The source code for the generation process itself.",
    files: [
      "Prompt_Version_1_Filled_Example.md",
      "Prompt_Version_2_Template.md"
    ]
  },
  {
    name: "User Interface Guidelines",
    description: "The 'How it Looks': Define the visual language, component behavior, and accessibility standards.",
    files: [
      "style-guide.md",
      "component-library.md",
      "accessibility-checklist.md"
    ]
  },
  {
    name: "Custom Artifact",
    description: "The 'Your Turn': Define and generate a unique artifact based on the corpus.",
    files: [
      "custom-artifact.md"
    ]
  }
];