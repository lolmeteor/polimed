'use client';

import React, { ReactNode, memo, useCallback, useMemo } from 'react';
import { processTypography } from '@/components/ui/typography';

interface TypographyProviderProps {
  children: ReactNode;
}

const TypographyProvider = memo(({ children }: TypographyProviderProps) => {
  return <>{children}</>;
});

TypographyProvider.displayName = 'TypographyProvider';

export default TypographyProvider; 