import { useState } from 'react';
import {
  H1, H2, H3, H4, H5, H6,
  Body, BodySmall, Caption, Overline,
  useTheme, FlexRow, FlexColumn,
  PrimaryButton, SecondaryButton, SuccessButton,
  DestructiveButton, InfoButton, WarningButton, LinkButton,
  TranslatedText, Breadcrumbs, Card,
  PrimaryChip, SuccessChip, InfoChip, WarningChip,
  Tabs, type TabItem,
  SignaturePad, FilePicker,
  AlertBadge, AlertPanel, type Alert,
  RequireRoles, UserMenu,
  FeatureFlagProvider, FeatureFlagGate,
  useI18n,
} from '@__SLUG__/components';
import styles from './Home.module.css';
import { Page } from '../components/layout/Page';
import { useUser } from '../context/UserContext';

function Home() {
  const { getSpacing } = useTheme();
  const { dictionary } = useI18n();
  const { user, roles } = useUser();
  const t = (key: string) => dictionary.translate(key);

  const DEMO_TABS: TabItem[] = [
    { key: 'overview', label: t('controlCenter.home.tabOverview'), content: <Body><TranslatedText i18nKey="controlCenter.home.tabOverviewContent" /></Body> },
    { key: 'details', label: t('controlCenter.home.tabDetails'), content: <Body><TranslatedText i18nKey="controlCenter.home.tabDetailsContent" /></Body> },
    { key: 'history', label: t('controlCenter.home.tabHistory'), content: <Body><TranslatedText i18nKey="controlCenter.home.tabHistoryContent" /></Body> },
  ];

  const DEMO_ALERTS: Alert[] = [
    { id: '1', title: 'Gas leak detected', body: 'Section B, Level 3 — immediate evacuation required', route: '/alerts/1' },
    { id: '2', title: 'Equipment overdue', body: 'Drill #4 inspection overdue by 2 days' },
  ];

  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [showAlertPanel, setShowAlertPanel] = useState(false);

  if (!user.isLoaded()) return null;

  const dismiss = (id: string) => setAlerts((a) => a.filter((x) => x.id !== id));

  return (
    <FeatureFlagProvider flags={{ 'demo-feature': true, 'disabled-feature': false }}>
      <Page
        title={<TranslatedText i18nKey="welcome" params={{ name: user.value.email }} />}
        navigation={<Breadcrumbs items={[{ label: t('dashboard') }, { label: t('controlCenter.nav.home') }]} />}
        actions={
          <AlertBadge count={alerts.length}>
            <SecondaryButton data-id="alerts-button" onClick={() => setShowAlertPanel((v) => !v)}>
              <TranslatedText i18nKey="controlCenter.home.alerts" />
            </SecondaryButton>
          </AlertBadge>
        }
      >
        <FlexColumn>
          {showAlertPanel && (
            <AlertPanel
              alerts={alerts}
              onDismiss={dismiss}
              onDismissAll={() => setAlerts([])}
            />
          )}

          <Card className={styles.card}>
            <H2><TranslatedText i18nKey="controlCenter.home.typography" /></H2>
            <FlexColumn gap={getSpacing(2)}>
              <H1>Header 1</H1>
              <H2>Header 2</H2>
              <H3>Header 3</H3>
              <H4>Header 4</H4>
              <H5>Header 5</H5>
              <H6>Header 6</H6>
              <Body>Body Text</Body>
              <BodySmall>Body Small Text</BodySmall>
              <Caption>Caption Text</Caption>
              <Overline>Overline Text</Overline>
            </FlexColumn>
          </Card>

          <Card className={styles.card}>
            <H2><TranslatedText i18nKey="controlCenter.home.buttons" /></H2>
            <FlexRow gap={getSpacing(2)} style={{ flexWrap: 'wrap' }}>
              <PrimaryButton data-id="primary-btn">Primary</PrimaryButton>
              <PrimaryButton variant="outlined" data-id="outlined-btn">Outlined</PrimaryButton>
              <SecondaryButton data-id="secondary-btn">Secondary</SecondaryButton>
              <SuccessButton data-id="success-btn">Success</SuccessButton>
              <DestructiveButton data-id="destructive-btn">Destructive</DestructiveButton>
              <InfoButton data-id="info-btn">Info</InfoButton>
              <WarningButton data-id="warning-btn">Warning</WarningButton>
              <LinkButton data-id="link-btn">Link</LinkButton>
            </FlexRow>
          </Card>

          <Card className={styles.card}>
            <H2><TranslatedText i18nKey="controlCenter.home.chipsAndTabs" /></H2>
            <FlexColumn gap={getSpacing(3)}>
              <FlexRow gap={getSpacing(2)}>
                <SuccessChip label={t('controlCenter.common.active')} />
                <WarningChip label="Warning" />
                <PrimaryChip label="Primary" />
                <InfoChip label={t('controlCenter.common.info')} />
              </FlexRow>
              <Tabs items={DEMO_TABS} value={activeTab} onChange={setActiveTab} />
            </FlexColumn>
          </Card>

          <Card className={styles.card}>
            <H2><TranslatedText i18nKey="controlCenter.home.forms" /></H2>
            <FlexRow gap={getSpacing(6)} style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <SignaturePad label="Signature" onAccept={(d: string | null) => console.log('sig:', d ? 'signed' : 'empty')} />
              <FilePicker label="Upload Photo" accept={['image']} onFilePicked={(f: File) => console.log('picked:', f.name)} />
              <FilePicker label="Upload PDF or Doc" accept={['pdf', 'document']} onFilePicked={(f: File) => console.log('picked:', f.name)} />
            </FlexRow>
          </Card>

          <Card className={styles.card}>
            <H2><TranslatedText i18nKey="controlCenter.home.accessControl" /></H2>
            <FlexColumn gap={getSpacing(3)}>
              <RequireRoles
                userRoles={roles.data ?? []}
                requiredRoles={['admin']}
                accessDeniedComponent={<Body><TranslatedText i18nKey="controlCenter.home.accessDenied" /></Body>}
              >
                <Body><TranslatedText i18nKey="controlCenter.home.adminOnlyContent" /></Body>
              </RequireRoles>
              <UserMenu
                displayName={user.value.displayName}
                email={user.value.email}
                onSignOut={() => console.log('sign out')}
              />
            </FlexColumn>
          </Card>

          <Card className={styles.card}>
            <H2><TranslatedText i18nKey="controlCenter.home.featureFlags" /></H2>
            <FlexColumn gap={getSpacing(2)}>
              <FeatureFlagGate flag="demo-feature" fallback={<Body><TranslatedText i18nKey="controlCenter.home.demoFeatureOff" /></Body>}>
                <Body><TranslatedText i18nKey="controlCenter.home.demoFeatureOn" /></Body>
              </FeatureFlagGate>
              <FeatureFlagGate flag="disabled-feature" fallback={<Body><TranslatedText i18nKey="controlCenter.home.disabledFeatureOff" /></Body>}>
                <Body><TranslatedText i18nKey="controlCenter.home.disabledFeatureOn" /></Body>
              </FeatureFlagGate>
            </FlexColumn>
          </Card>
        </FlexColumn>
      </Page>
    </FeatureFlagProvider>
  );
}

export default Home;
