import React, { useCallback, useState } from 'react';
import { UploadedAsset } from '../types';

interface UploadAreaProps {
  onAssetsAdded: (files: File[]) => void;
  assets: UploadedAsset[];
  onRemoveAsset: (id: string) => void;
  onReorderAssets: (newOrder: UploadedAsset[]) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ 
  onAssetsAdded, 
  assets, 
  onRemoveAsset,
  onReorderAssets 
}) => {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // File Upload Handlers
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type.startsWith('image/'));
      onAssetsAdded(filesArray);
    }
  }, [onAssetsAdded]);

  const handleDragOverFile = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onAssetsAdded(filesArray);
    }
  };

  // Sorting Handlers
  const handleSortStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleSortDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleSortDrop = (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newAssets = [...assets];
    const item = newAssets[draggedItemIndex];
    newAssets.splice(draggedItemIndex, 1); // Remove from old
    newAssets.splice(index, 0, item); // Insert at new
    
    onReorderAssets(newAssets);
    setDraggedItemIndex(null);
  };

  return (
    <div className="space-y-4">
      <div 
        onDrop={handleFileDrop}
        onDragOver={handleDragOverFile}
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            multiple 
            accept="image/png, image/jpeg" 
            onChange={handleChange}
        />
        <div className="h-12 w-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
             </svg>
        </div>
        <p className="text-sm font-medium text-slate-900">Click or drag base screenshots here</p>
        <p className="text-xs text-slate-500 mt-1">PNG or JPG. High resolution recommended.</p>
      </div>

      {/* Asset List with Drag-and-Drop Sorting */}
      {assets.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {assets.map((asset, index) => (
                  <div 
                    key={asset.id} 
                    className={`relative group rounded-lg overflow-hidden border border-slate-200 cursor-move transition-all ${draggedItemIndex === index ? 'opacity-50 ring-2 ring-blue-500' : 'hover:shadow-md'}`}
                    draggable
                    onDragStart={() => handleSortStart(index)}
                    onDragOver={handleSortDragOver}
                    onDrop={() => handleSortDrop(index)}
                  >
                      {/* Number Badge */}
                      <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                        {index + 1}
                      </div>

                      <img src={asset.previewUrl} className="w-full h-32 object-cover" alt={`Screenshot ${index + 1}`} />
                      
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveAsset(asset.id);
                        }}
                        className="absolute top-1 right-1 bg-white/90 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-20"
                      >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};