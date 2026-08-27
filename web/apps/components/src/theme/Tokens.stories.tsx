import React from 'react';
import { Meta } from '@storybook/react';
import { Palette, SemanticColors, SurfaceColors, SurfaceDarkColors, Elevation, Typography } from './Palette';
import { tokens } from './Tokens';

const PREFIX = '__SLUG__';
const cssVar = (name: string) => `--${PREFIX}-${name}`;

const th: React.CSSProperties = {
  padding: '8px 16px',
  fontWeight: 600,
  fontSize: 12,
  textAlign: 'left',
  background: '#f5f5f5',
  borderBottom: '2px solid #e0e0e0',
  whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 12,
  borderBottom: '1px solid #eee',
  verticalAlign: 'middle',
};
const mono: React.CSSProperties = { fontFamily: 'monospace', color: '#c7254e' };

const Table = ({ headers, children }: { headers: string[]; children: React.ReactNode }) => (
  <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
    <thead>
      <tr>
        {headers.map((h) => (
          <th key={h} style={th}>
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

const colorRow = (name: string, value: string, variable: string) => (
  <tr key={name}>
    <td style={td}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          background: value,
          border: '1px solid rgba(0,0,0,0.15)',
        }}
      />
    </td>
    <td style={td}>
      <span style={{ fontWeight: 600 }}>{name}</span>
    </td>
    <td style={{ ...td, ...mono }}>{variable}</td>
    <td style={{ ...td, ...mono }}>{value}</td>
  </tr>
);

const meta: Meta = { title: 'theme/Tokens', tags: ['autodocs'] };
export default meta;

export const SemanticColorsStory = () => (
  <div style={{ padding: 24 }}>
    <h2 style={{ marginBottom: 16 }}>Semantic Colors</h2>
    <Table headers={['Swatch', 'Token', 'CSS Variable', 'Value']}>
      {Object.entries(SemanticColors).map(([name, value]) =>
        colorRow(name, value, cssVar(`Colors-${name}`)),
      )}
    </Table>
  </div>
);
SemanticColorsStory.storyName = 'Semantic Colors';

export const ColorPalette = () => (
  <div style={{ padding: 24 }}>
    <h2 style={{ marginBottom: 24 }}>Color Palette</h2>
    {Object.entries(Palette).map(([scaleName, scale]) => (
      <div key={scaleName} style={{ marginBottom: 32 }}>
        <h3 style={{ textTransform: 'capitalize', marginBottom: 8 }}>{scaleName}</h3>
        <Table headers={['Swatch', 'Step', 'CSS Variable', 'Hex']}>
          {Object.entries(scale as Record<string, string>).map(([step, color]) => (
            <tr key={step}>
              <td style={td}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    background: color,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                />
              </td>
              <td style={td}>{step}</td>
              <td style={{ ...td, ...mono }}>{cssVar(`Colors-palette-${scaleName}-${step}`)}</td>
              <td style={{ ...td, ...mono }}>{color}</td>
            </tr>
          ))}
        </Table>
      </div>
    ))}
  </div>
);

export const Surfaces = () => (
  <div style={{ padding: 24 }}>
    <h2 style={{ marginBottom: 24 }}>Surfaces</h2>

    <h3 style={{ marginBottom: 8 }}>Light</h3>
    <div style={{ marginBottom: 32 }}>
      <Table headers={['Swatch', 'Token', 'CSS Variable', 'Value']}>
        {Object.entries(SurfaceColors).map(([name, value]) =>
          colorRow(name, value, cssVar(`Surfaces-${name}`)),
        )}
      </Table>
    </div>

    <h3 style={{ marginBottom: 8 }}>Dark</h3>
    <div style={{ padding: 16, borderRadius: 8 }}>
      <Table headers={['Swatch', 'Token', 'CSS Variable', 'Value']}>
        {Object.entries(SurfaceDarkColors).map(([name, value]) =>
          colorRow(name, value, cssVar(`SurfacesDark-${name}`)),
        )}
      </Table>
    </div>
  </div>
);

export const Spacing = () => (
  <div style={{ padding: 24 }}>
    <h2 style={{ marginBottom: 16 }}>
      Spacing Scale{' '}
      <span style={{ fontWeight: 400, fontSize: 14, color: '#888' }}>
        base: {tokens.BaseMeasurements.spacing}px
      </span>
    </h2>
    <Table headers={['Preview', 'CSS Variable', 'Value']}>
      {Array.from({ length: 20 }, (_, i) => i + 1).map((i) => {
        const size = i * tokens.BaseMeasurements.spacing;
        return (
          <tr key={i}>
            <td style={{ ...td, width: 200 }}>
              <div
                style={{
                  width: size,
                  height: 16,
                  background: SemanticColors.primary,
                  borderRadius: 2,
                }}
              />
            </td>
            <td style={{ ...td, ...mono }}>{cssVar(`spacing-${i}`)}</td>
            <td style={{ ...td, ...mono }}>{size}px</td>
          </tr>
        );
      })}
    </Table>
  </div>
);

export const BorderRadius = () => (
  <div style={{ padding: 24 }}>
    <h2 style={{ marginBottom: 16 }}>
      Border Radius Scale{' '}
      <span style={{ fontWeight: 400, fontSize: 14, color: '#888' }}>
        base: {tokens.BaseMeasurements.borderRadius}px
      </span>
    </h2>
    <Table headers={['Preview', 'CSS Variable', 'Value']}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => {
        const radius = i * tokens.BaseMeasurements.borderRadius;
        return (
          <tr key={i}>
            <td style={td}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: SemanticColors.primary,
                  borderRadius: radius,
                }}
              />
            </td>
            <td style={{ ...td, ...mono }}>{cssVar(`border-radius-${i}`)}</td>
            <td style={{ ...td, ...mono }}>{radius}px</td>
          </tr>
        );
      })}
    </Table>
  </div>
);

const flutterElevation: Record<string, number> = {
  none: 0, low: 2, medium: 4, high: 8, overlay: 16,
};

export const ElevationStory = () => (
  <div style={{ padding: 24 }}>
    <h2 style={{ marginBottom: 8 }}>Elevation</h2>
    <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
      Web: <code>box-shadow</code> via CSS variable &nbsp;|&nbsp; Mobile: Flutter numeric elevation
    </p>
    <Table headers={['Preview', 'Token', 'CSS Variable', 'Flutter elevation', 'Shadow value']}>
      {Object.entries(Elevation).map(([name, shadow]) => (
        <tr key={name}>
          <td style={td}>
            <div style={{
              width: 48, height: 48, borderRadius: 4,
              background: SurfaceColors.surface,
              boxShadow: shadow,
              border: '1px solid rgba(0,0,0,0.06)',
            }} />
          </td>
          <td style={td}><span style={{ fontWeight: 600 }}>{name}</span></td>
          <td style={{ ...td, ...mono }}>{cssVar(`Elevation-${name}`)}</td>
          <td style={{ ...td, ...mono }}>{flutterElevation[name]}</td>
          <td style={{ ...td, ...mono, maxWidth: 320, whiteSpace: 'normal', wordBreak: 'break-all', fontSize: 11 }}>{shadow}</td>
        </tr>
      ))}
    </Table>
  </div>
);
ElevationStory.storyName = 'Elevation';

const TYPOGRAPHY_PROPS = ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'] as const;

export const TypographyTokens = () => (
  <div style={{ padding: 24 }}>
    <h2 style={{ marginBottom: 8 }}>Typography</h2>
    <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
      CSS variables are generated for each property. Use the named components — never raw MUI <code>Typography</code>.
    </p>
    <Table headers={['Preview', 'Component', 'Property', 'CSS Variable', 'Value']}>
      {Object.entries(Typography).flatMap(([name, scale]) =>
        TYPOGRAPHY_PROPS.map((prop, i) => (
          <tr key={`${name}-${prop}`} style={{ borderTop: i === 0 ? '2px solid #e0e0e0' : undefined }}>
            {i === 0 && (
              <td style={{ ...td, verticalAlign: 'middle' }} rowSpan={TYPOGRAPHY_PROPS.length}>
                <span style={{
                  fontSize: scale.fontSize,
                  fontWeight: scale.fontWeight,
                  lineHeight: scale.lineHeight,
                  letterSpacing: scale.letterSpacing,
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}>
                  {name}
                </span>
              </td>
            )}
            {i === 0 && (
              <td style={{ ...td, ...mono, verticalAlign: 'middle' }} rowSpan={TYPOGRAPHY_PROPS.length}>
                {`<${name}>`}
              </td>
            )}
            <td style={{ ...td, ...mono, color: '#888' }}>{prop}</td>
            <td style={{ ...td, ...mono, fontSize: 11 }}>{`--__SLUG__-Typography-${name}-${prop}`}</td>
            <td style={{ ...td, ...mono }}>{String(scale[prop])}</td>
          </tr>
        ))
      )}
    </Table>
  </div>
);
TypographyTokens.storyName = 'Typography';
