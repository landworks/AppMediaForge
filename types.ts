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
export type ToolMode = 'screenshots' | 'icons'; // New: Switch between tools

export interface Dimension {
  width: number;
  height: number;
}

export type Platform = 'iOS' | 'Android' | 'iPadOS';
export type IconPlatform = 'ios' | 'android' | 'web';

export interface DeviceDefinition {
  id: string;
  name: string; // e.g., "6.9-inch Display"
  platform: Platform;
  acceptedSizes: Dimension[]; // Multiple accepted sizes
  required: boolean;
}

export interface IconDefinition {
  name: string; // e.g. "AppIcon-60x60@3x.png"
  width: number;
  height: number;
  platform: IconPlatform;
  description?: string; // e.g. "iPhone App (60pt)"
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

export type AnnotationShapeType = 'square' | 'circle' | 'number';
export type AnnotationLineStyle = 'solid' | 'none';

export interface AnnotationLineConfig {
  style: AnnotationLineStyle;
  color: string;
  width: number;
}

export interface ShapeAnnotationStyle {
  fillColor: string;
  fillOpacity: number;
  line: AnnotationLineConfig;
}

export interface NumberAnnotationStyle {
  fillColor: string;
  textColor: string;
  fontSize: number;
  line: AnnotationLineConfig;
}

export interface AnnotationItem {
  id: string;
  type: AnnotationShapeType;
  x: number;
  y: number;
  size: number;
}

export interface AnnotationConfig {
  items: AnnotationItem[];
  square: ShapeAnnotationStyle;
  circle: ShapeAnnotationStyle;
  number: NumberAnnotationStyle;
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
  annotations: AnnotationConfig;
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