import i18next from './i18next';
import { fallbackLng } from './i18n.config';
import { applyBrandToString, getBrandConfig } from '@gitroom/helpers/utils/brand.config';

export async function getT(ns?: string, options?: any) {
  if (ns && !i18next.hasLoadedNamespace(ns)) {
    await i18next.loadNamespaces(ns);
  }
  const t = i18next.getFixedT(
    i18next.resolvedLanguage || fallbackLng,
    Array.isArray(ns) ? ns[0] : ns,
    options?.keyPrefix
  );
  const brandName = getBrandConfig().name;

  return (((...args: any[]) => {
    // @ts-ignore
    const res = t(...args);
    if (typeof res === 'string') {
      return applyBrandToString(res, brandName);
    }
    return res;
  }) as typeof t);
}
