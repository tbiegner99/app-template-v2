import React from 'react';
import MUIBreadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { Body } from '../typography';

export interface Crumb {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  separator?: React.ReactNode;
  maxItems?: number;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, separator, maxItems }) => {
  if (!items || items.length === 0) return null;

  return (
    <MUIBreadcrumbs separator={separator} maxItems={maxItems} aria-label="breadcrumb">
      {items.map((it, idx) => {
        const isLast = idx === items.length - 1;
        if (isLast || (!it.href && !it.onClick)) {
          return (
            <Body key={idx} color={isLast ? 'text.primary' : 'inherit'}>
              {it.label}
            </Body>
          );
        }
        return (
          <Link key={idx} color="inherit" href={it.href} onClick={it.onClick} underline="hover">
            {it.label}
          </Link>
        );
      })}
    </MUIBreadcrumbs>
  );
};

export default Breadcrumbs;
