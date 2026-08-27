import React from 'react';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  templateColumns?: string | number;
  templateRows?: string | number;
  gap?: number | string;
  rowGap?: number | string;
  columnGap?: number | string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  areas?: string[];
}

export const Grid: React.FC<GridProps> = ({
  children,
  templateColumns,
  templateRows,
  gap,
  rowGap,
  columnGap,
  alignItems,
  justifyItems,
  areas,
  style,
  ...rest
}) => {
  const gridTemplateColumns =
    typeof templateColumns === 'number' ? `repeat(${templateColumns}, 1fr)` : templateColumns;
  const gridTemplateRows =
    typeof templateRows === 'number' ? `repeat(${templateRows}, auto)` : templateRows;

  const gridTemplateAreas = areas ? areas.map((r) => `"${r}"`).join(' ') : undefined;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns,
        gridTemplateRows,
        gap,
        rowGap,
        columnGap,
        alignItems: alignItems,
        justifyItems: justifyItems,
        gridTemplateAreas,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  column?: string | number;
  columnStart?: number | string;
  columnEnd?: number | string;
  row?: string | number;
  rowStart?: number | string;
  rowEnd?: number | string;
  area?: string;
  justifySelf?: 'start' | 'center' | 'end' | 'stretch';
  alignSelf?: 'start' | 'center' | 'end' | 'stretch';
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  column,
  columnStart,
  columnEnd,
  row,
  rowStart,
  rowEnd,
  area,
  justifySelf,
  alignSelf,
  style,
  ...rest
}) => {
  const gridColumn = column
    ? typeof column === 'number'
      ? `${column} / ${column + 1}`
      : column
    : columnStart || columnEnd
    ? `${columnStart ?? 'auto'} / ${columnEnd ?? 'auto'}`
    : undefined;

  const gridRow = row
    ? typeof row === 'number'
      ? `${row} / ${row + 1}`
      : row
    : rowStart || rowEnd
    ? `${rowStart ?? 'auto'} / ${rowEnd ?? 'auto'}`
    : undefined;

  return (
    <div
      style={{
        gridColumn,
        gridRow,
        gridArea: area,
        justifySelf: justifySelf,
        alignSelf: alignSelf,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Grid;
