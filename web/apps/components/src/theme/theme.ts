import { createTheme, Theme } from '@mui/material';
import { tokens } from './Tokens';
import { Palette, SurfaceColors, SurfaceDarkColors } from './Palette';

export interface MiningTheme extends Theme {
  tokens: typeof tokens;
}

export const theme: MiningTheme = {
  ...createTheme({
    palette: {
      mode: 'light',
      primary: { main: tokens.Colors.primary },
      secondary: { main: tokens.Colors.secondary },
      background: {
        default: SurfaceColors.surface,
        paper: SurfaceColors.surfaceVariant,
      },
      error: { main: tokens.Colors.error },
    },
  }),
  tokens,
};

export const darkTheme: MiningTheme = {
  ...createTheme({
    palette: {
      mode: 'dark',
      primary: { main: Palette.navy[900] }, // nav uses navy[900], darker than surface
      secondary: { main: tokens.Colors.secondary },
      background: {
        default: SurfaceDarkColors.surface,  // navy[800]
        paper: SurfaceDarkColors.surfaceVariant, // navy[700]
      },
      error: { main: tokens.Colors.error },
    },
  }),
  tokens,
};
