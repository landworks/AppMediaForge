/**
 * Developed by LandWorks Services LLC, developer Michael Kintner
 */

interface ImageDrawRect {
  drawX: number;
  drawY: number;
  drawW: number;
  drawH: number;
}

export const getContainDrawRect = (
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  hasCaption: boolean,
  captionPosition: 'top' | 'bottom' = 'top'
): ImageDrawRect => {
  const imageRatio = imageWidth / imageHeight;
  const availableHeight = hasCaption ? canvasHeight * 0.85 : canvasHeight;
  const offsetY = hasCaption && captionPosition === 'top'
    ? canvasHeight * 0.15
    : (canvasHeight - availableHeight) / 2;
  const availableRatio = canvasWidth / availableHeight;

  if (imageRatio > availableRatio) {
    const drawW = canvasWidth;
    const drawH = drawW / imageRatio;

    return {
      drawX: 0,
      drawY: offsetY + (availableHeight - drawH) / 2,
      drawW,
      drawH
    };
  }

  const drawH = availableHeight;
  const drawW = drawH * imageRatio;

  return {
    drawX: (canvasWidth - drawW) / 2,
    drawY: offsetY,
    drawW,
    drawH
  };
};
