/**
 * Developed by LandWorks Services LLC, developer Michael Kintner
 */
import React, { useMemo } from 'react';
import {
  AnnotationConfig,
  AnnotationItem,
  AnnotationLineConfig,
  AnnotationShapeType,
  GenerationConfig,
  Orientation,
  CaptionConfig
} from '../types';
import { SUPPORTED_DEVICES } from '../constants';
import {
  createAnnotationItem,
  getAnnotationLabel,
  getNumberSequence,
  normalizeAnnotationConfig
} from '../utils/annotations';
import { areOnlyIPadDevicesSelected, getDeviceDimensions } from '../utils/deviceDimensions';

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
    const nextOrientation = areOnlyIPadDevicesSelected(next, SUPPORTED_DEVICES)
      ? Orientation.LANDSCAPE
      : config.orientation;

    onChange({ ...config, selectedDeviceIds: next, orientation: nextOrientation });
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

  const annotations = normalizeAnnotationConfig(config.annotations);

  const updateAnnotations = (nextAnnotations: AnnotationConfig) => {
    onChange({ ...config, annotations: nextAnnotations });
  };

  const addAnnotation = (type: AnnotationShapeType) => {
    updateAnnotations({
      ...annotations,
      items: [...annotations.items, createAnnotationItem(type, annotations.items)]
    });
  };

  const updateAnnotationItem = (id: string, updates: Partial<AnnotationItem>) => {
    updateAnnotations({
      ...annotations,
      items: annotations.items.map(item => item.id === id ? { ...item, ...updates } : item)
    });
  };

  const removeAnnotationItem = (id: string) => {
    updateAnnotations({
      ...annotations,
      items: annotations.items.filter(item => item.id !== id)
    });
  };

  const updateLine = (
    group: 'square' | 'circle' | 'number',
    updates: Partial<AnnotationLineConfig>
  ) => {
    updateAnnotations({
      ...annotations,
      [group]: {
        ...annotations[group],
        line: {
          ...annotations[group].line,
          ...updates
        }
      }
    });
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

    const { width: w, height: h } = getDeviceDimensions(bestDevice, config.orientation);

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
  const compactInputClass = "w-full text-xs bg-white text-slate-800 border-slate-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500";

  const numberFromInput = (value: string, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const renderLineControls = (group: 'square' | 'circle' | 'number') => {
    const line = annotations[group].line;

    return (
      <div className="grid grid-cols-3 gap-2">
        <label className="text-[11px] text-slate-500">
          <span className="block mb-1 font-medium">Line</span>
          <select
            value={line.style}
            onChange={(e) => updateLine(group, { style: e.target.value as AnnotationLineConfig['style'] })}
            className={compactInputClass}
          >
            <option value="solid">Solid</option>
            <option value="none">None</option>
          </select>
        </label>
        <label className="text-[11px] text-slate-500">
          <span className="block mb-1 font-medium">Line Color</span>
          <input
            type="color"
            value={line.color}
            disabled={line.style === 'none'}
            onChange={(e) => updateLine(group, { color: e.target.value })}
            className="h-8 w-full rounded border border-slate-300 cursor-pointer disabled:opacity-40"
          />
        </label>
        <label className="text-[11px] text-slate-500">
          <span className="block mb-1 font-medium">Width %</span>
          <input
            type="number"
            min={0}
            max={4}
            step={0.1}
            value={line.width}
            disabled={line.style === 'none'}
            onChange={(e) => updateLine(group, { width: numberFromInput(e.target.value, line.width) })}
            className={`${compactInputClass} disabled:opacity-40`}
          />
        </label>
      </div>
    );
  };

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

      {/* Orientation */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Orientation</h3>
        <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
          <button
            type="button"
            aria-pressed={config.orientation === Orientation.PORTRAIT}
            onClick={() => onChange({ ...config, orientation: Orientation.PORTRAIT })}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
              config.orientation === Orientation.PORTRAIT
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Portrait
          </button>
          <button
            type="button"
            aria-pressed={config.orientation === Orientation.LANDSCAPE}
            onClick={() => onChange({ ...config, orientation: Orientation.LANDSCAPE })}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
              config.orientation === Orientation.LANDSCAPE
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Landscape
          </button>
        </div>
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
              Fit (No Crop)
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

      {/* Callouts Section */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Callouts</h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {(['square', 'circle', 'number'] as AnnotationShapeType[]).map(type => (
            <button
              key={type}
              onClick={() => addAnnotation(type)}
              className="px-2 py-2 text-xs rounded border bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              Add {getAnnotationLabel(type)}
            </button>
          ))}
        </div>

        <div className="space-y-2 mb-4">
          {annotations.items.length === 0 ? (
            <p className="text-xs text-slate-500 bg-white border border-dashed border-slate-200 rounded p-3">
              Add a square, circle, or numbered marker to overlay it on every generated screenshot.
            </p>
          ) : (
            annotations.items.map(item => {
              const label = item.type === 'number'
                ? `Number ${getNumberSequence(annotations.items, item.id)}`
                : getAnnotationLabel(item.type);

              return (
                <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">{label}</span>
                    <button
                      onClick={() => removeAnnotationItem(item.id)}
                      className="text-[11px] font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="text-[11px] text-slate-500">
                      <span className="block mb-1 font-medium">X %</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={item.x}
                        onChange={(e) => updateAnnotationItem(item.id, { x: numberFromInput(e.target.value, item.x) })}
                        className={compactInputClass}
                      />
                    </label>
                    <label className="text-[11px] text-slate-500">
                      <span className="block mb-1 font-medium">Y %</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={item.y}
                        onChange={(e) => updateAnnotationItem(item.id, { y: numberFromInput(e.target.value, item.y) })}
                        className={compactInputClass}
                      />
                    </label>
                    <label className="text-[11px] text-slate-500">
                      <span className="block mb-1 font-medium">Size %</span>
                      <input
                        type="number"
                        min={4}
                        max={80}
                        value={item.size}
                        onChange={(e) => updateAnnotationItem(item.id, { size: numberFromInput(e.target.value, item.size) })}
                        className={compactInputClass}
                      />
                    </label>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Square Style</h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <label className="text-[11px] text-slate-500">
                <span className="block mb-1 font-medium">Fill</span>
                <input
                  type="color"
                  value={annotations.square.fillColor}
                  onChange={(e) => updateAnnotations({ ...annotations, square: { ...annotations.square, fillColor: e.target.value } })}
                  className="h-8 w-full rounded border border-slate-300 cursor-pointer"
                />
              </label>
              <label className="text-[11px] text-slate-500">
                <span className="block mb-1 font-medium">Opacity</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.05}
                  value={annotations.square.fillOpacity}
                  onChange={(e) => updateAnnotations({ ...annotations, square: { ...annotations.square, fillOpacity: numberFromInput(e.target.value, annotations.square.fillOpacity) } })}
                  className={compactInputClass}
                />
              </label>
            </div>
            {renderLineControls('square')}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Circle Style</h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <label className="text-[11px] text-slate-500">
                <span className="block mb-1 font-medium">Fill</span>
                <input
                  type="color"
                  value={annotations.circle.fillColor}
                  onChange={(e) => updateAnnotations({ ...annotations, circle: { ...annotations.circle, fillColor: e.target.value } })}
                  className="h-8 w-full rounded border border-slate-300 cursor-pointer"
                />
              </label>
              <label className="text-[11px] text-slate-500">
                <span className="block mb-1 font-medium">Opacity</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.05}
                  value={annotations.circle.fillOpacity}
                  onChange={(e) => updateAnnotations({ ...annotations, circle: { ...annotations.circle, fillOpacity: numberFromInput(e.target.value, annotations.circle.fillOpacity) } })}
                  className={compactInputClass}
                />
              </label>
            </div>
            {renderLineControls('circle')}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 mb-1">Linked Number Style</h4>
            <p className="text-[10px] text-slate-500 mb-2">
              All numbered markers share this style and renumber automatically when one is deleted.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <label className="text-[11px] text-slate-500">
                <span className="block mb-1 font-medium">Fill</span>
                <input
                  type="color"
                  value={annotations.number.fillColor}
                  onChange={(e) => updateAnnotations({ ...annotations, number: { ...annotations.number, fillColor: e.target.value } })}
                  className="h-8 w-full rounded border border-slate-300 cursor-pointer"
                />
              </label>
              <label className="text-[11px] text-slate-500">
                <span className="block mb-1 font-medium">Text</span>
                <input
                  type="color"
                  value={annotations.number.textColor}
                  onChange={(e) => updateAnnotations({ ...annotations, number: { ...annotations.number, textColor: e.target.value } })}
                  className="h-8 w-full rounded border border-slate-300 cursor-pointer"
                />
              </label>
              <label className="text-[11px] text-slate-500">
                <span className="block mb-1 font-medium">Font %</span>
                <input
                  type="number"
                  min={20}
                  max={80}
                  value={annotations.number.fontSize}
                  onChange={(e) => updateAnnotations({ ...annotations, number: { ...annotations.number, fontSize: numberFromInput(e.target.value, annotations.number.fontSize) } })}
                  className={compactInputClass}
                />
              </label>
            </div>
            {renderLineControls('number')}
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
