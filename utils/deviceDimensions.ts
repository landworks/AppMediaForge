/**
 * Developed by LandWorks Services LLC, developer Michael Kintner
 */
import { DeviceDefinition, Dimension, Orientation } from '../types';

export const getDeviceDimensions = (
  device: DeviceDefinition,
  orientation: Orientation
): Dimension => {
  const size = device.acceptedSizes[0];
  const shortSide = Math.min(size.width, size.height);
  const longSide = Math.max(size.width, size.height);

  return orientation === Orientation.PORTRAIT
    ? { width: shortSide, height: longSide }
    : { width: longSide, height: shortSide };
};

export const areOnlyIPadDevicesSelected = (
  selectedDeviceIds: string[],
  devices: DeviceDefinition[]
): boolean => {
  if (selectedDeviceIds.length === 0) return false;

  return selectedDeviceIds.every(deviceId => {
    const device = devices.find(d => d.id === deviceId);
    return device?.platform === 'iPadOS';
  });
};
