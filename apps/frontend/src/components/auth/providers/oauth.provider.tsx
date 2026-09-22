'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import SafeImage from '@gitroom/react/helpers/safe.image';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

// Session key shared with the auth error state (register.tsx): a freshly
// initiated SSO flow resets the error-page retry budget.
export const DOS_OAUTH_RETRY_KEY = 'dos_oauth_retry_count';

export const OauthProvider = ({ autoStart = false }: { autoStart?: boolean }) => {
  const fetch = useFetch();
  const { oauthLogoUrl, oauthDisplayName } = useVariables();
  const t = useT();
  const [autoFailed, setAutoFailed] = useState(false);
  const startedRef = useRef(false);

  const gotoLogin = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/auth/oauth/GENERIC');
      if (!response.ok) {
        throw new Error(
          `Login link request failed with status ${response.status}`
        );
      }
      const link = await response.text();
      // A deliberately initiated SSO flow starts fresh: clear the error-page
      // retry budget so the user gets their full retry allowance.
      window.sessionStorage.removeItem(DOS_OAUTH_RETRY_KEY);
      window.location.href = link;
      return true;
    } catch (error) {
      console.error('Failed to get generic oauth login link:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!autoStart || startedRef.current) return;
    startedRef.current = true;
    gotoLogin().then((ok) => {
      if (!ok) {
        // Auto-start could not even fetch the link - fall back to the
        // manual button instead of a dead redirecting state.
        setAutoFailed(true);
      }
    });
  }, [autoStart, gotoLogin]);

  if (autoStart && !autoFailed) {
    return (
      <div
        className={`flex w-full items-center justify-center gap-[10px] rounded-[10px] bg-white text-zinc-900 h-[50px] font-semibold text-[15px] shadow-md`}
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
          {t('redirecting_to', 'Redirecting to')}&nbsp;
          {oauthDisplayName || 'DOS ID'}...
        </div>
      </div>
    );
  }

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
