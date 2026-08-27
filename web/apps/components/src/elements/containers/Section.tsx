import React from 'react';
import { Box, useTheme } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { SurfaceColors, SurfaceDarkColors, Elevation } from '../../theme/Palette';
import { tokens } from '../../theme/Tokens';

export type SectionVariant = 'main' | 'variant' | 'primary' | 'secondary' | 'error';
export type SectionElevation = keyof typeof Elevation;

export interface SectionProps {
  variant?: SectionVariant;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  elevation?: SectionElevation;
  /** Multiplied by base spacing (4px). Sets all sides. */
  padding?: number;
  /** Multiplied by base spacing (4px). Overrides padding on x-axis. */
  paddingX?: number;
  /** Multiplied by base spacing (4px). Overrides padding on y-axis. */
  paddingY?: number;
  /** Multiplied by base spacing (4px). Sets all sides. */
  margin?: number;
  /** Multiplied by base spacing (4px). Overrides margin on x-axis. */
  marginX?: number;
  /** Multiplied by base spacing (4px). Overrides margin on y-axis. */
  marginY?: number;
}

const getColors = (variant: SectionVariant, isDark: boolean) => {
  const surfaces = isDark ? SurfaceDarkColors : SurfaceColors;
  switch (variant) {
    case 'primary':
      return { bg: surfaces.primaryContainer, color: surfaces.onPrimaryContainer };
    case 'secondary':
      return { bg: surfaces.secondaryContainer, color: surfaces.onSecondaryContainer };
    case 'error':
      return { bg: surfaces.errorContainer, color: surfaces.onErrorContainer };
    case 'variant':
      return { bg: surfaces.surfaceVariant, color: surfaces.onSurfaceVariant };
    case 'main':
    default:
      return { bg: surfaces.surface, color: surfaces.onSurface };
  }
};

const sp = (n: number) => `${n * tokens.BaseMeasurements.spacing}px`;

export const Section: React.FC<SectionProps> = ({
  variant = 'main',
  children,
  sx,
  elevation,
  padding,
  paddingX,
  paddingY,
  margin,
  marginX,
  marginY,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { bg, color } = getColors(variant, isDark);

  return (
    <Box
      sx={{
        backgroundColor: bg,
        color,
        borderRadius: 1,
        ...(elevation !== undefined && { boxShadow: Elevation[elevation] }),
        ...(padding !== undefined && { p: sp(padding) }),
        ...(paddingX !== undefined && { px: sp(paddingX) }),
        ...(paddingY !== undefined && { py: sp(paddingY) }),
        ...(margin !== undefined && { m: sp(margin) }),
        ...(marginX !== undefined && { mx: sp(marginX) }),
        ...(marginY !== undefined && { my: sp(marginY) }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
