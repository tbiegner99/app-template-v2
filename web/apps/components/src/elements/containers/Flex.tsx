export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  grow?: boolean;
  shrink?: boolean;
  basis?: string | number;
  style?: React.CSSProperties;
}

const mapAlign = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};
const mapJustify = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export const FlexRow: React.FC<FlexProps> = ({
  children,
  gap,
  align,
  justify,
  wrap,
  grow,
  shrink,
  basis,
  style,
  ...rest
}: FlexProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      gap,
      alignItems: align ? mapAlign[align] : undefined,
      justifyContent: justify ? mapJustify[justify] : undefined,
      flexWrap: wrap ? 'wrap' : undefined,
      flexGrow: grow ? 1 : undefined,
      flexShrink: shrink ? 1 : undefined,
      flexBasis: basis,
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

export const FlexColumn: React.FC<FlexProps> = ({
  children,
  gap,
  align,
  justify,
  wrap,
  grow,
  shrink,
  basis,
  style,
  ...rest
}: FlexProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap,
      alignItems: align ? mapAlign[align] : undefined,
      justifyContent: justify ? mapJustify[justify] : undefined,
      flexWrap: wrap ? 'wrap' : undefined,
      flexGrow: grow ? 1 : undefined,
      flexShrink: shrink ? 1 : undefined,
      flexBasis: basis,
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);
