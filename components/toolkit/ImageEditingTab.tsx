
import React, { useState, useRef } from 'react';
import { editImage } from '../../services/aiToolkitService';
import useLocalStorage from '../../hooks/useLocalStorage';

interface EditState {
    prompt: string;
    originalImage: string | null;
    resultImage: string | null;
    error: string | null;
}

const initialState: EditState = {
    prompt: '',
    originalImage: null,
    resultImage: null,
    error: null,
};

const ImageEditingTab: React.FC = () => {
    const [editState, setEditState] = useLocalStorage<EditState>('imageEditingTabState', initialState);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditState(prev => ({
                    ...prev,
                    originalImage: reader.result as string,
                    resultImage: null,
                    error: null,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = async () => {
        if (!editState.prompt || !imageFile) {
            setEditState(prev => ({ ...prev, error: 'Please provide both an image and an editing prompt.' }));
            return;
        }
        setIsLoading(true);
        setEditState(prev => ({ ...prev, resultImage: null, error: null }));
        const response = await editImage(editState.prompt, imageFile);
        // Ensure type narrowing for discriminated union.
        if (response.success) {
            setEditState(prev => ({ ...prev, resultImage: response.image }));
        } else {
            // FIX: Accessing response.error is safe here because the type has been narrowed to ErrorResponse.
            setEditState(prev => ({ ...prev, error: response.error }));
        }
        setIsLoading(false);
    };

    const handleClear = () => {
        setEditState(initialState);
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-text-default mb-1 uppercase tracking-wider">Original Image</label>
                    <div
                        className="border-2 border-dashed border-border-primary rounded-lg p-4 text-center cursor-pointer hover:border-accent-border min-h-[140px] flex items-center justify-center"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {editState.originalImage ? (
                            <img src={editState.originalImage} alt="Original" className="max-h-40 mx-auto rounded-md" />
                        ) : (
                            <p className="text-sm text-text-secondary">Click to upload an image</p>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <div>
                    <label htmlFor="edit-prompt" className="block text-xs text-text-default mb-1 uppercase tracking-wider">Edit Instruction</label>
                    <textarea
                        id="edit-prompt"
                        value={editState.prompt}
                        onChange={(e) => setEditState(prev => ({...prev, prompt: e.target.value}))}
                        placeholder="e.g., Add a retro filter. Remove the person in the background."
                        className="w-full h-full p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border resize-none border border-border-primary"
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleEdit}
                    disabled={isLoading || !editState.prompt || !imageFile}
                    className="w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-accent text-accent-text hover:bg-accent-hover disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Editing...' : 'Edit Image'}
                </button>
                <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary"
                >
                   Clear
                </button>
            </div>
            {editState.error && <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md text-xs">{editState.error}</div>}
            
            <div className="bg-background-primary p-4 rounded-md border border-border-primary min-h-[256px] flex items-center justify-center">
                {isLoading && <div className="w-8 h-8 border-4 border-accent-light border-t-transparent rounded-full animate-spin"></div>}
                {editState.resultImage && <img src={editState.resultImage} alt="Edited" className="max-w-full max-h-96 rounded-md" />}
                {!isLoading && !editState.resultImage && <p className="text-sm text-text-secondary">Edited image will appear here</p>}
            </div>
        </div>
    );
};

export default ImageEditingTab;