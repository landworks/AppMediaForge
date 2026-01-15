/**
 * Developed by LandWorks Services LLC, developer Michael Kintner
 */

/**
 * Data Model for Device Display Classes
 */
export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export type GenerationMode = 'standard' | 'panorama';

export interface Dimension {
  width: number;
  height: number;
}

export type Platform = 'iOS' | 'Android' | 'iPadOS';

export interface DeviceDefinition {
  id: string;
  name: string; // e.g., "6.9-inch Display"
  platform: Platform;
  acceptedSizes: Dimension[]; // Multiple accepted sizes
  required: boolean;
}

/**
 * Configuration for the generation job
 */
export interface CaptionConfig {
  text: string;
  fontSize: number;
  color: string;
  position: 'top' | 'bottom';
  fontFamily: string;
}

export interface GenerationConfig {
  mode: GenerationMode; // New: Standard or Panorama
  panoramaCount: number; // New: 2, 3, or 4 screens
  selectedDeviceIds: string[]; // IDs from DeviceDefinition
  orientation: Orientation;
  locales: string[]; // e.g., 'en-US', 'es-ES'
  fitMode: 'cover' | 'contain'; // Cover = crop, Contain = fit with padding
  background: {
    type: 'solid' | 'gradient';
    value: string; // Hex or CSS gradient string
  };
  captions: Record<string, CaptionConfig>; // Locale -> Config
}

export interface UploadedAsset {
  id: string;
  file: File;
  previewUrl: string;
  originalDimensions: Dimension;
}

export interface Project {
  id: string;
  name: string;
  assets: UploadedAsset[];
  config: GenerationConfig;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}