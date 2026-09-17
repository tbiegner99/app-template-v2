import { useLocation } from 'react-router-dom';
import { useCurrentSite } from '../../context/SiteContext';
import { useCurrentClient } from '../../context/ClientContext';
import { useUser } from '../../context/UserContext';
import { UserMenu } from '../UserMenu';
import {
  AccordionMenu,
  Autocomplete,
  Grid,
  GridItem,
  Language,
  LanguageSelector,
  MenuItem,
  MenuSection,
  DashboardIcon,
  PeopleIcon,
  SettingsIcon,
  SideMenu,
  TopBar,
  useI18n,
  BrandLogo,
} from '@__SLUG__/components';
import { RequireRoles } from '@__SLUG__/components';

export const DashboardOverview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { locale, setLocale, dictionary } = useI18n();
  const { site } = useCurrentSite();
  const { client } = useCurrentClient();
  const { roles } = useUser();
  const { pathname } = useLocation();
  const t = (key: string) => dictionary.translate(key);
  return (
    <Grid
      areas={['sidebar header', 'sidebar content', 'sidebar footer']}
      templateColumns={'240px 1fr'}
    >
      <GridItem area="sidebar">
        <SideMenu title={<BrandLogo />}>
          <MenuItem data-id="nav-dashboard" label={t('dashboard')} icon={<DashboardIcon />} href="/__SLUG__/control-center/secure/dashboard" active={pathname === '/secure/dashboard'} />
          <MenuItem data-id="nav-manage-users" label={t('controlCenter.manageUsers.title')} icon={<PeopleIcon />} href="/__SLUG__/control-center/secure/manage-users" active={pathname === '/secure/manage-users' || pathname === '/secure/add-user'} />
          <RequireRoles userRoles={roles.data ?? []} requiredRoles={['admin']}>
            <MenuSection title={t('controlCenter.nav.admin')}>
              <MenuItem label={t('controlCenter.nav.systemConfig')} icon={<SettingsIcon />} href="#/settings" />
              <MenuItem label={t('controlCenter.nav.clients')} icon={<SettingsIcon />} href="#/settings" />
              <MenuItem label={t('controlCenter.nav.sites')} icon={<SettingsIcon />} href="#/settings" />
              <MenuItem label={t('controlCenter.nav.users')} icon={<SettingsIcon />} href="#/settings" />
            </MenuSection>
          </RequireRoles>
          {client.hasValue() && (
            <MenuSection title={t('controlCenter.nav.client')}>
              <Autocomplete
                size="small"
                options={[
                  { label: 'site1', value: 'site1' },
                  { label: 'site2', value: 'site2' },
                  { label: 'site3', value: 'site3' },
                ]}
                placeholder={t('controlCenter.nav.selectClient')}
              />
              <MenuItem label={t('controlCenter.common.info')} icon={<SettingsIcon />} href="#/settings" />
              <AccordionMenu
                title={t('controlCenter.common.manage')}
                icon={<PeopleIcon />}
                items={[
                  { label: t('controlCenter.nav.contacts'), href: '#/users' },
                  { label: t('controlCenter.nav.users'), href: '#/users' },
                  { label: t('controlCenter.nav.equipment'), href: '#/teams' },
                  { label: t('controlCenter.nav.inspectionForms'), href: '#/teams' },
                  { label: t('controlCenter.nav.reports'), href: '#/teams' },
                  { label: t('controlCenter.nav.training'), href: '#/teams' },
                  { label: t('controlCenter.nav.jobs'), href: '#/teams' },
                ]}
              />
              <MenuItem label={t('controlCenter.common.configure')} icon={<SettingsIcon />} href="#/settings" />
            </MenuSection>
          )}
          {site.hasValue() && (
            <MenuSection title={t('controlCenter.nav.site')}>
              <Autocomplete
                size="small"
                options={[
                  { label: 'site1', value: 'site1' },
                  { label: 'site2', value: 'site2' },
                  { label: 'site3', value: 'site3' },
                ]}
                placeholder={t('controlCenter.nav.selectSite')}
              />
              <MenuItem label={t('controlCenter.common.info')} icon={<SettingsIcon />} href="#/settings" />
              <AccordionMenu
                title={t('controlCenter.common.manage')}
                icon={<PeopleIcon />}
                items={[
                  { label: t('controlCenter.nav.contacts'), href: '#/users' },
                  { label: t('controlCenter.nav.users'), href: '#/users' },
                  { label: t('controlCenter.nav.equipment'), href: '#/teams' },
                  { label: t('controlCenter.nav.inspectionForms'), href: '#/teams' },
                  { label: t('controlCenter.nav.reports'), href: '#/teams' },
                  { label: t('controlCenter.nav.training'), href: '#/teams' },
                  { label: t('controlCenter.nav.jobs'), href: '#/teams' },
                ]}
              />
              <AccordionMenu
                title={t('controlCenter.nav.cabinets')}
                icon={<PeopleIcon />}
                items={[
                  { label: t('controlCenter.nav.issues'), href: '#/users' },
                  { label: t('controlCenter.nav.inspections'), href: '#/teams' },
                  { label: t('controlCenter.nav.reports'), href: '#/teams' },
                  { label: t('controlCenter.nav.training'), href: '#/teams' },
                ]}
              />
              <AccordionMenu
                title={t('controlCenter.nav.analytics')}
                icon={<PeopleIcon />}
                items={[
                  { label: t('controlCenter.nav.issues'), href: '#/users' },
                  { label: t('controlCenter.nav.inspections'), href: '#/teams' },
                  { label: t('controlCenter.nav.reports'), href: '#/teams' },
                  { label: t('controlCenter.nav.training'), href: '#/teams' },
                ]}
              />
              <MenuItem label={t('controlCenter.common.configure')} icon={<SettingsIcon />} href="#/settings" />
            </MenuSection>
          )}
        </SideMenu>
      </GridItem>
      <GridItem area="header" style={{ position: 'sticky', top: 0, zIndex: 1100 }}>
        <TopBar
          sticky
          rightActions={[
            <LanguageSelector
              languages={[Language.EN, Language.ES]}
              value={locale.split('-')[0]}
              onChange={(code) => setLocale(code)}
            />,
            <UserMenu />,
          ]}
        />
      </GridItem>
      <GridItem area="content">{children}</GridItem>
    </Grid>
  );
};
