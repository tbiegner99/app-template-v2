import React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import MuiIconButton, { IconButtonProps as MuiIconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export enum ThemeType {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Success = 'success',
  Destructive = 'destructive',
  Warning = 'warning',
  Info = 'info',
}

export interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  themeType?: ThemeType;
}

const colorMap: Record<ThemeType, MuiButtonProps['color']> = {
  [ThemeType.Primary]: 'primary',
  [ThemeType.Secondary]: 'secondary',
  [ThemeType.Tertiary]: 'inherit',
  [ThemeType.Success]: 'success',
  [ThemeType.Destructive]: 'error',
  [ThemeType.Warning]: 'warning',
  [ThemeType.Info]: 'info',
};

const Button: React.FC<ButtonProps> = ({
  themeType = ThemeType.Primary,
  variant = 'contained',
  ...props
}) => <MuiButton color={colorMap[themeType]} variant={variant} {...props} />;

export const PrimaryButton: React.FC<MuiButtonProps> = (props) => (
  <Button {...props} themeType={ThemeType.Primary} />
);

export const OutlinedPrimaryButton: React.FC<MuiButtonProps> = (props) => (
  <Button {...props} themeType={ThemeType.Primary} variant="outlined" />
);

export const SecondaryButton: React.FC<MuiButtonProps> = (props) => (
  <Button {...props} themeType={ThemeType.Secondary} />
);

export const SuccessButton: React.FC<MuiButtonProps> = (props) => (
  <Button {...props} themeType={ThemeType.Success} />
);

export const DestructiveButton: React.FC<MuiButtonProps> = (props) => (
  <Button {...props} themeType={ThemeType.Destructive} />
);

export const WarningButton: React.FC<MuiButtonProps> = (props) => (
  <Button {...props} themeType={ThemeType.Warning} />
);

export const InfoButton: React.FC<MuiButtonProps> = (props) => (
  <Button {...props} themeType={ThemeType.Info} />
);

export const LinkButton: React.FC<MuiButtonProps> = (props) => (
  <Button themeType={ThemeType.Primary} {...props} variant="text" />
);

export interface IconButtonProps extends MuiIconButtonProps {
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ tooltip, children, ...props }) => {
  const btn = <MuiIconButton {...props}>{children}</MuiIconButton>;
  return tooltip ? <Tooltip title={tooltip}>{btn}</Tooltip> : btn;
};
