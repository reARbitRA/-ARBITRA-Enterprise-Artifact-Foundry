import React, { useState, useCallback } from 'react';
import type { Artifact } from '../types';
import Modal from './Modal';
import CategoryGroup from './CategoryGroup';
import { PrintIcon } from './icons/PrintIcon';
import { DownloadIcon } from './icons/DownloadIcon';

// Add JSZip declaration for TypeScript
declare const JSZip: any;

interface ArtifactDisplayProps {
  artifactsByCategory: { [key: string]: Artifact[] };
  generatedArtifactsCount: number;
  totalArtifacts: number;
  errorLog: string[];
}

const ArtifactDisplay: React.FC<ArtifactDisplayProps> = ({ artifactsByCategory, generatedArtifactsCount, totalArtifacts, errorLog }) => {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const handleSelectArtifact = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
  };

  const handleCloseModal = () => {
    setSelectedArtifact(null);
  };
  
  const progress = totalArtifacts > 0 ? (generatedArtifactsCount / totalArtifacts) * 100 : 0;
  const artifactsExist = Object.keys(artifactsByCategory).length > 0;

  const handlePrint = () => {
    window.print();
  };
  
  const handleToggleFile = useCallback((filePath: string) => {
    setSelectedFiles(prev => {
        const newSet = new Set(prev);
        if (newSet.has(filePath)) {
            newSet.delete(filePath);
        } else {
            newSet.add(filePath);
        }
        return newSet;
    });
  }, []);

  const handleToggleCategory = useCallback((categoryName: string, artifacts: Artifact[]) => {
      const filePaths = artifacts.map(a => `${categoryName}/${a.filename}`);
      const areAllSelected = filePaths.every(fp => selectedFiles.has(fp));

      setSelectedFiles(prev => {
          const newSet = new Set(prev);
          if (areAllSelected) {
              filePaths.forEach(fp => newSet.delete(fp));
          } else {
              filePaths.forEach(fp => newSet.add(fp));
          }
          return newSet;
      });
  }, [selectedFiles]);

  const handleSelectAll = () => {
      const allFilePaths = Object.entries(artifactsByCategory).flatMap(([categoryName, artifacts]: [string, Artifact[]]) => 
          artifacts.map(a => `${categoryName}/${a.filename}`)
      );
      setSelectedFiles(new Set(allFilePaths));
  };

  const handleDeselectAll = () => {
      setSelectedFiles(new Set());
  };

  const handleDownloadSelected = async () => {
    if (typeof JSZip === 'undefined') {
        setZipError("JSZip library not found. Cannot create zip file.");
        return;
    }
    
    const isDownloadingAll = selectedFiles.size === 0;
    if (!isDownloadingAll && selectedFiles.size === 0) {
        setZipError("No files selected for download.");
        return;
    }

    setIsZipping(true);
    setZipError(null);

    try {
        const zip = new JSZip();
        const allArtifactsMap = new Map<string, Artifact>();
        Object.entries(artifactsByCategory).forEach(([categoryName, artifacts]: [string, Artifact[]]) => {
            artifacts.forEach(artifact => {
                allArtifactsMap.set(`${categoryName}/${artifact.filename}`, artifact);
            });
        });
        
        const filesToZip = isDownloadingAll ? new Set(allArtifactsMap.keys()) : selectedFiles;

        filesToZip.forEach(filePath => {
            const artifact = allArtifactsMap.get(filePath);
            if (artifact) {
                const parts = filePath.split('/');
                const categoryName = parts[0];
                const filename = parts.slice(1).join('/');

                const sanitizedCategoryName = categoryName.replace(/[<>:"/\\|?*]/g, '_');
                const categoryFolder = zip.folder(sanitizedCategoryName);
                
                if (categoryFolder) {
                    if (filename.endsWith('/')) {
                        categoryFolder.folder(filename);
                    } else {
                        categoryFolder.file(filename, artifact.content);
                    }
                }
            }
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const zipFilename = isDownloadingAll ? 'Arbitra_Artifacts_All.zip' : 'Arbitra_Artifacts_Selection.zip';
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = zipFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setZipError(`Failed to create zip file: ${errorMessage}`);
        console.error("Failed to create zip file:", error);
    } finally {
        setIsZipping(false);
    }
  };

  const downloadButtonText = () => {
      if (isZipping) return 'Zipping...';
      if (selectedFiles.size > 0) return `Download Selected (${selectedFiles.size})`;
      return `Download All (${generatedArtifactsCount})`;
  };

  return (
    <div className="mt-8 textured-panel border border-border-primary rounded-lg p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="font-oswald text-xl uppercase text-text-primary">
          Generated Artifacts
        </h2>
        {artifactsExist && (
            <div className="no-print flex items-center gap-2">
                 <button
                  onClick={handleDownloadSelected}
                  disabled={isZipping || generatedArtifactsCount === 0}
                  className="flex items-center bg-accent text-accent-text px-4 py-2 rounded-md text-sm font-semibold uppercase hover:bg-accent-hover transition-colors duration-200 disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed"
                >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    {downloadButtonText()}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center bg-background-tertiary text-text-primary px-4 py-2 rounded-md text-sm font-semibold uppercase hover:bg-border-primary transition-colors duration-200"
              >
                  <PrintIcon className="h-4 w-4 mr-2" />
                  Generate PDF
              </button>
            </div>
        )}
      </div>

      <div className="no-print">
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-text-default mb-1 uppercase tracking-wider">
              <p>Overall Progress</p>
              <p>{generatedArtifactsCount} / {totalArtifacts} Files Generated</p>
          </div>
          <div className="w-full bg-background-primary rounded-full h-2.5 border border-border-primary">
              <div 
                  className="bg-accent-emphasis h-2 rounded-full transition-all duration-500" 
                  style={{width: `${progress}%`}}
              ></div>
          </div>
        </div>
        
        {artifactsExist && (
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border-primary">
                <p className="text-sm font-bold uppercase text-text-default">Selection:</p>
                <button
                    onClick={handleSelectAll}
                    className="text-xs font-semibold uppercase text-accent-light hover:text-accent-lighter transition-colors"
                >
                    Select All
                </button>
                <button
                    onClick={handleDeselectAll}
                    className="text-xs font-semibold uppercase text-accent-light hover:text-accent-lighter transition-colors"
                >
                    Deselect All
                </button>
            </div>
        )}

        {zipError && (
            <div className="bg-danger-faded border border-border-danger text-danger px-4 py-3 rounded-md mb-4 text-xs">
                <h3 className="font-bold mb-2 uppercase">Download Error</h3>
                <p className="font-mono">{`> ${zipError}`}</p>
            </div>
        )}

        {errorLog.length > 0 && (
            <div className="bg-danger-faded border border-border-danger text-danger px-4 py-3 rounded-md mb-4 text-xs">
                <h3 className="font-bold mb-2 uppercase">Generation Error Encountered</h3>
                {errorLog.map((log, index) => (
                  <p key={index} className="font-mono">{`> ${log}`}</p>
                ))}
            </div>
        )}

        {!artifactsExist && errorLog.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-border-primary rounded-lg">
            <p className="text-text-secondary">No artifacts generated yet.</p>
            <p className="text-text-muted text-sm">Use the Generation Control panel to begin.</p>
          </div>
        )}

        {artifactsExist && (
            <div className="space-y-4">
              {Object.entries(artifactsByCategory).map(([categoryName, artifacts]) => (
                  <CategoryGroup
                      key={categoryName}
                      categoryName={categoryName}
                      artifacts={artifacts}
                      onSelectArtifact={handleSelectArtifact}
                      selectedFiles={selectedFiles}
                      onToggleFile={handleToggleFile}
                      onToggleCategory={handleToggleCategory}
                  />
              ))}
            </div>
        )}
        
        {selectedArtifact && (
          <Modal 
            artifact={selectedArtifact} 
            onClose={handleCloseModal} 
          />
        )}
      </div>

      <div className="print-only">
          {Object.entries(artifactsByCategory).map(([categoryName, artifacts]: [string, Artifact[]]) => (
            <div key={categoryName} className="artifact-category-print">
              <h1>{categoryName}</h1>
              {artifacts.map((artifact) => (
                <div key={artifact.filename} className="artifact-print">
                  <h2>{artifact.filename}</h2>
                  <pre><code>{artifact.content}</code></pre>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ArtifactDisplay;