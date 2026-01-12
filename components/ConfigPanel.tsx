import React from 'react';
import { GenerationConfig, Orientation, CaptionConfig } from '../types';
import { SUPPORTED_DEVICES } from '../constants';

interface ConfigPanelProps {
  config: GenerationConfig;
  onChange: (newConfig: GenerationConfig) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {

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

  // Dark theme input styles
  const inputClass = "w-full text-sm bg-slate-700 text-white border-slate-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-slate-400";

  // Group devices
  const iosDevices = SUPPORTED_DEVICES.filter(d => d.platform === 'iOS');
  const androidDevices = SUPPORTED_DEVICES.filter(d => d.platform === 'Android');

  return (
    <div className="space-y-8 p-1">
      {/* Target Devices */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Target Devices</h3>
        
        {/* iOS Section */}
        <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-500 mb-2 border-b border-slate-200 pb-1">iOS Devices</h4>
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
      </section>
    </div>
  );
};