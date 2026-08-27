import React from 'react';
import { Box } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { Elevation } from '../../theme/Palette';

export type CardElevation = keyof typeof Elevation;

export interface CardProps {
  children?: React.ReactNode;
  margin?: number | string;
  elevation?: CardElevation;
  sx?: SxProps<Theme>;
}

export const Card: React.FC<CardProps> = ({
  children,
  margin = 3,
  elevation = 'low',
  sx,
}) => (
  <Box
    sx={{
      p: 3,
      mt: margin,
      borderRadius: 1,
      boxShadow: Elevation[elevation],
      ...sx,
    }}
  >
    {children}
  </Box>
);
