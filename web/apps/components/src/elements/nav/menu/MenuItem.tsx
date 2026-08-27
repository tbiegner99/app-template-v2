import React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';

export interface MenuItemProps {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  active?: boolean;
  dense?: boolean;
  sx?: SxProps<Theme>;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  label,
  href,
  onClick,
  icon,
  badge,
  active,
  sx,
}) => {
  const componentProps: any = href ? { component: 'a', href } : {};

  return (
    <ListItemButton
      onClick={onClick}
      selected={!!active}
      dense
      sx={(theme) => ({
        px: 2,
        color: theme.palette.secondary.main,
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
        '&.Mui-selected': {
          backgroundColor: 'rgba(255,255,255,0.12)',
          color: theme.palette.secondary.light,
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
        },
        ...((sx as any) || {}),
      })}
      {...componentProps}
    >
      <ListItemIcon sx={(theme) => ({ minWidth: 40, color: 'inherit' })}>
        {icon ? badge ? <Badge badgeContent={badge}>{icon}</Badge> : icon : null}
      </ListItemIcon>
      <ListItemText primary={label} primaryTypographyProps={{ variant: 'body2' }} />
    </ListItemButton>
  );
};

export default MenuItem;
