'use client';

import { useCallback } from 'react';
import SafeImage from '@gitroom/react/helpers/safe.image';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
export const OauthProvider = () => {
  const fetch = useFetch();
  const { oauthLogoUrl, oauthDisplayName } = useVariables();
  const t = useT();
  const gotoLogin = useCallback(async () => {
    try {
      const response = await fetch('/auth/oauth/GENERIC');
      if (!response.ok) {
        throw new Error(
          `Login link request failed with status ${response.status}`
        );
      }
      const link = await response.text();
      window.location.href = link;
    } catch (error) {
      console.error('Failed to get generic oauth login link:', error);
    }
  }, []);
  return (
    <div
      onClick={gotoLogin}
      className={`cursor-pointer w-full bg-white hover:bg-zinc-100 transition-all duration-200 h-[50px] rounded-[10px] flex justify-center items-center text-zinc-900 font-semibold text-[15px] gap-[10px] shadow-md hover:shadow-lg active:scale-[0.99]`}
    >
      <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
        <SafeImage
          src={oauthLogoUrl || '/icons/generic-oauth.svg'}
          alt="DOS ID"
          width={24}
          height={24}
          className="w-[24px] h-[24px] object-contain"
        />
      </div>
      <div>
        {t('sign_in_with', 'Sign in with')}&nbsp;
        {oauthDisplayName || 'DOS ID'}
      </div>
    </div>
  );
};
