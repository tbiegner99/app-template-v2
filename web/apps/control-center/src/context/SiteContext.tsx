import { LoadingState } from '@__SLUG__/components';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export interface Site {
  id: string;
  name: string;
  // Add other site properties as needed
}

export interface SiteContextValue {
  site: LoadingState<Site | null>;
}

const SiteContext = createContext<SiteContextValue>({ site: LoadingState.unloaded() });

export const SiteContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { siteId } = useParams<{ siteId: string }>();
  const [site, setSite] = useState<LoadingState<Site | null>>(LoadingState.unloaded());

  useEffect(() => {
    const fetchSiteData = async () => {
      if (!siteId) {
        setSite(LoadingState.loaded(null));
        return;
      }

      try {
        setSite(LoadingState.loading());

        // TODO: Replace with actual API call
        // Placeholder for loading site from server
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

        // Placeholder response
        const siteData: Site = {
          id: siteId,
          name: `Site ${siteId}`,
        };

        setSite(LoadingState.loaded(siteData));
      } catch (err) {
        setSite(LoadingState.error(err as Error));
      }
    };

    fetchSiteData();
  }, [siteId]);

  return <SiteContext.Provider value={{ site }}>{children}</SiteContext.Provider>;
};

export const useCurrentSite = (): SiteContextValue => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useCurrentSite must be used within a SiteContextProvider');
  }
  return context;
};
