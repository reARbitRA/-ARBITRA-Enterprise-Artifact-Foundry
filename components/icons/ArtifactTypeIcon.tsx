import React from 'react';

interface ArtifactTypeIconProps {
  filename: string;
}

const JsonIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21a9 9 0 0 1 0-18c2.5 0 4.8.9 6.5 2.5" />
    <path d="M12 3a9 9 0 0 1 0 18c-2.5 0-4.8-.9-6.5-2.5" />
    <path d="M12 12V3" />
    <path d="M12 12l4.5 2.5" />
    <path d="M12 12L7.5 9.5" />
  </svg>
);

const MarkdownIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12l2 2 4-4" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

const XlsxIcon = ({ className }: { className: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const TxtIcon = ({ className }: { className: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const FolderIcon = ({ className }: { className: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

const GenericFileIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);


export const ArtifactTypeIcon: React.FC<ArtifactTypeIconProps> = ({ filename }) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const className = "h-5 w-5 text-gray-500 flex-shrink-0";
  
  if (filename.endsWith('/')) {
      return <FolderIcon className={className} />;
  }
  if (extension === 'json') {
    return <JsonIcon className={className} />;
  }
  if (extension === 'md') {
    return <MarkdownIcon className={className} />;
  }
  if (extension === 'xlsx') {
      return <XlsxIcon className={className} />;
  }
  if (extension === 'txt') {
      return <TxtIcon className={className} />;
  }

  return <GenericFileIcon className={className} />;
};
