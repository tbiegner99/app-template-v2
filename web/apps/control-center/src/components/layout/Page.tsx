import { FlexColumn, FlexRow, Divider, useTheme, H2 } from '@__SLUG__/components';

interface PageProps {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  navigation?: React.ReactNode;
  children?: React.ReactNode;
}

export const Page: React.FC<PageProps> = ({ children, title, actions, navigation }: PageProps) => {
  const { getSpacing } = useTheme();
  return (
    <FlexColumn
      gap={getSpacing(2)}
      style={{
        margin: `${getSpacing(5)}px ${getSpacing(10)}px`,
      }}
    >
      <FlexRow justify="between" align="center">
        <H2>{title}</H2>
        <div>{actions}</div>
      </FlexRow>
      {navigation}
      <Divider />
      <div>{children}</div>
    </FlexColumn>
  );
};
