'use client';

import i18next from './i18next';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseTranslationOptions } from 'react-i18next/index';
import { useVariables } from '../helpers/variable.context';
import { applyBrandToString } from '@gitroom/helpers/utils/brand.config';

export function useT(ns?: string, options?: UseTranslationOptions<any>) {
  const { t } = useTranslation(ns, options);
  const vars = useVariables();
  const brandName = vars?.brandConfig?.name || 'Postiz';

  return useCallback(
    ((...args: any[]) => {
      // @ts-ignore
      const translated = t(...args);
      if (typeof translated === 'string') {
        return applyBrandToString(translated, brandName);
      }
      return translated;
    }) as typeof t,
    [t, brandName]
  );
}

export function useTranslationSettings() {
  const [savedI18next, setSavedI18next] = useState(i18next);

  return savedI18next;
}
