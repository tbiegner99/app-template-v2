import MuiChip, { ChipProps as MuiChipProps } from '@mui/material/Chip';
import { ThemeType } from '../buttons/Button';

export interface ChipProps extends Omit<MuiChipProps, 'color' | 'variant'> {
  themeType?: ThemeType;
  variant?: 'filled' | 'outlined';
}

const colorMap: Record<ThemeType, MuiChipProps['color']> = {
  [ThemeType.Primary]: 'primary',
  [ThemeType.Secondary]: 'secondary',
  [ThemeType.Tertiary]: 'default',
  [ThemeType.Success]: 'success',
  [ThemeType.Destructive]: 'error',
  [ThemeType.Warning]: 'warning',
  [ThemeType.Info]: 'info',
};

const Chip: React.FC<ChipProps> = ({
  themeType = ThemeType.Primary,
  variant = 'filled',
  ...props
}: ChipProps) => <MuiChip color={colorMap[themeType]} variant={variant} {...props} />;

export const PrimaryChip: React.FC<Omit<ChipProps, 'themeType'>> = (props) => (
  <Chip variant="filled" {...props} themeType={ThemeType.Primary} />
);

export const SecondaryChip: React.FC<Omit<ChipProps, 'themeType'>> = (props) => (
  <Chip variant="filled" {...props} themeType={ThemeType.Secondary} />
);

export const SuccessChip: React.FC<Omit<ChipProps, 'themeType'>> = (props) => (
  <Chip variant="filled" {...props} themeType={ThemeType.Success} />
);

export const DestructiveChip: React.FC<Omit<ChipProps, 'themeType'>> = (props) => (
  <Chip variant="filled" {...props} themeType={ThemeType.Destructive} />
);

export const WarningChip: React.FC<Omit<ChipProps, 'themeType'>> = (props) => (
  <Chip variant="filled" {...props} themeType={ThemeType.Warning} />
);

export const InfoChip: React.FC<Omit<ChipProps, 'themeType'>> = (props) => (
  <Chip variant="filled" {...props} themeType={ThemeType.Info} />
);
