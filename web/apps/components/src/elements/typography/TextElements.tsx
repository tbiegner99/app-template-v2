/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Typography } from '@mui/material';
import type { TypographyProps } from '@mui/material';

type BaseProps = Omit<TypographyProps, 'variant' | 'component'>;

interface TextElementProps extends BaseProps {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  underline: boolean;
  overline: boolean;
  decorationColor: string;
  decorationStyle: string;
}

const TextElement: React.FC<TypographyProps & TextElementProps> = ({
  children,
  component,
  variant,
  bold,
  italic,
  strike,
  underline,
  overline,
  decorationColor,
  decorationStyle,
  ...props
}) => {
  let decoration = '';
  if (strike) {
    decoration += ' line-through';
  }
  if (underline) {
    decoration += ' underline';
  }
  if (overline) {
    decoration += ' overline';
  }
  if (!decoration) {
    decoration = 'none';
  }
  decoration += ` ${decorationStyle} ${decorationColor}`;
  return (
    <Typography
      {...props}
      style={{
        fontWeight: bold ? 'bold' : undefined,
        textDecoration: decoration,
        fontStyle: italic ? 'italic' : undefined,
      }}
      component={component}
      variant={variant}
    >
      {children}
    </Typography>
  );
};

export const H1: React.FC<React.PropsWithChildren<Partial<TextElementProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'h1'} component={'h1'}>
      {children}
    </TextElement>
  );
};

export const H2: React.FC<React.PropsWithChildren<Partial<TextElementProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'h2'} component={'h2'}>
      {children}
    </TextElement>
  );
};

export const H3: React.FC<React.PropsWithChildren<Partial<TextElementProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'h3'} component={'h3'}>
      {children}
    </TextElement>
  );
};

export const Title: React.FC<React.PropsWithChildren<Partial<TextElementProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'h5'} component={'h2'}>
      {children}
    </TextElement>
  );
};

export const H4: React.FC<React.PropsWithChildren<Partial<TextElementProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'h4'} component={'h4'}>
      {children}
    </TextElement>
  );
};

export const H5: React.FC<React.PropsWithChildren<Partial<TextElementProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'h5'} component={'h5'}>
      {children}
    </TextElement>
  );
};

export const H6: React.FC<React.PropsWithChildren<Partial<TextElementProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'h6'} component={'h6'}>
      {children}
    </TextElement>
  );
};

export const Subtitle: React.FC<React.PropsWithChildren<Partial<TextElementProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'subtitle1'} component={'h3'}>
      {children}
    </TextElement>
  );
};

export const SubtitleSmall: React.FC<React.PropsWithChildren<Partial<TextElementProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'subtitle2'} component={'span'}>
      {children}
    </TextElement>
  );
};

export const Body: React.FC<React.PropsWithChildren<Partial<TextElementProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'body1'} component={'p'}>
      {children}
    </TextElement>
  );
};

export const BodySmall: React.FC<React.PropsWithChildren<Partial<TextElementProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'body2'} component={'p'}>
      {children}
    </TextElement>
  );
};

export const Caption: React.FC<React.PropsWithChildren<Partial<TextElementProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'caption'} component={'span'}>
      {children}
    </TextElement>
  );
};

export const Overline: React.FC<React.PropsWithChildren<Partial<BaseProps>>> = ({
  children,
  ...props
}) => {
  const { variant: _v, component: _c, ...rest } = props as any;
  return (
    <TextElement {...rest} variant={'overline'} component={'span'}>
      {children}
    </TextElement>
  );
};
