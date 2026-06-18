/**
 * Developed by LandWorks Services LLC, developer Michael Kintner
 */
import React, { useMemo } from 'react';
import { DeviceDefinition, GenerationConfig, UploadedAsset } from '../types';
import { SUPPORTED_DEVICES } from '../constants';
import { getNumberSequence, hexToRgba, normalizeAnnotationConfig } from '../utils/annotations';
import { getDeviceDimensions } from '../utils/deviceDimensions';

interface PreviewGridProps {
  assets: UploadedAsset[];
  config: GenerationConfig;
}

const AnnotationOverlay: React.FC<{ config: GenerationConfig; aspectRatio: number }> = ({ config, aspectRatio }) => {
  const annotations = normalizeAnnotationConfig(config.annotations);
  const sizeCorrection = aspectRatio >= 1 ? 1 / aspectRatio : 1;

  if (annotations.items.length === 0) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {annotations.items.map(item => {
        const sizePercent = item.size * sizeCorrection;
        const lineStyle = item.type === 'number'
          ? annotations.number.line
          : item.type === 'square'
            ? annotations.square.line
            : annotations.circle.line;
        const border = lineStyle.style === 'none'
          ? 'none'
          : `${Math.max(1, lineStyle.width * 2)}px solid ${lineStyle.color}`;

        if (item.type === 'number') {
          return (
            <div
              key={item.id}
              className="absolute flex items-center justify-center rounded-full font-bold shadow-sm"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: `${sizePercent}%`,
                aspectRatio: '1 / 1',
                transform: 'translate(-50%, -50%)',
                backgroundColor: annotations.number.fillColor,
                color: annotations.number.textColor,
                border,
                fontSize: `${Math.max(10, annotations.number.fontSize / 2)}px`
              }}
            >
              {getNumberSequence(annotations.items, item.id)}
            </div>
          );
        }

        const style = item.type === 'square' ? annotations.square : annotations.circle;

        return (
          <div
            key={item.id}
            className={`absolute shadow-sm ${item.type === 'circle' ? 'rounded-full' : ''}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: `${sizePercent}%`,
              aspectRatio: '1 / 1',
              transform: 'translate(-50%, -50%)',
              backgroundColor: hexToRgba(style.fillColor, style.fillOpacity),
              border
            }}
          />
        );
      })}
    </div>
  );
};

// Helper to simulate CSS based on config for immediate visual feedback
const SimulatedPreview: React.FC<{ 
  asset: UploadedAsset; 
  config: GenerationConfig; 
  device: DeviceDefinition 
}> = ({ asset, config, device }) => {
  
  const { width, height } = getDeviceDimensions(device, config.orientation);
  const aspectRatio = width / height;
  
  const bgStyle: React.CSSProperties = config.background.type === 'solid' 
    ? { backgroundColor: config.background.value } 
    : { backgroundImage: config.background.value };

  const objectFit = config.fitMode === 'contain' ? 'contain' : 'cover';

  // --- PANORAMA RENDERING LOGIC ---
  if (config.mode === 'panorama') {
      const count = config.panoramaCount || 2;
      const slices = Array.from({ length: count });

      return (
        <div className="flex flex-col space-y-2 w-full col-span-2 md:col-span-2 lg:col-span-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
                <span>{device.name} (Panorama {count}-Screen)</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 rounded-full">Merged Preview</span>
            </div>
            
            <div className="flex space-x-1 overflow-hidden">
                {slices.map((_, index) => (
                    <div 
                        key={index}
                        className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm flex-1 group"
                        style={{ aspectRatio: aspectRatio }}
                    >
                         {/* Background Layer (Per slice, but conceptual wide background) */}
                         <div className="absolute inset-0 z-0" style={bgStyle} />
                         
                         {/* Image Layer - Simulated Slicing via CSS */}
                         {/* The container is 1 unit wide. We want to show a 1/N slice of the Total Width. */}
                         {/* If we treat the image as 'cover' across the WHOLE width: */}
                         {/* Total Width = N units. This div is 1 unit. */}
                         {/* We need an inner container that is N units wide, shifted left by index units. */}
                         
                         <div className="absolute inset-0 z-10 overflow-hidden">
                             <div 
                                style={{
                                    width: `${count * 100}%`, // 300% width for 3 screens
                                    height: '100%',
                                    marginLeft: `-${index * 100}%`, // Shift left: 0, -100%, -200%
                                    position: 'relative',
                                    display: 'flex',
                                }}
                             >
                                 {/* The Image inside the Wide Container */}
                                 {/* We apply flex centering to handle 'contain' vs 'cover' on the wide canvas */}
                                 <div className="w-full h-full flex items-center justify-center relative">
                                      <img 
                                        src={asset.previewUrl} 
                                        alt="Preview" 
                                        className="max-w-none transition-transform duration-300"
                                        style={{ 
                                            width: '100%',
                                            height: '100%',
                                            objectFit: config.fitMode === 'cover' ? 'cover' : 'contain'
                                        }}
                                      />
                                      
                                      {/* Caption Overlay - Centered on Wide Canvas */}
                                      {config.captions['en-US']?.text && (
                                        <div className={`absolute left-0 right-0 p-4 z-20 flex justify-center text-center ${config.captions['en-US'].position === 'top' ? 'top-[5%]' : 'bottom-[5%]'}`}>
                                            <span 
                                                style={{ 
                                                color: config.captions['en-US'].color,
                                                fontSize: '12px', 
                                                fontFamily: config.captions['en-US'].fontFamily,
                                                whiteSpace: 'nowrap'
                                                }}
                                                className="font-bold drop-shadow-md"
                                            >
                                                {config.captions['en-US'].text}
                                            </span>
                                        </div>
                                      )}

                                      <AnnotationOverlay config={config} aspectRatio={aspectRatio * count} />
                                 </div>
                             </div>
                         </div>
                         
                         <div className="absolute bottom-2 right-2 z-30 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                            Part {index + 1}
                         </div>
                    </div>
                ))}
            </div>
        </div>
      );
  }

  // --- STANDARD RENDERING LOGIC ---
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

        <AnnotationOverlay config={config} aspectRatio={aspectRatio} />

        <div className="absolute bottom-2 right-2 z-30 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
          {width}x{height}
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
    <div className={`grid gap-6 ${config.mode === 'panorama' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
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
