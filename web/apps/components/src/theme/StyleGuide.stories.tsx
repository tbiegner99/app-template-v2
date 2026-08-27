import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Palette, SemanticColors, SurfaceColors, SurfaceDarkColors, Elevation, Typography } from './Palette';
import { tokens } from './Tokens';
import * as Icons from '../elements/icons/Icons';
import {
  PrimaryButton, OutlinedPrimaryButton, SecondaryButton,
  SuccessButton, DestructiveButton, WarningButton, InfoButton, LinkButton,
} from '../elements/buttons/Button';
import {
  PrimaryChip, SecondaryChip, SuccessChip, DestructiveChip, WarningChip, InfoChip,
} from '../elements/containers/Chip';
import { Card, CardElevation } from '../elements/containers/Card';
import { TextInput } from '../elements/forms/TextInput';
import { Autocomplete } from '../elements/forms/Autocomplete';
import { DatePicker } from '../elements/forms/DatePicker';
import { Toggle } from '../elements/buttons/Toggle';
import {
  H1, H2, H3, H4, H5, H6,
  Title, Subtitle, SubtitleSmall,
  Body, BodySmall, Caption, Overline,
} from '../elements/typography/TextElements';

const meta: Meta = {
  title: 'theme/Style Guide',
  parameters: { layout: 'padded' },
};
export default meta;

const th: React.CSSProperties = {
  padding: '8px 16px', fontWeight: 600, fontSize: 12, textAlign: 'left',
  background: '#f5f5f5', borderBottom: '2px solid #e0e0e0', whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
  padding: '8px 16px', fontSize: 12, borderBottom: '1px solid #eee', verticalAlign: 'middle',
};
const mono: React.CSSProperties = { fontFamily: 'monospace', color: '#c7254e' };

const Table = ({ headers, rows }: { headers: string[]; rows: React.ReactNode }) => (
  <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, marginBottom: 32 }}>
    <thead><tr>{headers.map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
    <tbody>{rows}</tbody>
  </table>
);

const Swatch = ({ color }: { color: string }) => (
  <div style={{ width: 32, height: 32, borderRadius: 4, background: color, border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0 }} />
);

const GuideSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 48 }}>
    <h2 style={{ fontFamily: 'sans-serif', borderBottom: '2px solid #e0e0e0', paddingBottom: 8, marginBottom: 24 }}>{title}</h2>
    {children}
  </div>
);

const SURFACE_PAIRS: [string, string][] = [
  ['surface', 'onSurface'],
  ['surfaceVariant', 'onSurfaceVariant'],
  ['primaryContainer', 'onPrimaryContainer'],
  ['secondaryContainer', 'onSecondaryContainer'],
  ['errorContainer', 'onErrorContainer'],
];

const SurfacePairs = ({ colors, prefix }: { colors: Record<string, string>; prefix: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
    {SURFACE_PAIRS.map(([bg, fg]) => {
      const bgVal = colors[bg];
      const fgVal = colors[fg];
      if (!bgVal || !fgVal) return null;
      return (
        <div key={bg} style={{ display: 'flex', alignItems: 'stretch', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.10)' }}>
          <div style={{ background: bgVal, color: fgVal, padding: '20px 24px', flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: 15 }}>Sample heading text</div>
              <div style={{ fontFamily: 'sans-serif', fontSize: 12, marginTop: 4 }}>Body copy rendered on this surface</div>
            </div>
          </div>
          <div style={{ background: '#f5f5f5', padding: '12px 20px', minWidth: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, borderLeft: '1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: bgVal, border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#c7254e' }}>{bg}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>{bgVal}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: fgVal, border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#c7254e' }}>{fg}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>{fgVal}</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#aaa', marginTop: 2 }}>--__SLUG__-{prefix}-{bg} / --__SLUG__-{prefix}-{fg}</div>
          </div>
        </div>
      );
    })}
  </div>
);

const StyleGuideDoc = () => (
  <div style={{ fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto' }}>
    <h1 style={{ fontFamily: 'sans-serif', marginBottom: 8 }}>__DISPLAY_NAME__ — Style Guide</h1>
    <p style={{ color: '#666', marginBottom: 48 }}>
      Single reference for design tokens, typography, and visual standards used across web and mobile platforms.
    </p>

    <GuideSection title="1. Color — Semantic">
      <p style={{ color: '#666', marginBottom: 16 }}>
        Semantic tokens map intent to color. Always use these in components — never raw palette values.
      </p>
      <Table
        headers={['Swatch', 'Token', 'CSS Variable', 'Value']}
        rows={Object.entries(SemanticColors).map(([name, value]) => (
          <tr key={name}>
            <td style={td}><Swatch color={value} /></td>
            <td style={td}><strong>{name}</strong></td>
            <td style={{ ...td, ...mono }}>{`--__SLUG__-Colors-${name}`}</td>
            <td style={{ ...td, ...mono }}>{value}</td>
          </tr>
        ))}
      />
    </GuideSection>

    <GuideSection title="2. Color — Surfaces">
      <p style={{ color: '#666', marginBottom: 24 }}>
        Surface tokens define backgrounds and their foreground (on-*) counterparts.
        Always pair a surface with its <code>on*</code> token for text and icons drawn on top of it.
      </p>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>Light</h3>
      <Table
        headers={['Swatch', 'Token', 'CSS Variable', 'Value']}
        rows={Object.entries(SurfaceColors).map(([name, value]) => (
          <tr key={name}>
            <td style={td}><Swatch color={value} /></td>
            <td style={td}><strong>{name}</strong></td>
            <td style={{ ...td, ...mono }}>{`--__SLUG__-Surfaces-${name}`}</td>
            <td style={{ ...td, ...mono }}>{value}</td>
          </tr>
        ))}
      />
      <SurfacePairs colors={SurfaceColors} prefix="Surfaces" />
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16, marginTop: 32 }}>Dark</h3>
      <div style={{ background: '#071a2e', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <Table
          headers={['Swatch', 'Token', 'CSS Variable', 'Value']}
          rows={Object.entries(SurfaceDarkColors).map(([name, value]) => (
            <tr key={name}>
              <td style={td}><Swatch color={value} /></td>
              <td style={td}><strong style={{ color: '#fff' }}>{name}</strong></td>
              <td style={{ ...td, ...mono }}>{`--__SLUG__-SurfacesDark-${name}`}</td>
              <td style={{ ...td, ...mono }}>{value}</td>
            </tr>
          ))}
        />
      </div>
      <SurfacePairs colors={SurfaceDarkColors} prefix="SurfacesDark" />
    </GuideSection>

    <GuideSection title="3. Color — Palette">
      <p style={{ color: '#666', marginBottom: 16 }}>
        Raw color scales. Use semantic or surface tokens in components; reach for palette values only when defining new tokens.
      </p>
      {Object.entries(Palette).map(([scaleName, scale]) => (
        <div key={scaleName} style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: 'sans-serif', textTransform: 'capitalize', marginBottom: 8 }}>{scaleName}</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(scale).map(([step, color]) => (
              <div key={step} style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 4, background: color as string, border: '1px solid rgba(0,0,0,0.1)' }} />
                <div style={{ fontSize: 10, marginTop: 4, color: '#666' }}>{step}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#c7254e' }}>{color as string}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </GuideSection>

    <GuideSection title="4. Elevation">
      <p style={{ color: '#666', marginBottom: 16 }}>
        Named shadow scale shared across web and mobile. Web uses <code>box-shadow</code>; mobile uses Flutter's numeric elevation.
      </p>
      <Table
        headers={['Preview', 'Token', 'CSS Variable', 'Flutter', 'Shadow']}
        rows={Object.entries(Elevation).map(([name, shadow], i) => {
          const flutter = [0, 2, 4, 8, 16][i];
          return (
            <tr key={name}>
              <td style={td}>
                <div style={{ width: 40, height: 40, borderRadius: 4, background: '#fff', boxShadow: shadow, border: '1px solid rgba(0,0,0,0.06)' }} />
              </td>
              <td style={td}><strong>{name}</strong></td>
              <td style={{ ...td, ...mono }}>{`--__SLUG__-Elevation-${name}`}</td>
              <td style={{ ...td, ...mono }}>{flutter}</td>
              <td style={{ ...td, ...mono, fontSize: 10, maxWidth: 280, whiteSpace: 'normal', wordBreak: 'break-all' }}>{shadow}</td>
            </tr>
          );
        })}
      />
    </GuideSection>

    <GuideSection title="5. Spacing">
      <p style={{ color: '#666', marginBottom: 16 }}>
        Base unit: <strong>{tokens.BaseMeasurements.spacing}px</strong>. All spacing values are multiples of this base.
        Use the <code>padding</code> / <code>margin</code> props on <code>Section</code> — they accept a multiplier.
      </p>
      <Table
        headers={['Preview', 'Multiplier', 'CSS Variable', 'Value']}
        rows={Array.from({ length: 20 }, (_, i) => i + 1).map(i => {
          const size = i * tokens.BaseMeasurements.spacing;
          return (
            <tr key={i}>
              <td style={{ ...td, width: 160 }}>
                <div style={{ width: size, height: 12, background: SemanticColors.primary, borderRadius: 2 }} />
              </td>
              <td style={{ ...td, ...mono }}>×{i}</td>
              <td style={{ ...td, ...mono }}>{`--__SLUG__-spacing-${i}`}</td>
              <td style={{ ...td, ...mono }}>{size}px</td>
            </tr>
          );
        })}
      />
    </GuideSection>

    <GuideSection title="6. Border Radius">
      <p style={{ color: '#666', marginBottom: 16 }}>
        Base unit: <strong>{tokens.BaseMeasurements.borderRadius}px</strong>.
      </p>
      <Table
        headers={['Preview', 'Multiplier', 'CSS Variable', 'Value']}
        rows={Array.from({ length: 10 }, (_, i) => i + 1).map(i => {
          const r = i * tokens.BaseMeasurements.borderRadius;
          return (
            <tr key={i}>
              <td style={td}>
                <div style={{ width: 48, height: 48, background: SemanticColors.primary, borderRadius: r }} />
              </td>
              <td style={{ ...td, ...mono }}>×{i}</td>
              <td style={{ ...td, ...mono }}>{`--__SLUG__-border-radius-${i}`}</td>
              <td style={{ ...td, ...mono }}>{r}px</td>
            </tr>
          );
        })}
      />
    </GuideSection>

    <GuideSection title="7. Typography">
      <p style={{ color: '#666', marginBottom: 16 }}>
        All text in the app must use these components. Do not use raw MUI <code>Typography</code> or HTML elements.
      </p>
      {(() => {
        const PROPS = ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'] as const;
        const PREVIEWS: [string, React.ReactNode][] = [
          ['H1', <H1>Heading 1</H1>],
          ['H2', <H2>Heading 2</H2>],
          ['H3', <H3>Heading 3</H3>],
          ['H4', <H4>Heading 4</H4>],
          ['H5', <H5>Heading 5</H5>],
          ['H6', <H6>Heading 6</H6>],
          ['Title', <Title>Title</Title>],
          ['Subtitle', <Subtitle>Subtitle</Subtitle>],
          ['SubtitleSmall', <SubtitleSmall>Subtitle Small</SubtitleSmall>],
          ['Body', <Body>The quick brown fox jumps over the lazy dog</Body>],
          ['BodySmall', <BodySmall>The quick brown fox jumps over the lazy dog</BodySmall>],
          ['Caption', <Caption>Caption text</Caption>],
          ['Overline', <Overline>Overline text</Overline>],
        ];
        return (
          <Table
            headers={['Preview', 'Component', 'Property', 'CSS Variable', 'Value']}
            rows={PREVIEWS.flatMap(([name, el]) => {
              const scale = Typography[name];
              return PROPS.map((prop, i) => (
                <tr key={`${name}-${prop}`} style={{ borderTop: i === 0 ? '2px solid #e0e0e0' : undefined }}>
                  {i === 0 && (
                    <td style={{ ...td, verticalAlign: 'middle', maxWidth: 260, overflow: 'hidden' }} rowSpan={PROPS.length}>
                      {el}
                    </td>
                  )}
                  {i === 0 && (
                    <td style={{ ...td, ...mono, verticalAlign: 'middle' }} rowSpan={PROPS.length}>
                      {`<${name}>`}
                    </td>
                  )}
                  <td style={{ ...td, ...mono, color: '#888' }}>{prop}</td>
                  <td style={{ ...td, ...mono, fontSize: 11 }}>{`--__SLUG__-Typography-${name}-${prop}`}</td>
                  <td style={{ ...td, ...mono }}>{String(scale?.[prop] ?? '')}</td>
                </tr>
              ));
            })}
          />
        );
      })()}
    </GuideSection>

    <GuideSection title="8. Buttons">
      <p style={{ color: '#666', marginBottom: 16 }}>
        Use named button components — never raw MUI <code>Button</code>. Each maps a <code>ThemeType</code> to a semantic color.
      </p>
      <Table
        headers={['Component', 'Contained', 'Outlined', 'Text']}
        rows={([
          ['PrimaryButton', PrimaryButton],
          ['SecondaryButton', SecondaryButton],
          ['SuccessButton', SuccessButton],
          ['DestructiveButton', DestructiveButton],
          ['WarningButton', WarningButton],
          ['InfoButton', InfoButton],
        ] as [string, React.ElementType][]).map(([name, Btn]) => (
          <tr key={name}>
            <td style={{ ...td, ...mono }}>{`<${name}>`}</td>
            <td style={td}><Btn size="small">{name.replace('Button', '')}</Btn></td>
            <td style={td}><Btn size="small" variant="outlined">{name.replace('Button', '')}</Btn></td>
            <td style={td}><Btn size="small" variant="text">{name.replace('Button', '')}</Btn></td>
          </tr>
        ))}
      />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
        <OutlinedPrimaryButton size="small">OutlinedPrimaryButton</OutlinedPrimaryButton>
        <LinkButton size="small">LinkButton</LinkButton>
      </div>
    </GuideSection>

    <GuideSection title="9. Chips">
      <p style={{ color: '#666', marginBottom: 16 }}>
        Chips share the same <code>ThemeType</code> as buttons. Use filled for status, outlined for filters.
      </p>
      <Table
        headers={['Component', 'Filled', 'Outlined']}
        rows={([
          ['PrimaryChip', PrimaryChip],
          ['SecondaryChip', SecondaryChip],
          ['SuccessChip', SuccessChip],
          ['DestructiveChip', DestructiveChip],
          ['WarningChip', WarningChip],
          ['InfoChip', InfoChip],
        ] as [string, React.ElementType][]).map(([name, ChipEl]) => (
          <tr key={name}>
            <td style={{ ...td, ...mono }}>{`<${name}>`}</td>
            <td style={td}><ChipEl label={name.replace('Chip', '')} size="small" /></td>
            <td style={td}><ChipEl label={name.replace('Chip', '')} size="small" variant="outlined" /></td>
          </tr>
        ))}
      />
    </GuideSection>

    <GuideSection title="10. Cards">
      <p style={{ color: '#666', marginBottom: 16 }}>
        Cards use the named elevation scale. Default elevation is <code>low</code>.
      </p>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        {(Object.keys(Elevation) as CardElevation[]).map((level) => (
          <Card key={level} elevation={level} sx={{ minWidth: 160 }}>
            <Body><strong>{level}</strong></Body>
            <BodySmall style={{ marginTop: 4 }}>elevation="{level}"</BodySmall>
          </Card>
        ))}
      </div>
    </GuideSection>

    <GuideSection title="11. Inputs">
      <p style={{ color: '#666', marginBottom: 24 }}>
        All form inputs wrap MUI components with a consistent <code>FormElementProps</code> interface supporting validation, error state, and controlled/uncontrolled usage.
      </p>
      <Table
        headers={['Component', 'Default', 'With label + helper', 'Error state', 'Disabled']}
        rows={[
          <tr key="text">
            <td style={{ ...td, ...mono }}>&lt;TextInput&gt;</td>
            <td style={td}><TextInput placeholder="Placeholder" /></td>
            <td style={td}><TextInput label="Label" helperText="Helper text" value="Some value" /></td>
            <td style={td}><TextInput label="Label" value="Bad value" error errorMessage="Required" touched /></td>
            <td style={td}><TextInput label="Label" disabled value="Disabled" /></td>
          </tr>,
          <tr key="multiline">
            <td style={{ ...td, ...mono }}>&lt;TextInput multiline&gt;</td>
            <td style={td} colSpan={3}><TextInput label="Notes" multiline rows={3} placeholder="Enter notes…" /></td>
            <td style={td}><TextInput label="Notes" multiline rows={3} disabled value="Disabled" /></td>
          </tr>,
          <tr key="autocomplete">
            <td style={{ ...td, ...mono }}>&lt;Autocomplete&gt;</td>
            <td style={td}><Autocomplete label="Pick one" options={[{label:'Option A',value:'a'},{label:'Option B',value:'b'},{label:'Option C',value:'c'}]} /></td>
            <td style={td}><Autocomplete label="Multi-select" multiple options={[{label:'Alpha',value:'a'},{label:'Beta',value:'b'},{label:'Gamma',value:'g'}]} value={[{label:'Alpha',value:'a'}]} /></td>
            <td style={td}><Autocomplete label="Error" options={[{label:'Option A',value:'a'}]} error errorMessage="Required" touched /></td>
            <td style={td}><Autocomplete label="Disabled" options={[{label:'Option A',value:'a'}]} disabled /></td>
          </tr>,
          <tr key="date">
            <td style={{ ...td, ...mono }}>&lt;DatePicker&gt;</td>
            <td style={td}><DatePicker label="Date" /></td>
            <td style={td}><DatePicker label="With value" value={null} /></td>
            <td style={td}><DatePicker label="Error" error errorMessage="Required" touched /></td>
            <td style={td}><DatePicker label="Disabled" disabled /></td>
          </tr>,
          <tr key="toggle">
            <td style={{ ...td, ...mono }}>&lt;Toggle&gt;</td>
            <td style={td}><Toggle label="Off" value={false} /></td>
            <td style={td}><Toggle label="On" value={true} helperText="Helper text" /></td>
            <td style={td}><Toggle label="Error" value={false} error errorMessage="Required" touched /></td>
            <td style={td}><Toggle label="Disabled" value={true} disabled /></td>
          </tr>,
        ]}
      />
    </GuideSection>

    <GuideSection title="12. Icons">
      <p style={{ color: '#666', marginBottom: 16 }}>
        All icons must be imported from <code>@__SLUG__/components</code> — never directly from <code>@mui/icons-material</code>.
        To add a new icon, export it from <code>src/elements/icons/Icons.tsx</code> first.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        {Object.keys(Icons).map((k) => {
          const Icon = (Icons as Record<string, React.ElementType>)[k];
          return (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 80 }}>
              <Icon sx={{ fontSize: 28 }} />
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#c7254e', textAlign: 'center', wordBreak: 'break-all' }}>{k}</div>
            </div>
          );
        })}
      </div>
    </GuideSection>

    <GuideSection title="13. Platform Notes">
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={th}>Token category</th>
            <th style={th}>Web</th>
            <th style={th}>Mobile</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Colors', 'CSS variables via getCssVariables()', 'SemanticColors, SurfaceColors, SurfaceDarkColors in palette.dart'],
            ['Elevation', 'box-shadow via --__SLUG__-Elevation-*', 'AppElevation.none / low / medium / high / overlay (numeric)'],
            ['Spacing', '--__SLUG__-spacing-N (N × 4px)', 'MUI theme spacing'],
            ['Border radius', '--__SLUG__-border-radius-N (N × 2px)', 'borderRadius constant in theme.dart'],
            ['Typography', '<H1>, <Body>, etc. from @__SLUG__/components', 'HeadlineLarge, BodyMedium, etc. from mobile/lib/components'],
            ['Icons', 'Re-exported from Icons.tsx in @__SLUG__/components', 'Flutter built-in Icons.* constants'],
          ] as [string, string, string][]).map(([cat, web, mob]) => (
            <tr key={cat}>
              <td style={{ ...td, fontWeight: 600 }}>{cat}</td>
              <td style={{ ...td, ...mono, fontSize: 11 }}>{web}</td>
              <td style={{ ...td, ...mono, fontSize: 11 }}>{mob}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </GuideSection>
  </div>
);

export const StyleGuide: StoryObj = {
  render: () => <StyleGuideDoc />,
  parameters: { layout: 'fullscreen' },
};
