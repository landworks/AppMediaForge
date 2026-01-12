/**
 * Developed by LandWorks Services LLC, developer Michael Kintner
 */
import JSZip from 'jszip';
import { GenerationConfig, UploadedAsset } from '../types';
import { SUPPORTED_DEVICES } from '../constants';

/**
 * Slices a single asset into N vertical parts.
 * Used for converting Panorama uploads into Standard assets.
 */
export const sliceAsset = async (asset: UploadedAsset, count: number): Promise<UploadedAsset[]> => {
    const img = new Image();
    img.src = asset.previewUrl;
    await img.decode();

    const singleW = Math.floor(img.width / count);
    const h = img.height;
    const newAssets: UploadedAsset[] = [];

    for (let i = 0; i < count; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = singleW;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            // Draw slice: source x = i * width
            ctx.drawImage(img, i * singleW, 0, singleW, h, 0, 0, singleW, h);
            
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (blob) {
                const file = new File([blob], `split_${i + 1}_${asset.file.name}`, { type: 'image/png' });
                newAssets.push({
                    id: Math.random().toString(36).substring(7),
                    file: file,
                    previewUrl: URL.createObjectURL(file),
                    originalDimensions: { width: singleW, height: h }
                });
            }
        }
    }
    return newAssets;
};

export const generateAssetsZip = async (assets: UploadedAsset[], config: GenerationConfig, projectName: string): Promise<string> => {
  const zip = new JSZip();
  // Structure: AppMediaForge_ProjectName -> Platform -> Locale -> Device -> Orientation
  const sanitizedName = projectName.replace(/[^a-z0-9 _-]/gi, '_').trim() || "Project";
  const rootFolderName = `AppMediaForge_${sanitizedName}`;
  const rootFolder = zip.folder(rootFolderName);

  // Iterate with index to generate ordered filenames (001, 002...)
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    
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
      
      const singleW = isPortrait ? Math.min(targetDim.width, targetDim.height) : Math.max(targetDim.width, targetDim.height);
      const singleH = isPortrait ? Math.max(targetDim.width, targetDim.height) : Math.min(targetDim.width, targetDim.height);

      // --- PANORAMA LOGIC ---
      if (config.mode === 'panorama') {
        const count = config.panoramaCount || 2;
        const totalW = singleW * count;
        const totalH = singleH;

        // Create Wide Canvas
        const wideCanvas = document.createElement('canvas');
        wideCanvas.width = totalW;
        wideCanvas.height = totalH;
        const ctx = wideCanvas.getContext('2d');
        if (!ctx) continue;

        // Draw Wide Background
        if (config.background.type === 'solid') {
            ctx.fillStyle = config.background.value;
            ctx.fillRect(0, 0, totalW, totalH);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, totalW, totalH);
        }

        // Draw Image on Wide Canvas
        const imgRatio = img.width / img.height;
        const totalRatio = totalW / totalH;
        let drawX = 0, drawY = 0, drawW = totalW, drawH = totalH;

        if (config.fitMode === 'cover') {
             // FILL logic for wide canvas
             if (imgRatio > totalRatio) {
                // Image wider than canvas
                drawH = totalH;
                drawW = totalH * imgRatio;
                drawX = (totalW - drawW) / 2;
             } else {
                drawW = totalW;
                drawH = totalW / imgRatio;
                drawY = (totalH - drawH) / 2;
             }
        } else {
             // FIT logic for wide canvas
             const hasCaption = !!config.captions['en-US']?.text;
             const availableH = hasCaption ? totalH * 0.85 : totalH;
             const offsetY = hasCaption && config.captions['en-US']?.position === 'top' ? totalH * 0.15 : (totalH - availableH) / 2;

             if (imgRatio > totalRatio) {
                 // Fit to width
                 drawW = totalW * 0.95; // Small padding
                 drawH = drawW / imgRatio;
                 drawX = (totalW - drawW) / 2;
                 drawY = offsetY + (availableH - drawH) / 2;
             } else {
                 // Fit to height
                 drawH = availableH * 0.95;
                 drawW = drawH * imgRatio;
                 drawY = offsetY + (availableH - drawH) / 2;
                 drawX = (totalW - drawW) / 2;
             }
        }
        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        // Draw Caption (Centered on Wide Canvas)
        const locale = 'en-US'; 
        const caption = config.captions[locale];
        if (caption && caption.text) {
            ctx.fillStyle = caption.color;
            // Use same font scaling heuristic but applied to total layout
            const fontSize = caption.fontSize * 3; 
            ctx.font = `bold ${fontSize}px ${caption.fontFamily}, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textX = totalW / 2;
            const textY = caption.position === 'top' ? totalH * 0.08 : totalH * 0.92;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
            ctx.fillText(caption.text, textX, textY);
        }

        // --- SLICING ---
        for (let k = 0; k < count; k++) {
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = singleW;
            sliceCanvas.height = singleH;
            const sliceCtx = sliceCanvas.getContext('2d');
            if(!sliceCtx) continue;

            // Draw portion of wide canvas onto slice canvas
            // source x = k * singleW
            sliceCtx.drawImage(wideCanvas, k * singleW, 0, singleW, singleH, 0, 0, singleW, singleH);

            const blob = await new Promise<Blob | null>(resolve => sliceCanvas.toBlob(resolve, 'image/png'));
            if (blob) {
                // Determine sequence based on Asset Index AND Slice Index
                // Example: Asset 1 -> Slides 1, 2, 3. Asset 2 -> Slides 4, 5, 6
                // OR: Typically Panorama replaces standard set.
                // Let's create filename: screenshot_{assetIndex}_slice_{sliceIndex}.png
                const globalSequence = (i * count) + k + 1; // 1-based index
                const seqStr = String(globalSequence).padStart(3, '0');
                
                const safeDeviceName = device.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const fileName = `screenshot_${seqStr}_slice${k+1}_${singleW}x${singleH}.png`;
                
                rootFolder
                    ?.folder(device.platform)
                    ?.folder(locale)
                    ?.folder(safeDeviceName)
                    ?.folder(config.orientation)
                    ?.file(fileName, blob);
            }
        }

      } else {
        // --- STANDARD MODE (Previous Logic) ---
        const sequenceNum = String(i + 1).padStart(3, '0');
        const targetW = singleW;
        const targetH = singleH;

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        if (config.background.type === 'solid') {
            ctx.fillStyle = config.background.value;
            ctx.fillRect(0, 0, targetW, targetH);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetW, targetH);
        }

        const imgRatio = img.width / img.height;
        const targetRatio = targetW / targetH;
        
        let drawX = 0, drawY = 0, drawW = targetW, drawH = targetH;

        if (config.fitMode === 'cover') {
            if (imgRatio > targetRatio) {
                drawH = targetH;
                drawW = targetH * imgRatio;
                drawX = (targetW - drawW) / 2;
            } else {
                drawW = targetW;
                drawH = targetW / imgRatio;
                drawY = (targetH - drawH) / 2;
            }
        } else {
            const hasCaption = !!config.captions['en-US']?.text;
            const availableH = hasCaption ? targetH * 0.85 : targetH;
            const offsetY = hasCaption && config.captions['en-US']?.position === 'top' ? targetH * 0.15 : (targetH - availableH) / 2;

            if (imgRatio > targetRatio) {
                drawW = targetW * 0.9; 
                drawH = drawW / imgRatio;
                drawX = (targetW - drawW) / 2;
                drawY = offsetY + (availableH - drawH) / 2;
            } else {
                drawH = availableH * 0.9;
                drawW = drawH * imgRatio;
                drawY = offsetY + (availableH - drawH) / 2;
                drawX = (targetW - drawW) / 2;
            }
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        const locale = 'en-US'; 
        const caption = config.captions[locale];
        
        if (caption && caption.text) {
            ctx.fillStyle = caption.color;
            const fontSize = caption.fontSize * 3; 
            ctx.font = `bold ${fontSize}px ${caption.fontFamily}, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textX = targetW / 2;
            const textY = caption.position === 'top' ? targetH * 0.08 : targetH * 0.92;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
            ctx.fillText(caption.text, textX, textY);
        }

        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
            const safeDeviceName = device.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = `screenshot_${sequenceNum}_${targetW}x${targetH}.png`;
            
            rootFolder
                ?.folder(device.platform)
                ?.folder(locale)
                ?.folder(safeDeviceName)
                ?.folder(config.orientation)
                ?.file(fileName, blob);
        }
      }
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  return URL.createObjectURL(content);
};