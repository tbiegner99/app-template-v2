import { LoadingState } from '@__SLUG__/components';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export interface Client {
  id: string;
  name: string;
  // Add other client properties as needed
}

export interface ClientContextValue {
  client: LoadingState<Client | null>;
}

const ClientContext = createContext<ClientContextValue>({ client: LoadingState.unloaded() });

export const ClientContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<LoadingState<Client | null>>(LoadingState.unloaded());

  useEffect(() => {
    const fetchClientData = async () => {
      if (!clientId) {
        setClient(LoadingState.loaded(null));
        return;
      }

      try {
        setClient(LoadingState.loading());

        // TODO: Replace with actual API call
        // Placeholder for loading client from server
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

        // Placeholder response
        const clientData: Client = {
          id: clientId,
          name: `Client ${clientId}`,
        };

        setClient(LoadingState.loaded(clientData));
      } catch (err) {
        setClient(LoadingState.error(err as Error));
      }
    };

    fetchClientData();
  }, [clientId]);

  return <ClientContext.Provider value={{ client }}>{children}</ClientContext.Provider>;
};

export const useCurrentClient = (): ClientContextValue => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useCurrentClient must be used within a ClientContextProvider');
  }
  return context;
};
