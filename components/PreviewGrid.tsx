import React, { useMemo } from 'react';
import { DeviceDefinition, GenerationConfig, UploadedAsset } from '../types';
import { SUPPORTED_DEVICES } from '../constants';

interface PreviewGridProps {
  assets: UploadedAsset[];
  config: GenerationConfig;
}

// Helper to simulate CSS based on config for immediate visual feedback
const SimulatedPreview: React.FC<{ 
  asset: UploadedAsset; 
  config: GenerationConfig; 
  device: DeviceDefinition 
}> = ({ asset, config, device }) => {
  
  // Find the largest accepted size for aspect ratio calculation
  const targetSize = device.acceptedSizes[0];
  const aspectRatio = targetSize.width / targetSize.height;
  
  const bgStyle: React.CSSProperties = config.background.type === 'solid' 
    ? { backgroundColor: config.background.value } 
    : { backgroundImage: config.background.value };

  const objectFit = config.fitMode === 'contain' ? 'contain' : 'cover';

  return (
    <div className="flex flex-col space-y-2">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{device.name}</div>
      <div 
        className="relative w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm group"
        style={{ aspectRatio: aspectRatio }}
      >
        {/* Background Layer */}
        <div className="absolute inset-0 z-0" style={bgStyle} />

        {/* Image Layer */}
        <img 
          src={asset.previewUrl} 
          alt="Preview" 
          className="absolute inset-0 z-10 w-full h-full transition-transform duration-300 group-hover:scale-105"
          style={{ objectFit }}
        />

        {/* Simulated Caption Overlay (Simplified for UI Preview) */}
        {config.captions['en-US']?.text && (
           <div className={`absolute left-0 right-0 p-4 z-20 flex justify-center text-center ${config.captions['en-US'].position === 'top' ? 'top-0' : 'bottom-0'}`}>
             <span 
              style={{ 
                color: config.captions['en-US'].color,
                fontSize: '12px', // Scaled down for preview
                fontFamily: config.captions['en-US'].fontFamily
              }}
              className="font-bold drop-shadow-md"
             >
               {config.captions['en-US'].text}
             </span>
           </div>
        )}

        <div className="absolute bottom-2 right-2 z-30 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
          {targetSize.width}x{targetSize.height}
        </div>
      </div>
    </div>
  );
};

export const PreviewGrid: React.FC<PreviewGridProps> = ({ assets, config }) => {
  const targetDevices = useMemo(() => {
    return SUPPORTED_DEVICES.filter(d => config.selectedDeviceIds.includes(d.id));
  }, [config.selectedDeviceIds]);

  if (assets.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        Upload screenshots to see previews
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {assets.map((asset) => (
        <React.Fragment key={asset.id}>
          {targetDevices.map(device => (
             <SimulatedPreview 
                key={`${asset.id}-${device.id}`} 
                asset={asset} 
                config={config} 
                device={device} 
             />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};