import React, { createContext, useContext, useState } from 'react';

interface FeatureFlagContextValue {
  isEnabled: (flag: string) => boolean;
  setFlag: (flag: string, enabled: boolean) => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

export interface FeatureFlagProviderProps {
  flags?: Record<string, boolean>;
  children: React.ReactNode;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ flags: initial = {}, children }) => {
  const [flags, setFlags] = useState<Record<string, boolean>>(initial);

  const isEnabled = (flag: string) => flags[flag] ?? false;
  const setFlag = (flag: string, enabled: boolean) =>
    setFlags((prev) => ({ ...prev, [flag]: enabled }));

  return (
    <FeatureFlagContext.Provider value={{ isEnabled, setFlag }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = (): FeatureFlagContextValue => {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  return ctx;
};
