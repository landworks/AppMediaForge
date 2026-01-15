/**
 * Developed by LandWorks Services LLC, developer Michael Kintner
 */
import React, { useMemo } from 'react';
import { GenerationConfig, Orientation, CaptionConfig } from '../types';
import { SUPPORTED_DEVICES } from '../constants';

interface ConfigPanelProps {
  config: GenerationConfig;
  onChange: (newConfig: GenerationConfig) => void;
  onApplySplits?: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange, onApplySplits }) => {

  const toggleDevice = (id: string) => {
    const current = config.selectedDeviceIds;
    const next = current.includes(id) 
      ? current.filter(d => d !== id) 
      : [...current, id];
    onChange({ ...config, selectedDeviceIds: next });
  };

  const updateCaption = (text: string) => {
    // For MVP, simplistic single locale update
    const newCaptions = { ...config.captions };
    const baseConfig: CaptionConfig = newCaptions['en-US'] || {
      text: '',
      color: '#ffffff',
      fontSize: 60,
      position: 'top',
      fontFamily: 'Arial'
    };
    
    newCaptions['en-US'] = { ...baseConfig, text };
    onChange({ ...config, captions: newCaptions });
  };

  // Calculate recommended dimensions for Panorama
  const recommendedDimensions = useMemo(() => {
    if (config.mode !== 'panorama' || config.selectedDeviceIds.length === 0) return null;

    // Filter selected devices and find the largest one to recommend as source
    const selectedDevices = SUPPORTED_DEVICES.filter(d => config.selectedDeviceIds.includes(d.id));
    
    // Sort by resolution area descending
    const sorted = [...selectedDevices].sort((a, b) => {
        const areaA = a.acceptedSizes[0].width * a.acceptedSizes[0].height;
        const areaB = b.acceptedSizes[0].width * b.acceptedSizes[0].height;
        return areaB - areaA;
    });

    const bestDevice = sorted[0];
    if (!bestDevice) return null;

    const size = bestDevice.acceptedSizes[0];
    const isPortrait = config.orientation === 'portrait';
    
    // Single Screen Dimensions
    const w = isPortrait ? Math.min(size.width, size.height) : Math.max(size.width, size.height);
    const h = isPortrait ? Math.max(size.width, size.height) : Math.min(size.width, size.height);

    // Canvas Dimensions
    const canvasW = w * config.panoramaCount;
    const canvasH = h;

    return {
        deviceName: bestDevice.name,
        width: canvasW,
        height: canvasH
    };
  }, [config.mode, config.selectedDeviceIds, config.orientation, config.panoramaCount]);


  // Dark theme input styles
  const inputClass = "w-full text-sm bg-slate-700 text-white border-slate-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-slate-400";

  // Group devices
  const iosDevices = SUPPORTED_DEVICES.filter(d => d.platform === 'iOS');
  const ipadDevices = SUPPORTED_DEVICES.filter(d => d.platform === 'iPadOS');
  const androidDevices = SUPPORTED_DEVICES.filter(d => d.platform === 'Android');

  return (
    <div className="space-y-8 p-1">
      {/* Marketing Feature / Mode */}
      <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Marketing Mode</h3>
          <div className="bg-white border border-slate-200 rounded-lg p-1 flex mb-3">
              <button
                onClick={() => onChange({ ...config, mode: 'standard' })}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${config.mode === 'standard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                  Standard
              </button>
              <button
                onClick={() => onChange({ ...config, mode: 'panorama' })}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${config.mode === 'panorama' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                  Panorama
              </button>
          </div>
          
          {config.mode === 'panorama' && (
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Screens to Split</label>
                  <div className="flex space-x-2 mb-3">
                      {[2, 3, 4].map(num => (
                          <button
                            key={num}
                            onClick={() => onChange({...config, panoramaCount: num})}
                            className={`flex-1 py-1.5 text-xs border rounded transition-colors ${
                                config.panoramaCount === num 
                                ? 'bg-white border-blue-500 text-blue-700 ring-1 ring-blue-500 font-bold' 
                                : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                            }`}
                          >
                              {num} Screens
                          </button>
                      ))}
                  </div>

                  {onApplySplits && (
                      <button 
                        onClick={onApplySplits}
                        className="w-full mb-3 flex items-center justify-center py-2 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 shadow-sm transition-colors"
                      >
                         <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                         </svg>
                         Save Splits & Switch to Standard
                      </button>
                  )}
                  
                  <p className="text-[10px] text-slate-500 leading-tight">
                      Creates a {config.panoramaCount}-screen wide canvas. Uploaded image will be sliced into {config.panoramaCount} Apple-compliant files.
                  </p>

                  {recommendedDimensions && (
                    <div className="mt-3 p-2 bg-white border border-blue-200 rounded text-[11px] text-blue-800 shadow-sm">
                        <div className="flex items-center mb-1">
                            <svg className="w-3 h-3 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold">Recommended Source Size</span>
                        </div>
                        <div className="text-lg font-mono font-bold text-slate-800 leading-none mb-1">
                            {recommendedDimensions.width} <span className="text-slate-400">x</span> {recommendedDimensions.height}
                        </div>
                        <div className="text-slate-500">
                            Based on {recommendedDimensions.deviceName}
                        </div>
                    </div>
                  )}
              </div>
          )}
      </section>

      {/* Target Devices */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Target Devices</h3>
        
        {/* iOS Section */}
        <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-500 mb-2 border-b border-slate-200 pb-1">iOS Devices (iPhone)</h4>
            <div className="space-y-2">
            {iosDevices.map(device => (
                <label key={device.id} className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center">
                    <input
                    type="checkbox"
                    className="peer h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition duration-150 ease-in-out"
                    checked={config.selectedDeviceIds.includes(device.id)}
                    onChange={() => toggleDevice(device.id)}
                    />
                </div>
                <div className="flex-1">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{device.name}</span>
                    {device.required && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Required</span>}
                </div>
                </label>
            ))}
            </div>
        </div>

        {/* iPad Section */}
        <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-500 mb-2 border-b border-slate-200 pb-1">iPad Devices</h4>
            <div className="space-y-2">
            {ipadDevices.map(device => (
                <label key={device.id} className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center">
                    <input
                    type="checkbox"
                    className="peer h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition duration-150 ease-in-out"
                    checked={config.selectedDeviceIds.includes(device.id)}
                    onChange={() => toggleDevice(device.id)}
                    />
                </div>
                <div className="flex-1">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{device.name}</span>
                    {device.required && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Required</span>}
                </div>
                </label>
            ))}
            </div>
        </div>

        {/* Android Section */}
        <div>
            <h4 className="text-xs font-bold text-slate-500 mb-2 border-b border-slate-200 pb-1">Android Devices</h4>
            <div className="space-y-2">
            {androidDevices.map(device => (
                <label key={device.id} className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center">
                    <input
                    type="checkbox"
                    className="peer h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition duration-150 ease-in-out"
                    checked={config.selectedDeviceIds.includes(device.id)}
                    onChange={() => toggleDevice(device.id)}
                    />
                </div>
                <div className="flex-1">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{device.name}</span>
                    {device.required && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Required</span>}
                </div>
                </label>
            ))}
            </div>
        </div>
      </section>

      {/* Style Section */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Style</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => onChange({...config, fitMode: 'contain'})}
              className={`px-3 py-2 text-sm rounded border ${config.fitMode === 'contain' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              Fit (Padded)
            </button>
            <button
              onClick={() => onChange({...config, fitMode: 'cover'})}
              className={`px-3 py-2 text-sm rounded border ${config.fitMode === 'cover' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              Fill (Crop)
            </button>
        </div>
        
        <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">Background Color</label>
            <div className="flex items-center space-x-2">
                <input 
                  type="color" 
                  value={config.background.value}
                  onChange={(e) => onChange({...config, background: { type: 'solid', value: e.target.value }})}
                  className="h-9 w-9 rounded overflow-hidden border border-slate-300 cursor-pointer p-0.5 bg-white"
                />
                <input 
                  type="text" 
                  value={config.background.value}
                  onChange={(e) => onChange({...config, background: { type: 'solid', value: e.target.value }})}
                  className={inputClass}
                />
            </div>
        </div>
      </section>

      {/* Captions Section (MVP) */}
      <section>
        <div className="flex justify-between items-center mb-3">
             <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Captions</h3>
             <select className="text-xs border-slate-300 bg-slate-100 rounded px-2 py-1 text-slate-600">
                 <option>English (U.S.)</option>
             </select>
        </div>
        <textarea
            rows={3}
            placeholder="Add a marketing caption..."
            className={inputClass}
            value={config.captions['en-US']?.text || ''}
            onChange={(e) => updateCaption(e.target.value)}
        />
        <div className="mt-3 flex items-center space-x-4">
             <label className="flex items-center space-x-2 text-sm text-slate-600">
                 <input 
                    type="radio" 
                    checked={config.captions['en-US']?.position === 'top'} 
                    onChange={() => {
                        const newCaps = {...config.captions};
                        if(newCaps['en-US']) newCaps['en-US'].position = 'top';
                        onChange({...config, captions: newCaps});
                    }}
                 />
                 <span>Top</span>
             </label>
             <label className="flex items-center space-x-2 text-sm text-slate-600">
                 <input 
                    type="radio" 
                    checked={config.captions['en-US']?.position === 'bottom'} 
                    onChange={() => {
                        const newCaps = {...config.captions};
                        if(newCaps['en-US']) newCaps['en-US'].position = 'bottom';
                        onChange({...config, captions: newCaps});
                    }}
                 />
                 <span>Bottom</span>
             </label>
        </div>
        {config.mode === 'panorama' && (
            <p className="text-[10px] text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                Note: In Panorama mode, captions are centered across the full width canvas.
            </p>
        )}
      </section>
    </div>
  );
};