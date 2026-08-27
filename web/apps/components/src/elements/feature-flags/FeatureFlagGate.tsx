import React from 'react';
import { useFeatureFlags } from './FeatureFlagProvider';

export interface FeatureFlagGateProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureFlagGate: React.FC<FeatureFlagGateProps> = ({ flag, children, fallback = null }) => {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag) ? <>{children}</> : <>{fallback}</>;
};
