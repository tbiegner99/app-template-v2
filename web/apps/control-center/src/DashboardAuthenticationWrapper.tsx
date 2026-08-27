import { SessionAuth } from 'supertokens-auth-react/recipe/session';
import { ClientContextProvider } from './context/ClientContext';
import { SiteContextProvider } from './context/SiteContext';
import { DashboardOverview } from './components/layout/DashboardOverview';

export function DashboardAuthenticationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClientContextProvider>
      <SiteContextProvider>
        <SessionAuth>
          <DashboardOverview>{children}</DashboardOverview>
        </SessionAuth>
      </SiteContextProvider>
    </ClientContextProvider>
  );
}
