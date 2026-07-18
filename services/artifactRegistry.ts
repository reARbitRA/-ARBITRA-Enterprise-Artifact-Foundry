
export interface Category {
  name: string;
  description: string;
  files: string[];
  useThinkingMode?: boolean;
  useGrounding?: 'googleSearch';
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
    useGrounding: 'googleSearch',
  },
  {
    name: "AI Asset Valuation",
    description: "The 'Worth': Valuate prompts as Intellectual Property using the AAVM framework.",
    files: [
      "valuation-report.md",
      "roi-model.xlsx",
      "asset-manifest.json",
      "optimization-strategy.md"
    ],
    useThinkingMode: true,
    useGrounding: 'googleSearch',
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
    ],
    useGrounding: 'googleSearch',
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
    name: "Artifact Export & Tooling",
    description: "The 'How to Share': Tools and scripts for exporting and managing generated artifacts.",
    files: [
      "export-script.sh",
      "export-config.json",
      "README.md"
    ],
    useThinkingMode: true,
  },
  {
    name: "Governance, Risk & Compliance",
    description: "The 'How to Trust': Prove the solution is secure, compliant, and trustworthy.",
    files: [
      "compliance-report.md",
      "legal-documents.md",
      "watermark-info.txt",
      "audit-trail.md"
    ]
  }
];
