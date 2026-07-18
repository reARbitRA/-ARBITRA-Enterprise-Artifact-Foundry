import React, { useState, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import type { Artifact } from '../types/artifact.types';
import Modal from './Modal';
import CategoryGroup from './CategoryGroup';
import { PrintIcon } from './icons/PrintIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ArtifactDisplayProps {
  artifactsByCategory: { [key: string]: Artifact[] };
  generatedArtifactsCount: number;
  totalArtifacts: number;
  errorLog: string[];
  loadingCategories: string[];
}

const ArtifactDisplay: React.FC<ArtifactDisplayProps> = ({ artifactsByCategory, generatedArtifactsCount, totalArtifacts, errorLog, loadingCategories }) => {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [filterQuery, setFilterQuery] = useState('');
  const [zipProgress, setZipProgress] = useState(0);
  const [zippingFile, setZippingFile] = useState<string | null>(null);

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

  const handleExportPDF = async () => {
    const isExportingAll = selectedFiles.size === 0;
    const doc = new jsPDF();
    let pageCount = 0;

    const allArtifactsMap = new Map<string, Artifact>();
    Object.entries(artifactsByCategory).forEach(([categoryName, artifacts]) => {
        artifacts.forEach(artifact => {
            allArtifactsMap.set(`${categoryName}/${artifact.filename}`, artifact);
        });
    });

    const filesToExport = isExportingAll ? Array.from(allArtifactsMap.keys()) : Array.from(selectedFiles);

    if (filesToExport.length === 0) {
        setZipError("No artifacts selected for PDF export.");
        return;
    }

    filesToExport.forEach((filePath) => {
        const artifact = allArtifactsMap.get(filePath);
        if (!artifact) return;

        doc.addPage();
        pageCount++;

        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxLineWidth = pageWidth - (margin * 2);

        // Header Decoration
        doc.setDrawColor(14, 116, 144);
        doc.setLineWidth(2);
        doc.line(margin, 10, margin + 20, 10);

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(20, 20, 20);
        doc.text(artifact.filename, margin, 25);

        // Metadata
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`CATEGORY: ${filePath.split('/')[0].toUpperCase()}`, margin, 32);
        doc.text(`GENERATED: ${new Date().toLocaleDateString()}`, margin, 37);
        
        doc.setLineWidth(0.1);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, 42, pageWidth - margin, 42);

        // Content
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        
        const splitText = doc.splitTextToSize(artifact.content, maxLineWidth);
        let cursorY = 50;
        const lineHeight = 5;

        splitText.forEach((line: string) => {
            if (cursorY > pageHeight - 20) {
                // Page Number
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                
                doc.addPage();
                pageCount++;
                cursorY = 20;
                
                // Content font reset on new page
                doc.setFont("courier", "normal");
                doc.setFontSize(9);
                doc.setTextColor(40, 40, 40);
            }
            doc.text(line, margin, cursorY);
            cursorY += lineHeight;
        });

        // Page Number for the last page of this artifact
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    });

    // Remove the first blank page jspdf creates by default
    doc.deletePage(1);

    doc.save(isExportingAll ? 'Arbitra_Consolidated_Full.pdf' : 'Arbitra_Selection_Export.pdf');
    toast.success('Professional PDF Generated');
  };

  const handleCopySelected = () => {
    const isCopyingAll = selectedFiles.size === 0;
    const allArtifactsMap = new Map<string, Artifact>();
    Object.entries(artifactsByCategory).forEach(([categoryName, artifacts]) => {
        artifacts.forEach(artifact => {
            allArtifactsMap.set(`${categoryName}/${artifact.filename}`, artifact);
        });
    });

    const filesToCopy = isCopyingAll ? Array.from(allArtifactsMap.keys()) : Array.from(selectedFiles);
    
    let combinedContent = "";
    filesToCopy.forEach(filePath => {
        const artifact = allArtifactsMap.get(filePath);
        if (artifact) {
            combinedContent += `--- ARTIFACT: ${artifact.filename} ---\n`;
            combinedContent += `--- CATEGORY: ${filePath.split('/')[0]} ---\n\n`;
            combinedContent += artifact.content;
            combinedContent += `\n\n${"=".repeat(50)}\n\n`;
        }
    });

    navigator.clipboard.writeText(combinedContent).then(() => {
        toast.success(`Copied ${filesToCopy.length} artifacts to clipboard`);
    }).catch(err => {
        toast.error('Failed to copy content');
    });
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
    const isDownloadingAll = selectedFiles.size === 0;
    if (!isDownloadingAll && selectedFiles.size === 0) {
        setZipError("No files selected for download.");
        return;
    }

    setIsZipping(true);
    setZipError(null);
    setZipProgress(0);
    setZippingFile(null);

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

        const content = await zip.generateAsync(
            { type: 'blob' },
            (metadata) => {
                setZipProgress(metadata.percent);
                if (metadata.currentFile) {
                    setZippingFile(metadata.currentFile);
                }
            }
        );
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
        setZipProgress(0);
        setZippingFile(null);
    }
  };

  const downloadButtonText = () => {
      if (isZipping) return 'Zipping...';
      if (selectedFiles.size > 0) return `Download Selected (${selectedFiles.size})`;
      return `Download All (${generatedArtifactsCount})`;
  };
  
  const filteredArtifactsByCategory = useMemo(() => {
    if (!filterQuery) {
        return artifactsByCategory;
    }
    const lowercasedQuery = filterQuery.toLowerCase();
    return Object.entries(artifactsByCategory).reduce((acc, [categoryName, artifacts]: [string, Artifact[]]) => {
        const filteredArtifacts = artifacts.filter(artifact =>
            artifact.filename.toLowerCase().includes(lowercasedQuery)
        );
        if (filteredArtifacts.length > 0) {
            acc[categoryName] = filteredArtifacts;
        }
        return acc;
    }, {} as { [key: string]: Artifact[] });
  }, [artifactsByCategory, filterQuery]);


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
                  onClick={handleExportPDF}
                  className="flex items-center bg-background-tertiary text-text-primary px-4 py-2 rounded-md text-sm font-semibold uppercase hover:bg-border-primary transition-colors duration-200"
              >
                  <PrintIcon className="h-4 w-4 mr-2" />
                  Export as PDF
              </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center bg-background-tertiary text-text-primary px-4 py-2 rounded-md text-sm font-semibold uppercase hover:bg-border-primary transition-colors duration-200"
              >
                  <PrintIcon className="h-4 w-4 mr-2" />
                  Print
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
        
        {(artifactsExist || loadingCategories.length > 0) && (
             <div className="my-4">
                <input
                    type="text"
                    placeholder="Filter artifacts by filename..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border border border-border-primary"
                />
            </div>
        )}

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

        {isZipping && (
            <div className="bg-background-tertiary border border-border-secondary p-4 rounded-md mb-4">
                <h3 className="font-bold mb-2 uppercase text-accent-light">Creating Zip Archive...</h3>
                <div className="flex justify-between items-center text-sm text-text-default mb-1 uppercase tracking-wider">
                    <p className="truncate max-w-xs sm:max-w-md">Compressing: {zippingFile || 'Initializing...'}</p>
                    <p>{zipProgress.toFixed(0)}%</p>
                </div>
                <div className="w-full bg-background-primary rounded-full h-2.5 border border-border-primary">
                    <div 
                        className="bg-accent-emphasis h-2 rounded-full transition-all duration-200" 
                        style={{width: `${zipProgress}%`}}
                    ></div>
                </div>
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
        
        {loadingCategories.length > 0 && (
            <div className="mb-4">
                <h3 className="font-oswald text-lg uppercase text-text-primary mb-2">Currently Generating</h3>
                <div className="space-y-2">
                    {loadingCategories.map(categoryName => (
                        <div key={categoryName} className="flex items-center justify-between bg-background-tertiary p-3 rounded-md border-l-4 border-accent-border">
                            <p className="text-sm font-bold uppercase tracking-wider text-accent-lighter">{categoryName}</p>
                            <div className="w-5 h-5 border-2 border-accent-light border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {!artifactsExist && errorLog.length === 0 && loadingCategories.length === 0 &&(
          <div className="text-center py-16 border-2 border-dashed border-border-primary rounded-lg">
            <p className="text-text-secondary">No artifacts generated yet.</p>
            <p className="text-text-muted text-sm">Use the Generation Control panel to begin.</p>
          </div>
        )}

        {artifactsExist && (
            <div className="space-y-4">
              {Object.entries(filteredArtifactsByCategory).map(([categoryName, artifacts]) => (
                  <CategoryGroup
                      key={categoryName}
                      categoryName={categoryName}
                      artifacts={artifacts}
                      onSelectArtifact={handleSelectArtifact}
                      selectedFiles={selectedFiles}
                      onToggleFile={handleToggleFile}
                      onToggleCategory={() => handleToggleCategory(categoryName, artifacts)}
                  />
              ))}
              {Object.keys(filteredArtifactsByCategory).length === 0 && filterQuery && (
                  <div className="text-center py-16 border-2 border-dashed border-border-primary rounded-lg">
                      <p className="text-text-secondary">No artifacts match your filter.</p>
                      <p className="text-text-muted text-sm">Try a different search term.</p>
                  </div>
              )}
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