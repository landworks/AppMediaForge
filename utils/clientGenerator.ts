import JSZip from 'jszip';
import { GenerationConfig, UploadedAsset } from '../types';
import { SUPPORTED_DEVICES } from '../constants';

export const generateAssetsZip = async (assets: UploadedAsset[], config: GenerationConfig, projectName: string): Promise<string> => {
  const zip = new JSZip();
  // Structure: AppMediaForge_ProjectName -> Platform -> Locale -> Device -> Orientation
  const sanitizedName = projectName.replace(/[^a-z0-9 _-]/gi, '_').trim() || "Project";
  const rootFolderName = `AppMediaForge_${sanitizedName}`;
  const rootFolder = zip.folder(rootFolderName);

  // Iterate with index to generate ordered filenames (001, 002...)
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const sequenceNum = String(i + 1).padStart(3, '0'); // 001, 002

    // 1. Load the original image into an HTMLImageElement
    const img = new Image();
    img.src = asset.previewUrl;
    await img.decode(); // Wait for load

    // 2. Iterate through selected devices
    for (const deviceId of config.selectedDeviceIds) {
      const device = SUPPORTED_DEVICES.find(d => d.id === deviceId);
      if (!device) continue;

      const targetDim = device.acceptedSizes[0]; // Use primary size
      const isPortrait = config.orientation === 'portrait';
      
      const targetW = isPortrait ? Math.min(targetDim.width, targetDim.height) : Math.max(targetDim.width, targetDim.height);
      const targetH = isPortrait ? Math.max(targetDim.width, targetDim.height) : Math.min(targetDim.width, targetDim.height);

      // 3. Create off-screen canvas
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      // 4. Draw Background
      if (config.background.type === 'solid') {
          ctx.fillStyle = config.background.value;
          ctx.fillRect(0, 0, targetW, targetH);
      } else {
          // Fallback for gradient in canvas (simplistic)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetW, targetH);
      }

      // 5. Calculate Image Placement
      const imgRatio = img.width / img.height;
      const targetRatio = targetW / targetH;
      
      let drawX = 0, drawY = 0, drawW = targetW, drawH = targetH;

      if (config.fitMode === 'cover') {
         // FILL logic
         if (imgRatio > targetRatio) {
            // Image is wider than target: Crop width
            drawH = targetH;
            drawW = targetH * imgRatio;
            drawX = (targetW - drawW) / 2;
         } else {
            // Image is taller than target: Crop height
            drawW = targetW;
            drawH = targetW / imgRatio;
            drawY = (targetH - drawH) / 2;
         }
      } else {
         // FIT logic (Contain)
         // Apply simplistic margin for caption if present (10% reserved space)
         // Real app would likely be more sophisticated with margins
         const hasCaption = !!config.captions['en-US']?.text;
         const availableH = hasCaption ? targetH * 0.85 : targetH;
         const offsetY = hasCaption && config.captions['en-US']?.position === 'top' ? targetH * 0.15 : (targetH - availableH) / 2;

         if (imgRatio > targetRatio) {
             // Fit to width
             drawW = targetW * 0.9; // 5% padding
             drawH = drawW / imgRatio;
             drawX = (targetW - drawW) / 2;
             // Center vertically in available space
             drawY = offsetY + (availableH - drawH) / 2;
         } else {
             // Fit to height
             drawH = availableH * 0.9;
             drawW = drawH * imgRatio;
             drawY = offsetY + (availableH - drawH) / 2;
             drawX = (targetW - drawW) / 2;
         }
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // 6. Draw Caption
      const locale = 'en-US'; // MVP hardcoded
      const caption = config.captions[locale];
      
      if (caption && caption.text) {
          ctx.fillStyle = caption.color;
          // Scale font size based on device height (simple heuristic: 2200px height / 60px base = ~36x scale factor)
          // We'll just trust the user input or multiply by 3 to make it visible on high-res
          const fontSize = caption.fontSize * 3; 
          ctx.font = `bold ${fontSize}px ${caption.fontFamily}, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const textX = targetW / 2;
          // Position at 10% from top or 10% from bottom
          const textY = caption.position === 'top' ? targetH * 0.08 : targetH * 0.92;
          
          // Shadow for readability
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;

          ctx.fillText(caption.text, textX, textY);
      }

      // 7. Export to Blob
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
          // Structure: /AppMediaForge_ProjectName/Platform/Locale/DeviceName/Orientation/Filename
          const safeDeviceName = device.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const fileName = `screenshot_${sequenceNum}_${targetW}x${targetH}.png`;
          
          rootFolder
            ?.folder(device.platform) // iOS or Android
            ?.folder(locale)
            ?.folder(safeDeviceName)
            ?.folder(config.orientation)
            ?.file(fileName, blob);
      }
    }
  }

  // Generate final ZIP
  const content = await zip.generateAsync({ type: "blob" });
  return URL.createObjectURL(content);
};