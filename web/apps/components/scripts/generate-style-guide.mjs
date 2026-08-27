#!/usr/bin/env node
// node scripts/generate-style-guide.mjs [output-path]
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const out = resolve(process.argv[2] ?? 'style-guide.html');

// ── Tokens ────────────────────────────────────────────────────────────────────

const Palette = {
  navy: { 50:'#e8edf3',100:'#c5d0de',200:'#9fb0c7',300:'#7890b0',400:'#5a779f',500:'#3c5e8e',600:'#2d4d7a',700:'#1a3a5c',800:'#0f2744',900:'#071a2e' },
  orange: { 50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12' },
  green: { 50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534',900:'#14532d' },
  amber: { 50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#fbbf24',500:'#f59e0b',600:'#d97706',700:'#b45309',800:'#92400e',900:'#78350f' },
  red:   { 50:'#fef2f2',100:'#fee2e2',200:'#fecaca',300:'#fca5a5',400:'#f87171',500:'#ef4444',600:'#dc2626',700:'#b91c1c',800:'#991b1b',900:'#7f1d1d' },
  sky:   { 50:'#f0f9ff',100:'#e0f2fe',200:'#bae6fd',300:'#7dd3fc',400:'#38bdf8',500:'#0ea5e9',600:'#0284c7',700:'#0369a1',800:'#075985',900:'#0c4a6e' },
};

const SemanticColors = {
  primary:   Palette.navy[800],
  secondary: Palette.orange[300],
  success:   Palette.green[600],
  warning:   Palette.amber[600],
  error:     Palette.red[600],
  info:      Palette.sky[600],
};

const SurfaceColors = {
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

const SurfaceDarkColors = {
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

const Elevation = {
  none:    'none',
  low:     '0px 1px 2px rgba(0,0,0,0.12), 0px 1px 3px rgba(0,0,0,0.08)',
  medium:  '0px 2px 4px rgba(0,0,0,0.14), 0px 3px 6px rgba(0,0,0,0.10)',
  high:    '0px 4px 8px rgba(0,0,0,0.16), 0px 6px 12px rgba(0,0,0,0.12)',
  overlay: '0px 8px 16px rgba(0,0,0,0.20), 0px 12px 24px rgba(0,0,0,0.14)',
};

const flutterElevation = { none: 0, low: 2, medium: 4, high: 8, overlay: 16 };

const Typography = {
  H1:            { fontSize:'6rem',     fontWeight:300, lineHeight:1.167, letterSpacing:'-0.01562em' },
  H2:            { fontSize:'3.75rem',  fontWeight:300, lineHeight:1.2,   letterSpacing:'-0.00833em' },
  H3:            { fontSize:'3rem',     fontWeight:400, lineHeight:1.167, letterSpacing:'0em' },
  H4:            { fontSize:'2.125rem', fontWeight:400, lineHeight:1.235, letterSpacing:'0.00735em' },
  H5:            { fontSize:'1.5rem',   fontWeight:400, lineHeight:1.334, letterSpacing:'0em' },
  H6:            { fontSize:'1.25rem',  fontWeight:500, lineHeight:1.6,   letterSpacing:'0.0075em' },
  Title:         { fontSize:'1.5rem',   fontWeight:400, lineHeight:1.334, letterSpacing:'0em' },
  Subtitle:      { fontSize:'1rem',     fontWeight:400, lineHeight:1.75,  letterSpacing:'0.00938em' },
  SubtitleSmall: { fontSize:'0.875rem', fontWeight:500, lineHeight:1.57,  letterSpacing:'0.00714em' },
  Body:          { fontSize:'1rem',     fontWeight:400, lineHeight:1.5,   letterSpacing:'0.00938em' },
  BodySmall:     { fontSize:'0.875rem', fontWeight:400, lineHeight:1.43,  letterSpacing:'0.01071em' },
  Caption:       { fontSize:'0.75rem',  fontWeight:400, lineHeight:1.66,  letterSpacing:'0.03333em' },
  Overline:      { fontSize:'0.75rem',  fontWeight:400, lineHeight:2.66,  letterSpacing:'0.08333em' },
};

const SPACING_BASE = 4;
const BORDER_RADIUS_BASE = 2;

const SURFACE_PAIRS = [
  ['surface','onSurface'],
  ['surfaceVariant','onSurfaceVariant'],
  ['primaryContainer','onPrimaryContainer'],
  ['secondaryContainer','onSecondaryContainer'],
  ['errorContainer','onErrorContainer'],
];

const ICON_NAMES = [
  'CheckCircle','SettingsIcon','InfoIcon','WarningIcon','ErrorIcon','HelpIcon','CloseIcon',
  'MenuIcon','ExpandMoreIcon','ExpandLessIcon','DashboardIcon','AccountCircleIcon',
  'NotificationsIcon','LogoutIcon','LoginIcon','PeopleIcon','PersonIcon','HomeIcon',
  'InfoOutlinedIcon','MailIcon','NotificationsActiveIcon','ChevronRightIcon','ChevronLeftIcon',
  'ArrowBackIcon','SearchIcon','AddIcon','EditIcon','DeleteIcon','FilterListIcon',
  'DownloadIcon','UploadIcon','RefreshIcon','VisibilityIcon','VisibilityOffIcon',
  'LockIcon','LockResetIcon','BlockIcon','CheckCircleOutlineIcon','AssignmentIcon',
  'BarChartIcon','BuildIcon','LocationOnIcon','BusinessIcon',
];

// MUI icon SVG paths (material symbols)
const ICON_PATHS = {
  CheckCircle: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  SettingsIcon: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z',
  InfoIcon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  WarningIcon: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  ErrorIcon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  HelpIcon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
  CloseIcon: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  MenuIcon: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
  PersonIcon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  SearchIcon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  AddIcon: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  EditIcon: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  DeleteIcon: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  HomeIcon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  LogoutIcon: 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
  DownloadIcon: 'M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z',
  UploadIcon: 'M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z',
  RefreshIcon: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  NotificationsIcon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
  PeopleIcon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  FilterListIcon: 'M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z',
  LockIcon: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  BlockIcon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.68L5.68 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.68L18.32 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const swatch = (color, size=32) =>
  `<div style="width:${size}px;height:${size}px;border-radius:4px;background:${color};border:1px solid rgba(0,0,0,0.12);flex-shrink:0"></div>`;

const section = (num, title, content) => `
<section>
  <h2>${num}. ${title}</h2>
  ${content}
</section>`;

const table = (headers, rows) => `
<table>
  <thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
  <tbody>${rows.join('')}</tbody>
</table>`;

const icon = (name) => {
  const path = ICON_PATHS[name] ?? 'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0';
  return `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="${path}"/></svg>`;
};

// ── Sections ──────────────────────────────────────────────────────────────────

const semanticColors = table(
  ['Swatch','Token','CSS Variable','Value'],
  Object.entries(SemanticColors).map(([name,value]) => `
    <tr>
      <td>${swatch(value)}</td>
      <td><strong>${name}</strong></td>
      <td class="mono">--__SLUG__-Colors-${name}</td>
      <td class="mono">${value}</td>
    </tr>`)
);

const surfacePairs = (colors, prefix) => SURFACE_PAIRS.map(([bg,fg]) => {
  const bgVal = colors[bg], fgVal = colors[fg];
  return `
  <div class="surface-pair">
    <div class="surface-preview" style="background:${bgVal};color:${fgVal}">
      <div class="surface-heading">Sample heading text</div>
      <div class="surface-body">Body copy rendered on this surface</div>
    </div>
    <div class="surface-meta">
      <div class="surface-token">${swatch(bgVal,16)}<span class="mono">${bg}</span><span class="mono muted">${bgVal}</span></div>
      <div class="surface-token">${swatch(fgVal,16)}<span class="mono">${fg}</span><span class="mono muted">${fgVal}</span></div>
      <div class="mono tiny muted" style="margin-top:4px">--__SLUG__-${prefix}-${bg} / --__SLUG__-${prefix}-${fg}</div>
    </div>
  </div>`;
}).join('');

const surfacesSection = `
  <h3>Light</h3>
  ${table(['Swatch','Token','CSS Variable','Value'],
    Object.entries(SurfaceColors).map(([name,value]) => `
    <tr>
      <td>${swatch(value)}</td>
      <td><strong>${name}</strong></td>
      <td class="mono">--__SLUG__-Surfaces-${name}</td>
      <td class="mono">${value}</td>
    </tr>`)
  )}
  <div class="surface-pairs">${surfacePairs(SurfaceColors,'Surfaces')}</div>

  <h3>Dark</h3>
  <div class="dark-bg">
  ${table(['Swatch','Token','CSS Variable','Value'],
    Object.entries(SurfaceDarkColors).map(([name,value]) => `
    <tr>
      <td>${swatch(value)}</td>
      <td><strong style="color:#fff">${name}</strong></td>
      <td class="mono">--__SLUG__-SurfacesDark-${name}</td>
      <td class="mono">${value}</td>
    </tr>`)
  )}
  </div>
  <div class="surface-pairs">${surfacePairs(SurfaceDarkColors,'SurfacesDark')}</div>
`;

const paletteSection = Object.entries(Palette).map(([scaleName,scale]) => `
  <h3 style="text-transform:capitalize">${scaleName}</h3>
  ${table(['Swatch','Step','CSS Variable','Value'],
    Object.entries(scale).map(([step,color]) => `
    <tr>
      <td>${swatch(color)}</td>
      <td class="mono">${step}</td>
      <td class="mono">--__SLUG__-Colors-palette-${scaleName}-${step}</td>
      <td class="mono">${color}</td>
    </tr>`)
  )}`).join('');

const elevationSection = table(
  ['Preview','Token','CSS Variable','Flutter','Shadow'],
  Object.entries(Elevation).map(([name,shadow]) => `
    <tr>
      <td><div style="width:40px;height:40px;border-radius:4px;background:#fff;box-shadow:${shadow};border:1px solid rgba(0,0,0,0.06)"></div></td>
      <td><strong>${name}</strong></td>
      <td class="mono">--__SLUG__-Elevation-${name}</td>
      <td class="mono">${flutterElevation[name]}</td>
      <td class="mono tiny">${shadow}</td>
    </tr>`)
);

const spacingSection = table(
  ['Preview','Multiplier','CSS Variable','Value'],
  Array.from({length:20},(_,i)=>i+1).map(i => {
    const size = i * SPACING_BASE;
    return `
    <tr>
      <td style="width:180px"><div style="width:${size}px;height:12px;background:${SemanticColors.primary};border-radius:2px"></div></td>
      <td class="mono">×${i}</td>
      <td class="mono">--__SLUG__-spacing-${i}</td>
      <td class="mono">${size}px</td>
    </tr>`;
  })
);

const borderRadiusSection = table(
  ['Preview','Multiplier','CSS Variable','Value'],
  Array.from({length:10},(_,i)=>i+1).map(i => {
    const r = i * BORDER_RADIUS_BASE;
    return `
    <tr>
      <td><div style="width:48px;height:48px;background:${SemanticColors.primary};border-radius:${r}px"></div></td>
      <td class="mono">×${i}</td>
      <td class="mono">--__SLUG__-border-radius-${i}</td>
      <td class="mono">${r}px</td>
    </tr>`;
  })
);

const TYPO_PROPS = ['fontSize','fontWeight','lineHeight','letterSpacing'];
const typographySection = (() => {
  const rows = Object.entries(Typography).flatMap(([name, scale]) =>
    TYPO_PROPS.map((prop, i) => {
      const previewCell = i === 0 ? `
        <td rowspan="4" style="vertical-align:middle;max-width:260px;overflow:hidden">
          <span style="font-size:${scale.fontSize};font-weight:${scale.fontWeight};line-height:${scale.lineHeight};letter-spacing:${scale.letterSpacing};white-space:nowrap;display:block">${name}</span>
        </td>
        <td rowspan="4" class="mono" style="vertical-align:middle">&lt;${name}&gt;</td>` : '';
      return `<tr style="${i===0?'border-top:2px solid #e0e0e0':''}">
        ${previewCell}
        <td class="mono muted">${prop}</td>
        <td class="mono tiny">--__SLUG__-Typography-${name}-${prop}</td>
        <td class="mono">${scale[prop]}</td>
      </tr>`;
    })
  );
  return table(['Preview','Component','Property','CSS Variable','Value'], rows);
})();

const iconsSection = `
<div class="icon-grid">
  ${ICON_NAMES.map(name => `
  <div class="icon-cell">
    ${icon(name)}
    <div class="mono tiny">${name}</div>
  </div>`).join('')}
</div>`;

const platformNotes = table(
  ['Token category','Web','Mobile'],
  [
    ['Colors','CSS variables via getCssVariables()','SemanticColors, SurfaceColors, SurfaceDarkColors in palette.dart'],
    ['Elevation','box-shadow via --__SLUG__-Elevation-*','AppElevation.none / low / medium / high / overlay (numeric)'],
    ['Spacing','--__SLUG__-spacing-N (N × 4px)','MUI theme spacing'],
    ['Border radius','--__SLUG__-border-radius-N (N × 2px)','borderRadius constant in theme.dart'],
    ['Typography','<H1>, <Body>, etc. from @__SLUG__/components','HeadlineLarge, BodyMedium, etc. from mobile/lib/components'],
    ['Icons','Re-exported from Icons.tsx in @__SLUG__/components','Flutter built-in Icons.* constants'],
  ].map(([cat,web,mob]) => `<tr><td><strong>${cat}</strong></td><td class="mono tiny">${e(web)}</td><td class="mono tiny">${e(mob)}</td></tr>`)
);

// ── HTML ──────────────────────────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__DISPLAY_NAME__ — Style Guide</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: #1a1a1a;
    background: #fff;
    padding: 48px 32px;
    max-width: 1100px;
    margin: 0 auto;
  }

  h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
  h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 20px; padding-bottom: 10px; border-bottom: 2px solid #e0e0e0; }
  h3 { font-size: 1rem; font-weight: 600; margin: 24px 0 12px; text-transform: capitalize; }
  p  { color: #555; margin-bottom: 16px; line-height: 1.6; }

  section { margin-bottom: 56px; }

  .subtitle { color: #666; margin-bottom: 40px; font-size: 0.9rem; }
  .divider  { border: none; border-top: 1px solid #e0e0e0; margin: 0 0 48px; }

  /* Tables */
  table { border-collapse: collapse; width: 100%; margin-bottom: 24px; font-size: 13px; }
  th { padding: 8px 16px; font-weight: 600; font-size: 11px; text-align: left; background: #f5f5f5; border-bottom: 2px solid #e0e0e0; white-space: nowrap; }
  td { padding: 8px 16px; border-bottom: 1px solid #eee; vertical-align: middle; }

  .mono  { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; color: #c7254e; }
  .muted { color: #888; }
  .tiny  { font-size: 11px; }

  /* Surface pairs */
  .surface-pairs { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
  .surface-pair  { display: flex; border-radius: 8px; overflow: hidden; border: 1px solid rgba(0,0,0,0.10); }
  .surface-preview { flex: 1; padding: 20px 24px; display: flex; flex-direction: column; gap: 4px; }
  .surface-heading { font-weight: 700; font-size: 15px; }
  .surface-body    { font-size: 12px; }
  .surface-meta    { background: #f5f5f5; padding: 12px 20px; min-width: 320px; display: flex; flex-direction: column; justify-content: center; gap: 6px; border-left: 1px solid rgba(0,0,0,0.08); }
  .surface-token   { display: flex; align-items: center; gap: 8px; }

  /* Palette */
  .dark-bg { background: #071a2e; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
  .dark-bg table { color: #fff; }
  .dark-bg th { background: rgba(255,255,255,0.08); border-bottom-color: rgba(255,255,255,0.15); color: #fff; }
  .dark-bg td { border-bottom-color: rgba(255,255,255,0.08); }

  /* Icons */
  .icon-grid { display: flex; flex-wrap: wrap; gap: 16px; }
  .icon-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 80px; text-align: center; }
  .icon-cell svg { color: #333; }
  .icon-cell .mono { word-break: break-all; }

  @media print {
    body { padding: 24px 16px; }
    section { page-break-inside: avoid; }
    h2 { page-break-after: avoid; }
  }
</style>
</head>
<body>

<h1>__DISPLAY_NAME__</h1>
<h1 style="font-weight:300;font-size:1.5rem;margin-bottom:8px">Style Guide</h1>
<p class="subtitle">Single reference for design tokens, typography, and visual standards across web and mobile platforms.</p>

${section(1,'Color — Semantic','<p>Semantic tokens map intent to color. Always use these in components — never raw palette values.</p>' + semanticColors)}
${section(2,'Color — Surfaces','<p>Surface tokens define backgrounds and their foreground (on-*) counterparts. Always pair a surface with its <code>on*</code> token for text and icons drawn on top of it.</p>' + surfacesSection)}
${section(3,'Color — Palette','<p>Raw color scales. Use semantic or surface tokens in components; reach for palette values only when defining new tokens.</p>' + paletteSection)}
${section(4,'Elevation','<p>Named shadow scale shared across web and mobile. Web uses <code>box-shadow</code>; mobile uses Flutter\'s numeric elevation.</p>' + elevationSection)}
${section(5,'Spacing','<p>Base unit: <strong>${SPACING_BASE}px</strong>. All spacing values are multiples of this base. Use the <code>padding</code>/<code>margin</code> props on <code>Section</code> — they accept a multiplier.</p>' + spacingSection)}
${section(6,'Border Radius','<p>Base unit: <strong>${BORDER_RADIUS_BASE}px</strong>.</p>' + borderRadiusSection)}
${section(7,'Typography','<p>All text in the app must use these components. Do not use raw MUI <code>Typography</code> or HTML elements. CSS variables are generated for each property.</p>' + typographySection)}
${section(8,'Icons','<p>All icons must be imported from <code>@__SLUG__/components</code> — never directly from <code>@mui/icons-material</code>. To add a new icon, export it from <code>src/elements/icons/Icons.tsx</code> first.</p>' + iconsSection)}
${section(9,'Platform Notes', platformNotes)}

</body>
</html>`;

writeFileSync(out, html, 'utf8');
console.log(`✓ Style guide written to ${out}`);
