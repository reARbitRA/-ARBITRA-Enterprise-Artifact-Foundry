import React from 'react';
import type { GroundingChunk } from '../../types/toolkit.types';

interface SourceLinkProps {
  chunk: GroundingChunk;
}

const SourceLink: React.FC<SourceLinkProps> = ({ chunk }) => {
    const source = chunk.web || chunk.maps;
    if (!source) return null;

    return (
        <div className="text-xs bg-background-secondary p-2 rounded-md border border-border-primary">
            <a
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-light hover:underline break-all"
            >
                {source.title || source.uri}
            </a>
            {chunk.maps?.placeAnswerSources?.map(pa => 
                pa.reviewSnippets.map((review, i) => (
                     <div key={i} className="mt-2 pl-2 border-l-2 border-border-secondary">
                        <p className="text-text-default italic">"{review.snippet}"</p>
                         <a
                            href={review.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-border hover:underline text-[10px]"
                        >
                            - {review.title}
                        </a>
                     </div>
                ))
            )}
        </div>
    );
};

export default SourceLink;