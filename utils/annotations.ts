/**
 * Developed by LandWorks Services LLC, developer Michael Kintner
 */
import {
  AnnotationConfig,
  AnnotationItem,
  AnnotationLineConfig,
  AnnotationShapeType,
  NumberAnnotationStyle,
  ShapeAnnotationStyle
} from '../types';

export const DEFAULT_ANNOTATION_CONFIG: AnnotationConfig = {
  items: [],
  square: {
    fillColor: '#2563eb',
    fillOpacity: 0.18,
    line: {
      style: 'solid',
      color: '#2563eb',
      width: 0.8
    }
  },
  circle: {
    fillColor: '#ea580c',
    fillOpacity: 0.18,
    line: {
      style: 'solid',
      color: '#ea580c',
      width: 0.8
    }
  },
  number: {
    fillColor: '#2563eb',
    textColor: '#ffffff',
    fontSize: 52,
    line: {
      style: 'solid',
      color: '#ffffff',
      width: 0.8
    }
  }
};

const mergeLine = (line?: Partial<AnnotationLineConfig>): AnnotationLineConfig => ({
  ...DEFAULT_ANNOTATION_CONFIG.square.line,
  ...line
});

const mergeShapeStyle = (
  defaultStyle: ShapeAnnotationStyle,
  style?: Partial<ShapeAnnotationStyle>
): ShapeAnnotationStyle => ({
  ...defaultStyle,
  ...style,
  line: mergeLine({ ...defaultStyle.line, ...style?.line })
});

const mergeNumberStyle = (style?: Partial<NumberAnnotationStyle>): NumberAnnotationStyle => ({
  ...DEFAULT_ANNOTATION_CONFIG.number,
  ...style,
  line: mergeLine({ ...DEFAULT_ANNOTATION_CONFIG.number.line, ...style?.line })
});

export const normalizeAnnotationConfig = (annotations?: Partial<AnnotationConfig>): AnnotationConfig => ({
  items: annotations?.items || [],
  square: mergeShapeStyle(DEFAULT_ANNOTATION_CONFIG.square, annotations?.square),
  circle: mergeShapeStyle(DEFAULT_ANNOTATION_CONFIG.circle, annotations?.circle),
  number: mergeNumberStyle(annotations?.number)
});

export const createAnnotationItem = (
  type: AnnotationShapeType,
  existingItems: AnnotationItem[]
): AnnotationItem => {
  const offset = (existingItems.length % 5) * 6;

  return {
    id: Math.random().toString(36).substring(7),
    type,
    x: Math.min(80, 50 + offset),
    y: Math.min(80, 50 + offset),
    size: type === 'number' ? 12 : 22
  };
};

export const getNumberSequence = (items: AnnotationItem[], id: string): number => {
  const index = items.filter(item => item.type === 'number').findIndex(item => item.id === id);
  return index + 1;
};

export const getAnnotationLabel = (type: AnnotationShapeType): string => {
  if (type === 'square') return 'Square';
  if (type === 'circle') return 'Circle';
  return 'Number';
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return `rgba(0, 0, 0, ${clamp(alpha, 0, 1)})`;
  }

  const numeric = parseInt(value, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;

  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
};

const getLineWidth = (line: AnnotationLineConfig, shortSide: number): number => {
  if (line.style === 'none') return 0;
  return Math.max(0, (line.width / 100) * shortSide);
};

const drawCircle = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
};

export const drawAnnotations = (
  ctx: CanvasRenderingContext2D,
  annotations: AnnotationConfig | undefined,
  width: number,
  height: number
) => {
  const normalized = normalizeAnnotationConfig(annotations);
  const shortSide = Math.min(width, height);

  normalized.items.forEach(item => {
    const size = (item.size / 100) * shortSide;
    const centerX = (item.x / 100) * width;
    const centerY = (item.y / 100) * height;

    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (item.type === 'square') {
      const style = normalized.square;
      const lineWidth = getLineWidth(style.line, shortSide);

      ctx.fillStyle = hexToRgba(style.fillColor, style.fillOpacity);
      ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);

      if (lineWidth > 0) {
        ctx.strokeStyle = style.line.color;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);
      }
    }

    if (item.type === 'circle') {
      const style = normalized.circle;
      const lineWidth = getLineWidth(style.line, shortSide);

      drawCircle(ctx, centerX, centerY, size / 2);
      ctx.fillStyle = hexToRgba(style.fillColor, style.fillOpacity);
      ctx.fill();

      if (lineWidth > 0) {
        ctx.strokeStyle = style.line.color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    }

    if (item.type === 'number') {
      const style = normalized.number;
      const lineWidth = getLineWidth(style.line, shortSide);
      const sequence = getNumberSequence(normalized.items, item.id);

      drawCircle(ctx, centerX, centerY, size / 2);
      ctx.fillStyle = style.fillColor;
      ctx.fill();

      if (lineWidth > 0) {
        ctx.strokeStyle = style.line.color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }

      ctx.fillStyle = style.textColor;
      ctx.font = `bold ${size * (style.fontSize / 100)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(sequence), centerX, centerY + size * 0.02);
    }

    ctx.restore();
  });
};
