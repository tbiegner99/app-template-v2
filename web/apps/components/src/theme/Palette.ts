export const Palette = {
  navy: {
    50:  '#e8edf3',
    100: '#c5d0de',
    200: '#9fb0c7',
    300: '#7890b0',
    400: '#5a779f',
    500: '#3c5e8e',
    600: '#2d4d7a',
    700: '#1a3a5c',
    800: '#0f2744',
    900: '#071a2e',
  },
  orange: {
    50:  '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  green: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  amber: {
    50:  '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  red: {
    50:  '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  sky: {
    50:  '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
};

export const SemanticColors = {
  primary:   Palette.navy[800],
  secondary: Palette.orange[300],
  success:   Palette.green[600],
  warning:   Palette.amber[600],
  error:     Palette.red[600],
  info:      Palette.sky[600],
};

export const SurfaceColors = {
  surface:              '#ffffff',
  onSurface:            '#000000',
  surfaceVariant:       Palette.navy[50],
  onSurfaceVariant:     Palette.navy[800],
  primaryContainer:     Palette.navy[700],
  onPrimaryContainer:   '#ffffff',
  secondaryContainer:   Palette.orange[200],
  onSecondaryContainer: Palette.navy[800],
  errorContainer:       Palette.red[100],
  onErrorContainer:     Palette.red[800],
};

export const SurfaceDarkColors = {
  surface:              Palette.navy[800],
  onSurface:            '#ffffff',
  surfaceVariant:       Palette.navy[700],
  onSurfaceVariant:     Palette.navy[100],
  primaryContainer:     Palette.navy[700],
  onPrimaryContainer:   '#ffffff',
  secondaryContainer:   Palette.orange[700],
  onSecondaryContainer: '#ffffff',
  errorContainer:       Palette.red[900],
  onErrorContainer:     Palette.red[200],
};

export interface TypeScale {
  fontSize: string;
  fontWeight: number | string;
  lineHeight: number | string;
  letterSpacing: string;
  component: string;
}

export const Typography: Record<string, TypeScale> = {
  H1:            { fontSize: '6rem',    fontWeight: 300, lineHeight: 1.167, letterSpacing: '-0.01562em', component: 'h1' },
  H2:            { fontSize: '3.75rem', fontWeight: 300, lineHeight: 1.2,   letterSpacing: '-0.00833em', component: 'h2' },
  H3:            { fontSize: '3rem',    fontWeight: 400, lineHeight: 1.167, letterSpacing: '0em',        component: 'h3' },
  H4:            { fontSize: '2.125rem',fontWeight: 400, lineHeight: 1.235, letterSpacing: '0.00735em',  component: 'h4' },
  H5:            { fontSize: '1.5rem',  fontWeight: 400, lineHeight: 1.334, letterSpacing: '0em',        component: 'h5' },
  H6:            { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.6,   letterSpacing: '0.0075em',   component: 'h6' },
  Title:         { fontSize: '1.5rem',  fontWeight: 400, lineHeight: 1.334, letterSpacing: '0em',        component: 'h2' },
  Subtitle:      { fontSize: '1rem',    fontWeight: 400, lineHeight: 1.75,  letterSpacing: '0.00938em',  component: 'h3' },
  SubtitleSmall: { fontSize: '0.875rem',fontWeight: 500, lineHeight: 1.57,  letterSpacing: '0.00714em',  component: 'span' },
  Body:          { fontSize: '1rem',    fontWeight: 400, lineHeight: 1.5,   letterSpacing: '0.00938em',  component: 'p' },
  BodySmall:     { fontSize: '0.875rem',fontWeight: 400, lineHeight: 1.43,  letterSpacing: '0.01071em',  component: 'p' },
  Caption:       { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66,  letterSpacing: '0.03333em',  component: 'span' },
  Overline:      { fontSize: '0.75rem', fontWeight: 400, lineHeight: 2.66,  letterSpacing: '0.08333em',  component: 'span' },
};

// Named elevation scale — maps to MUI shadow levels and Flutter elevation values
// none=0, low=2, medium=4, high=8, overlay=16
export const Elevation = {
  none:    'none',
  low:     '0px 1px 2px rgba(0,0,0,0.12), 0px 1px 3px rgba(0,0,0,0.08)',
  medium:  '0px 2px 4px rgba(0,0,0,0.14), 0px 3px 6px rgba(0,0,0,0.10)',
  high:    '0px 4px 8px rgba(0,0,0,0.16), 0px 6px 12px rgba(0,0,0,0.12)',
  overlay: '0px 8px 16px rgba(0,0,0,0.20), 0px 12px 24px rgba(0,0,0,0.14)',
};
