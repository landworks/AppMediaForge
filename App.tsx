/**
 * Developed by LandWorks Services LLC, developer Michael Kintner
 */
import React, { useState } from 'react';
import { UploadArea } from './components/UploadArea';
import { ConfigPanel } from './components/ConfigPanel';
import { PreviewGrid } from './components/PreviewGrid';
import { Button } from './components/Button';
import { GenerationConfig, Orientation, UploadedAsset } from './types';
import { generateAssetsZip, sliceAsset } from './utils/clientGenerator';

const DEFAULT_CONFIG: GenerationConfig = {
  mode: 'standard',
  panoramaCount: 2,
  selectedDeviceIds: ['iphone-69', 'iphone-65', 'iphone-55'], // Start with required/popular
  orientation: Orientation.PORTRAIT,
  locales: ['en-US'],
  fitMode: 'contain',
  background: { type: 'solid', value: '#e2e8f0' }, // Slate-200
  captions: {
    'en-US': {
        text: '',
        color: '#0f172a', // Slate-900
        fontSize: 60,
        position: 'top',
        fontFamily: 'Arial'
    }
  }
};

const App: React.FC = () => {
  const [projectName, setProjectName] = useState("My App");
  
  // Separate state for Standard assets and Panorama staging assets
  const [standardAssets, setStandardAssets] = useState<UploadedAsset[]>([]);
  const [panoAssets, setPanoAssets] = useState<UploadedAsset[]>([]);
  
  const [config, setConfig] = useState<GenerationConfig>(DEFAULT_CONFIG);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Helper to get currently active assets based on mode
  const currentAssets = config.mode === 'panorama' ? panoAssets : standardAssets;

  // Helper to set currently active assets
  const setCurrentAssets = (action: React.SetStateAction<UploadedAsset[]>) => {
      if (config.mode === 'panorama') {
          setPanoAssets(action);
      } else {
          setStandardAssets(action);
      }
  };

  const handleAssetsAdded = (files: File[]) => {
    const newAssets: UploadedAsset[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      originalDimensions: { width: 0, height: 0 } // In real app, load image to get dims
    }));
    
    setCurrentAssets(prev => [...prev, ...newAssets]);
    setDownloadUrl(null); 
  };

  const handleRemoveAsset = (id: string) => {
    setCurrentAssets(prev => prev.filter(a => a.id !== id));
    setDownloadUrl(null);
  };

  const handleReorderAssets = (newOrder: UploadedAsset[]) => {
      setCurrentAssets(newOrder);
      setDownloadUrl(null);
  };

  const handleConfigChange = (newConfig: GenerationConfig) => {
      setConfig(newConfig);
      setDownloadUrl(null);
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setProjectName(e.target.value);
      setDownloadUrl(null);
  };

  const handleApplySplits = async () => {
      if (panoAssets.length === 0) return;
      setIsProcessing(true);
      try {
          const splitAssets: UploadedAsset[] = [];
          for (const asset of panoAssets) {
              const parts = await sliceAsset(asset, config.panoramaCount);
              splitAssets.push(...parts);
          }
          
          // Append the new slices to the Standard Assets list
          setStandardAssets(prev => [...prev, ...splitAssets]);
          
          // Clear Panorama Staging
          setPanoAssets([]);
          
          // Switch back to standard mode
          setConfig(prev => ({ ...prev, mode: 'standard' }));
          setDownloadUrl(null);
      } catch (e) {
          console.error("Error slicing assets", e);
          alert("Failed to split panorama images.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    
    try {
      // Use Client-Side Generator (Real processing in browser)
      // Generates zip for whatever is currently visible/active
      const url = await generateAssetsZip(currentAssets, config, projectName);
      setDownloadUrl(url);
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate assets. See console.");
    } finally {
      setIsProcessing(false);
    }
  };

  const safeProjectFilename = projectName.replace(/[^a-z0-9 _-]/gi, '').trim() || 'Project';

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Config */}
      <aside className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-5 border-b border-slate-200 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                 <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                 </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">AppMediaForge</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Ver 1.2.0 - App Store Asset Manager</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
            <ConfigPanel 
                config={config} 
                onChange={handleConfigChange} 
                onApplySplits={handleApplySplits}
            />
        </div>

        <div className="p-5 border-t border-slate-200 bg-white space-y-3">
             <Button 
                variant="primary" 
                className="w-full" 
                onClick={handleGenerate}
                disabled={currentAssets.length === 0}
                isLoading={isProcessing}
             >
                {isProcessing ? 'Processing...' : 'Generate & Zip'}
             </Button>
             
             {downloadUrl && (
                 <a 
                    href={downloadUrl}
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    download={`AppMediaForge_${safeProjectFilename}.zip`}
                 >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download ZIP
                 </a>
             )}
        </div>
      </aside>

      {/* Main Content - Upload & Preview */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
         {/* Top Bar */}
         <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white">
             <div className="flex items-center space-x-2">
                 <h2 className="text-sm font-medium text-slate-500 whitespace-nowrap">Project:</h2>
                 <input 
                    type="text"
                    value={projectName}
                    onChange={handleProjectNameChange}
                    className="border-none bg-transparent text-lg font-bold text-slate-900 focus:ring-0 hover:bg-slate-50 rounded px-2 -ml-2 transition-colors w-64"
                    placeholder="Enter Project Name"
                 />
             </div>
             <div className="flex items-center space-x-4">
                 <div className="text-xs text-slate-400">v1.2.0 (Multi-Platform)</div>
             </div>
         </header>

         <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
            {/* Upload Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-slate-900">
                        {config.mode === 'panorama' ? 'Panorama Source Assets' : 'Source Assets'}
                    </h3>
                    <span className="text-sm text-slate-500">{currentAssets.length} images selected. Drag to reorder.</span>
                </div>
                <div className="mb-4">
                    {config.mode === 'panorama' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 flex items-start justify-between">
                             <div className="flex items-start">
                                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <strong>Panorama Staging:</strong> Upload wide images here. Use the button in the sidebar to slice them and add to your standard project.
                                </div>
                             </div>
                        </div>
                    )}
                </div>
                <UploadArea 
                    assets={currentAssets} 
                    onAssetsAdded={handleAssetsAdded} 
                    onRemoveAsset={handleRemoveAsset}
                    onReorderAssets={handleReorderAssets}
                />
            </section>

            {/* Preview Section */}
            {currentAssets.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-slate-900">Output Preview</h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                           <span className="w-2 h-2 rounded-full bg-green-500"></span>
                           <span>
                               {config.mode === 'panorama' 
                                ? `${config.selectedDeviceIds.length * currentAssets.length * config.panoramaCount} slices to generate`
                                : `${config.selectedDeviceIds.length * currentAssets.length} files to generate`
                               }
                           </span>
                        </div>
                    </div>
                    <PreviewGrid assets={currentAssets} config={config} />
                </section>
            )}
         </div>
      </main>
    </div>
  );
};

export default App;