/**
 * Developed by LandWorks Services LLC, developer Michael Kintner
 */
import React, { useState } from 'react';
import { UploadArea } from './components/UploadArea';
import { ConfigPanel } from './components/ConfigPanel';
import { PreviewGrid } from './components/PreviewGrid';
import { Button } from './components/Button';
import { IconTool } from './components/IconTool';
import { GenerationConfig, Orientation, UploadedAsset, ToolMode } from './types';
import { generateAssetsZip, sliceAsset, generateIconsZip } from './utils/clientGenerator';

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
  const [activeTool, setActiveTool] = useState<ToolMode>('screenshots');
  const [projectName, setProjectName] = useState("My App");
  
  // --- SCREENSHOT TOOL STATE ---
  const [standardAssets, setStandardAssets] = useState<UploadedAsset[]>([]);
  const [panoAssets, setPanoAssets] = useState<UploadedAsset[]>([]);
  const [config, setConfig] = useState<GenerationConfig>(DEFAULT_CONFIG);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // --- ICON TOOL STATE ---
  const [iconAsset, setIconAsset] = useState<UploadedAsset | null>(null);
  const [isIconProcessing, setIsIconProcessing] = useState(false);
  const [iconDownloadUrl, setIconDownloadUrl] = useState<string | null>(null);

  // --- SCREENSHOT LOGIC ---
  const currentAssets = config.mode === 'panorama' ? panoAssets : standardAssets;
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
      originalDimensions: { width: 0, height: 0 } 
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
      setIconDownloadUrl(null);
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
          setStandardAssets(prev => [...prev, ...splitAssets]);
          setPanoAssets([]);
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
      const url = await generateAssetsZip(currentAssets, config, projectName);
      setDownloadUrl(url);
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate assets. See console.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ICON LOGIC ---
  const handleIconAdded = (files: File[]) => {
      if (files.length > 0) {
          const file = files[0];
          const asset: UploadedAsset = {
              id: Math.random().toString(36).substring(7),
              file,
              previewUrl: URL.createObjectURL(file),
              originalDimensions: { width: 0, height: 0 }
          };
          setIconAsset(asset);
          setIconDownloadUrl(null);
      }
  };

  const handleIconRemove = () => {
      setIconAsset(null);
      setIconDownloadUrl(null);
  };

  const handleGenerateIcons = async () => {
      if (!iconAsset) return;
      setIsIconProcessing(true);
      try {
          const url = await generateIconsZip(iconAsset, projectName);
          setIconDownloadUrl(url);
      } catch (e) {
          console.error("Icon generation failed", e);
          alert("Failed to generate icons.");
      } finally {
          setIsIconProcessing(false);
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
          <p className="text-xs text-slate-500 mt-1">Ver 1.4.2 - Asset Automation</p>
        </div>
        
        {/* Navigation Tabs (Tool Switcher) */}
        <div className="px-5 pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tools</h3>
            <div className="space-y-1">
                <button
                    onClick={() => setActiveTool('screenshots')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTool === 'screenshots' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Screenshots</span>
                </button>
                <button
                    onClick={() => setActiveTool('icons')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTool === 'icons' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>App Icons</span>
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
            {activeTool === 'screenshots' ? (
                <ConfigPanel 
                    config={config} 
                    onChange={handleConfigChange} 
                    onApplySplits={handleApplySplits}
                />
            ) : (
                <div className="bg-slate-100 p-4 rounded-lg text-xs text-slate-500 border border-slate-200">
                    <p className="mb-2 font-bold text-slate-700">App Icon Generator</p>
                    <p className="mb-2">1. Upload your highest resolution image (1024x1024) in the main area.</p>
                    <p>2. Click <strong>Generate & Zip</strong> below to download all standard iOS, Android, and Web icons.</p>
                </div>
            )}
        </div>

        <div className="p-5 border-t border-slate-200 bg-white space-y-3">
             {activeTool === 'screenshots' ? (
                 <>
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
                            download={`AppMediaForge_Screens_${safeProjectFilename}.zip`}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download ZIP
                        </a>
                    )}
                 </>
             ) : (
                 <>
                    <Button 
                        variant="primary" 
                        className="w-full" 
                        onClick={handleGenerateIcons}
                        disabled={!iconAsset}
                        isLoading={isIconProcessing}
                    >
                        {isIconProcessing ? 'Processing...' : 'Generate & Zip'}
                    </Button>
                    
                    {iconDownloadUrl && (
                        <a 
                            href={iconDownloadUrl}
                            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                            download={`AppIcons_${safeProjectFilename}.zip`}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download ZIP
                        </a>
                    )}
                 </>
             )}

             <div className="pt-2 text-center border-t border-slate-100 mt-2">
                <p className="text-[10px] text-slate-400 font-medium">
                  Developed by <a href="https://www.LandWorksPro.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 hover:underline transition-colors">LandWorks Services LLC</a>
                </p>
                <p className="text-[10px] text-slate-400">
                   Michael Kintner
                </p>
             </div>
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
                 <div className="text-xs text-slate-400">v1.4.2 (Icons + Screens)</div>
             </div>
         </header>

         {activeTool === 'screenshots' ? (
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
         ) : (
             <IconTool 
                projectName={projectName} 
                iconAsset={iconAsset}
                onAssetAdded={handleIconAdded}
                onRemoveAsset={handleIconRemove}
             />
         )}
      </main>
    </div>
  );
};

export default App;