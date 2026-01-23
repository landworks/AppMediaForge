/**
 * Developed by LandWorks Services LLC, developer Michael Kintner
 */
import React from 'react';
import { UploadArea } from './UploadArea';
import { UploadedAsset } from '../types';
import { ICON_DEFINITIONS } from '../constants';

interface IconToolProps {
  projectName: string;
  iconAsset: UploadedAsset | null;
  onAssetAdded: (files: File[]) => void;
  onRemoveAsset: () => void;
}

export const IconTool: React.FC<IconToolProps> = ({ 
  iconAsset,
  onAssetAdded,
  onRemoveAsset
}) => {

  return (
    <div className="flex flex-col h-full overflow-y-auto p-8 space-y-8 bg-slate-50/50">
        <section>
             <div className="flex items-center justify-between mb-4">
                 <div>
                    <h3 className="text-lg font-medium text-slate-900">App Icon Generator</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Upload one large image (1024x1024 recommended). We will generate all required sizes for Xcode (iOS/iPad), Android, and Web.
                    </p>
                 </div>
             </div>

             <div className="max-w-2xl">
                 {!iconAsset ? (
                     <UploadArea 
                        assets={[]} 
                        onAssetsAdded={onAssetAdded} 
                        onRemoveAsset={() => {}} 
                        onReorderAssets={() => {}} 
                     />
                 ) : (
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-6">
                         <div className="relative group w-48 h-48 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                             <img src={iconAsset.previewUrl} className="w-full h-full object-contain" alt="Icon Source" />
                             <button 
                                onClick={onRemoveAsset}
                                className="absolute top-2 right-2 bg-white/90 text-red-600 p-1.5 rounded-full hover:bg-white shadow-sm"
                             >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                             </button>
                         </div>
                         <div className="flex-1 space-y-4">
                             <div>
                                 <h4 className="font-medium text-slate-900">Source Image</h4>
                                 <p className="text-sm text-slate-500">{iconAsset.file.name}</p>
                                 {iconAsset.file.size && (
                                     <p className="text-xs text-slate-400 mt-1">{(iconAsset.file.size / 1024).toFixed(1)} KB</p>
                                 )}
                             </div>
                             
                             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                                 <strong>Ready to Generate:</strong>
                                 <p className="mt-1 text-xs">
                                     Use the <strong>Generate & Zip</strong> button in the left sidebar to create your asset bundle.
                                 </p>
                             </div>
                         </div>
                     </div>
                 )}
             </div>
        </section>

        {/* Preview of what will be generated (Full Grid) */}
        {iconAsset && (
            <section>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Preview of Output ({ICON_DEFINITIONS.length} files)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {ICON_DEFINITIONS.map((def) => (
                        <div key={def.name} className="flex flex-col items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="mb-2 w-12 h-12 flex items-center justify-center bg-slate-50 rounded p-1">
                                <img src={iconAsset.previewUrl} alt="prev" style={{ width: '100%', height: '100%', objectFit: 'contain' }} className="rounded" />
                            </div>
                            {/* Platform Badge */}
                            <div className="mb-1">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                                    def.platform === 'ios' ? 'bg-slate-100 text-slate-600' : 
                                    def.platform === 'android' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                    {def.platform === 'ios' ? 'iOS' : (def.platform === 'android' ? 'Android' : 'Web')}
                                </span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-800 text-center">{def.width}x{def.height}</div>
                            <div className="text-[9px] text-slate-500 text-center leading-tight mt-1 h-8 overflow-hidden flex items-center justify-center w-full">
                                {def.description}
                            </div>
                            <div className="mt-1 w-full bg-slate-50 border-t border-slate-100 pt-1">
                                <p className="text-[8px] text-slate-400 text-center truncate px-1" title={def.name}>
                                    {def.name}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}
    </div>
  );
};