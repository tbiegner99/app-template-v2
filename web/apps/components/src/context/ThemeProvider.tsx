import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  useTheme as muiUseTheme,
} from '@mui/material';
import { MiningTheme, theme, darkTheme } from '../theme/theme';
import { getCssVariables, getDarkCssVariables } from '../theme/Tokens';

export type ThemeMode = 'light' | 'dark';

export const useTheme = () => {
  const t = muiUseTheme() as MiningTheme;
  const getSpacing = (factor: number) => t.tokens.BaseMeasurements.spacing * factor;
  return { theme: t, getSpacing };
};

export const ThemeProvider = (props: { children: React.ReactNode; mode?: ThemeMode }) => {
  const { children, mode = 'light' } = props;
  const isDark = mode === 'dark';

  const style = `
    :root {
      ${getCssVariables()}
    }
    ${isDark ? `:root { ${getDarkCssVariables()} }` : ''}
  `;

  return (
    <MuiThemeProvider theme={isDark ? darkTheme : theme}>
      <style>{style}</style>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
