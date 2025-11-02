import React from 'react';

export const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

export const BlueprintIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.28 10.36L12 15.52 2.72 10.36a1.06 1.06 0 0 1 0-1.84l9.28-5.16a1.06 1.06 0 0 1 1.06 0l9.28 5.16a1.06 1.06 0 0 1 0 1.84z"></path>
    <path d="M2.72 14.56l9.28 5.16a1.06 1.06 0 0 0 1.06 0l9.28-5.16"></path>
    <path d="M12 3.34v17.32"></path>
  </svg>
);

export const MegaphoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l18-5v12L3 13V11z"></path>
    <path d="M11.5 11.5L6 14"></path>
    <path d="M15 8.5V11"></path>
  </svg>
);

export const ServerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
    <line x1="6" y1="6" x2="6.01" y2="6"></line>
    <line x1="6" y1="18" x2="6.01" y2="18"></line>
  </svg>
);

export const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

export const ChipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
    <line x1="8" y1="2" x2="8" y2="22"></line>
    <line x1="16" y1="2" x2="16" y2="22"></line>
    <line x1="2" y1="8" x2="22" y2="8"></line>
    <line x1="2" y1="16" x2="22" y2="16"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
    <line x1="15" y1="9" x2="9" y2="15"></line>
  </svg>
);

export const PaletteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="2.5"></circle>
    <circle cx="17.5" cy="10.5" r="2.5"></circle>
    <circle cx="15.5" cy="15.5" r="2.5"></circle>
    <circle cx="10.5" cy="13.5" r="2.5"></circle>
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-1.21-1.2-2.11-2.86-2.11-4.49 0-3.31 2.69-6 6-6 1.63 0 3.29.59 4.49 2.11.27.24.62.39 1.01.39.83 0 1.5-.67 1.5-1.5s-4.03-9-9-9z"></path>
  </svg>
);

export const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"></path>
    </svg>
);

export const getCategoryIcon = (categoryName: string): React.FC<{ className?: string }> | null => {
    switch (categoryName) {
        case "Strategic & Business Case":
            return BriefcaseIcon;
        case "Product & Technical Specification":
            return BlueprintIcon;
        case "Go-to-Market & Sales":
            return MegaphoneIcon;
        case "Deployment & Operations":
            return ServerIcon;
        case "Governance, Risk & Compliance":
            return ShieldIcon;
        case "AI Engine Interface":
            return ChipIcon;
        case "User Interface Guidelines":
            return PaletteIcon;
        case "Custom Artifact":
            return SparkleIcon;
        default:
            return null;
    }
};
