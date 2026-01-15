/**
 * Developed by LandWorks Services LLC, developer Michael Kintner
 */
import { DeviceDefinition } from './types';

// Source: Apple App Store Connect & Google Play Specifications
export const SUPPORTED_DEVICES: DeviceDefinition[] = [
  // --- iOS Devices (iPhone) ---
  {
    id: 'iphone-69',
    name: 'iPhone 6.9" Display',
    platform: 'iOS',
    required: true,
    acceptedSizes: [
      { width: 1290, height: 2796 },
      { width: 1320, height: 2868 },
      { width: 2796, height: 1290 },
    ],
  },
  {
    id: 'iphone-65',
    name: 'iPhone 6.5" Display',
    platform: 'iOS',
    required: true,
    acceptedSizes: [
      { width: 1242, height: 2688 },
      { width: 1284, height: 2778 },
      { width: 2688, height: 1242 },
    ],
  },
  {
    id: 'iphone-63',
    name: 'iPhone 6.3" Display',
    platform: 'iOS',
    required: false,
    acceptedSizes: [
      { width: 1206, height: 2622 },
      { width: 1179, height: 2556 },
      { width: 2622, height: 1206 },
    ],
  },
  {
    id: 'iphone-61',
    name: 'iPhone 6.1" Display',
    platform: 'iOS',
    required: false,
    acceptedSizes: [
      { width: 1170, height: 2532 },
      { width: 1179, height: 2556 },
      { width: 2532, height: 1170 },
    ],
  },
  {
    id: 'iphone-55',
    name: 'iPhone 5.5" Display',
    platform: 'iOS',
    required: true,
    acceptedSizes: [
      { width: 1242, height: 2208 },
      { width: 2208, height: 1242 },
    ],
  },
  
  // --- iPad Devices ---
  {
    id: 'ipad-pro-13',
    name: 'iPad Pro 13" (M4)',
    platform: 'iPadOS',
    required: false,
    acceptedSizes: [
      { width: 2064, height: 2752 },
      { width: 2752, height: 2064 }
    ],
  },
  {
    id: 'ipad-pro-129',
    name: 'iPad Pro 12.9" (3rd Gen+)',
    platform: 'iPadOS',
    required: true,
    acceptedSizes: [
      { width: 2048, height: 2732 },
      { width: 2732, height: 2048 }
    ],
  },
  {
    id: 'ipad-pro-11',
    name: 'iPad Pro 11"',
    platform: 'iPadOS',
    required: false,
    acceptedSizes: [
      { width: 1668, height: 2388 },
      { width: 2388, height: 1668 }
    ],
  },
  {
    id: 'ipad-air-109',
    name: 'iPad Air 10.9"',
    platform: 'iPadOS',
    required: false,
    acceptedSizes: [
      { width: 1640, height: 2360 },
      { width: 2360, height: 1640 }
    ],
  },
  {
    id: 'ipad-102',
    name: 'iPad 10.2"',
    platform: 'iPadOS',
    required: false,
    acceptedSizes: [
      { width: 1620, height: 2160 },
      { width: 2160, height: 1620 }
    ],
  },

  // --- Android Devices ---
  {
    id: 'android-phone',
    name: 'Android Phone',
    platform: 'Android',
    required: true,
    acceptedSizes: [
      { width: 1080, height: 2400 }, // Common FHD+
      { width: 1440, height: 3120 }, // High-end (Pixel Pro)
      { width: 2400, height: 1080 },
    ],
  },
  {
    id: 'android-7-tablet',
    name: 'Android 7" Tablet',
    platform: 'Android',
    required: false,
    acceptedSizes: [
      { width: 1200, height: 1920 }, // Standard 7-8 inch
      { width: 1920, height: 1200 },
    ],
  },
  {
    id: 'android-10-tablet',
    name: 'Android 10" Tablet',
    platform: 'Android',
    required: false,
    acceptedSizes: [
      { width: 1600, height: 2560 }, // Common 10 inch
      { width: 2560, height: 1600 },
    ],
  },
];

export const SUPPORTED_LOCALES = [
  { code: 'en-US', name: 'English (U.S.)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'ja-JP', name: 'Japanese' },
];

export const MOCK_PROJECT_ID = 'proj_12345';