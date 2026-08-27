import { Palette, SemanticColors, SurfaceColors, SurfaceDarkColors, Elevation, Typography } from './Palette';

export const tokens = {
  BaseMeasurements: {
    spacing: 4,
    borderRadius: 2,
  },
  Colors: {
    primary:   SemanticColors.primary,
    secondary: SemanticColors.secondary,
    success:   SemanticColors.success,
    warning:   SemanticColors.warning,
    error:     SemanticColors.error,
    info:      SemanticColors.info,
    palette:   Palette,
  },
  Surfaces: SurfaceColors,
  SurfacesDark: SurfaceDarkColors,
  Elevation,
  Typography,
};
const toCssVariable = (key: string, value: string | number | object, prefix = '') => {
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([subKey, subValue]) => toCssVariable(`${key}-${subKey}`, subValue))
      .join('\n');
  }
  return `--${prefix ? `${prefix}-` : ''}${key}: ${value};`;
};
const getSpacingCssVariables = (prefix) => {
  const vars = [];
  for (let i = 1; i <= 20; i++) {
    vars.push(`--${prefix}-spacing-${i}: ${i * tokens.BaseMeasurements.spacing}px;`);
  }
  return vars.join('\n');
};

const getBorderRadiusCssVariables = (prefix) => {
  const vars = [];
  for (let i = 1; i <= 10; i++) {
    vars.push(`--${prefix}-border-radius-${i}: ${i * tokens.BaseMeasurements.borderRadius}px;`);
  }
  return vars.join('\n');
};
export const getCssVariables = () => {
  const prefix = '__SLUG__';
  return [
    Object.entries(tokens)
      .map(([key, value]) => toCssVariable(key, value, prefix))
      .join('\n'),
    getSpacingCssVariables(prefix),
    getBorderRadiusCssVariables(prefix),
  ].join('\n');
};

export const getDarkCssVariables = () => {
  const prefix = '__SLUG__';
  return Object.entries(SurfaceDarkColors)
    .map(([key, value]) => toCssVariable(`Surfaces-${key}`, value, prefix))
    .join('\n');
};
