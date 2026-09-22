'use client';

import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import Link from 'next/link';
import { Button } from '@gitroom/react/form/button';
import { Input } from '@gitroom/react/form/input';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { CreateOrgUserDto } from '@gitroom/nestjs-libraries/dtos/auth/create.org.user.dto';
import { GithubProvider } from '@gitroom/frontend/components/auth/providers/github.provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import clsx from 'clsx';
import { GoogleProvider } from '@gitroom/frontend/components/auth/providers/google.provider';
import { AppleProvider } from '@gitroom/frontend/components/auth/providers/apple.provider';
import { OauthProvider, DOS_OAUTH_RETRY_KEY } from '@gitroom/frontend/components/auth/providers/oauth.provider';
import { useFireEvents } from '@gitroom/helpers/utils/use.fire.events';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useTrack } from '@gitroom/react/helpers/use.track';
import { TrackEnum } from '@gitroom/nestjs-libraries/user/track.enum';
import { FarcasterProvider } from '@gitroom/frontend/components/auth/providers/farcaster.provider';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import useCookie from 'react-use-cookie';
type Inputs = {
  email: string;
  password: string;
  company: string;
  providerToken: string;
  provider: string;
};
export function Register() {
  const getQuery = useSearchParams();
  const fetch = useFetch();
  const [provider] = useState(getQuery?.get('provider')?.toUpperCase() || 'GENERIC');
  const [code, setCode] = useState(getQuery?.get('code') || '');
  const [state] = useState(getQuery?.get('state') || '');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<{
    status?: number;
    message: string;
  } | null>(null);
  useEffect(() => {
    if (code) {
      load();
    }
  }, []);
  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(
        `/auth/oauth/${provider?.toUpperCase() || 'GENERIC'}/exists`,
        {
          method: 'POST',
          body: JSON.stringify({
            code,
            state,
          }),
        }
      );
      if (!response.ok) {
        // The exchange failed server-side. Never masquerade this failure as
        // a fresh signup: surface it with a loop-guarded retry instead.
        setError({ status: response.status, message: '' });
        return;
      }
      const data = await response.json();
      if (data?.token) {
        window.sessionStorage.removeItem(DOS_OAUTH_RETRY_KEY);
        setCode(data.token);
        setShow(true);
      } else {
        window.sessionStorage.removeItem(DOS_OAUTH_RETRY_KEY);
        window.location.href = '/';
      }
    } catch (e) {
      console.error('Failed to verify oauth code:', e);
      setError({ message: (e as Error)?.message || '' });
    }
  }, [provider, code, state]);
  if (error) {
    return <AuthErrorState status={error.status} message={error.message} />;
  }
  if (!code && !getQuery?.get('provider')) {
    return <RegisterAfter token="" provider="LOCAL" />;
  }
  if (!show) {
    return <LoadingComponent />;
  }
  return (
    <RegisterAfter token={code} provider={provider?.toUpperCase() || 'LOCAL'} />
  );
}

// A failed OAuth exchange (state cookie mismatch, upstream token error, ...)
// used to fall through to the signup form, so a broken sign-in looked like a
// fresh registration - the exact confusion reported on 2026-09-21. This state
// shows what happened and offers a loop-guarded retry: up to RETRY_LIMIT
// automatic SSO restarts (a live id.dos.me session makes that one click),
// then a manual link so a persistent failure cannot ping-pong forever.
const RETRY_LIMIT = 2;

function AuthErrorState({
  status,
  message,
}: {
  status?: number;
  message: string;
}) {
  const t = useT();
  const fetch = useFetch();
  const attempts = Number(window.sessionStorage.getItem(DOS_OAUTH_RETRY_KEY) || '0');
  const retry = useCallback(async () => {
    try {
      window.sessionStorage.setItem(DOS_OAUTH_RETRY_KEY, String(attempts + 1));
      const response = await fetch('/auth/oauth/GENERIC');
      if (response.ok) {
        window.location.href = await response.text();
        return;
      }
    } catch (e) {
      console.error('Failed to restart the SSO flow:', e);
    }
    window.location.href = '/auth/login';
  }, [attempts]);
  return (
    <div className="flex flex-1 flex-col justify-center gap-[16px]">
      <h1 className="text-[40px] font-[500] -tracking-[0.8px] text-start">
        {t('sign_in_failed', 'Sign-in failed')}
      </h1>
      <p className="text-[14px] leading-relaxed text-zinc-400">
        {t(
          'sign_in_failed_body',
          'We could not complete your sign-in. This is usually temporary - try again below.'
        )}
        {status ? ` (HTTP ${status})` : ''}
      </p>
      {!!message && (
        <p className="text-[12px] break-all text-red-400">{message}</p>
      )}
      {attempts < RETRY_LIMIT ? (
        <Button type="button" onClick={retry} className="!h-[52px]">
          {t('try_again', 'Try again')}
        </Button>
      ) : (
        <Link
          href="/auth/login"
          className="flex h-[52px] cursor-pointer items-center justify-center rounded-[10px] border border-fifth text-[15px] font-semibold"
        >
          {t('try_again', 'Try again')}
        </Link>
      )}
      <p className="text-center text-sm">
        {t('already_have_an_account', 'Already Have An Account?')}&nbsp;
        <Link href="/auth/login" className="underline cursor-pointer">
          {t('sign_in', 'Sign In')}
        </Link>
      </p>
    </div>
  );
}
function getHelpfulReasonForRegistrationFailure(httpCode: number) {
  switch (httpCode) {
    case 400:
      return 'Email already exists';
    case 404:
      return 'Your browser got a 404 when trying to contact the API, the most likely reasons for this are the NEXT_PUBLIC_BACKEND_URL is set incorrectly, or the backend is not running.';
  }
  return 'Unhandled error: ' + httpCode;
}
export function RegisterAfter({
  token,
  provider,
}: {
  token: string;
  provider: string;
}) {
  const t = useT();
  const {
    isGeneral,
    genericOauth,
    neynarClientId,
    appleClientId,
    billingEnabled,
  } = useVariables();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const fireEvents = useFireEvents();
  const track = useTrack();
  const [datafast_visitor_id] = useCookie('datafast_visitor_id');
  const isAfterProvider = useMemo(() => {
    return !!token && !!provider;
  }, [token, provider]);
  const resolver = useMemo(() => {
    return classValidatorResolver(CreateOrgUserDto);
  }, []);
  const form = useForm<Inputs>({
    resolver,
    defaultValues: {
      providerToken: token,
      provider: provider,
    },
  });
  const fetchData = useFetch();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    await fetchData('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        datafast_visitor_id,
      }),
    })
      .then(async (response) => {
        setLoading(false);
        if (response.status === 200) {
          fireEvents('register');
          return track(TrackEnum.CompleteRegistration).then(() => {
            if (response.headers.get('activate') === 'true') {
              router.push('/auth/activate');
            } else {
              router.push('/auth/login');
            }
          });
        } else {
          form.setError('email', {
            message: await response.text(),
          });
        }
      })
      .catch((e) => {
        form.setError('email', {
          message:
            'General error: ' +
            e.toString() +
            '. Please check your browser console.',
        });
      });
  };
  return (
    <FormProvider {...form}>
      <form className="flex-1 flex" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col flex-1">
          <div>
            <h1 className="text-[40px] font-[500] -tracking-[0.8px] text-start cursor-pointer">
              {t('sign_up', 'Sign Up')}
            </h1>
          </div>
          <div className="text-[14px] mt-[32px] mb-[12px]">
            {t('continue_with', 'Continue With')}
          </div>
          <div className="flex flex-col text-[14px]">
            {!isAfterProvider && isGeneral && genericOauth ? (
              <div className="flex flex-col gap-4 mt-2">
                <OauthProvider autoStart />
                <p className="text-xs text-zinc-400 text-center mt-2 leading-relaxed">
                  {t(
                    'sso_description',
                    'Sign in or create your account seamlessly with DOS ID.'
                  )}
                </p>
                <div className="text-center mt-4">
                  <p className="text-sm">
                    {t('already_have_an_account', 'Already Have An Account?')}&nbsp;
                    <Link href="/auth/login" className="underline cursor-pointer">
                      {t('sign_in', 'Sign In')}
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <>
                {!isAfterProvider && (
                  <>
                    {!isGeneral ? (
                      <GithubProvider />
                    ) : (
                      <div className="gap-[8px] flex">
                        <GoogleProvider />
                        {!!appleClientId && <AppleProvider />}
                        {!!neynarClientId && <FarcasterProvider />}
                      </div>
                    )}
                    <div className="h-[20px] mb-[24px] mt-[24px] relative">
                      <div className="absolute w-full h-[1px] bg-fifth top-[50%] -translate-y-[50%]" />
                      <div
                        className={`absolute z-[1] justify-center items-center w-full start-0 -top-[4px] flex`}
                      >
                        <div className="px-[16px]">{t('or', 'or')}</div>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex flex-col gap-[12px]">
                  <div className="text-textColor">
                    {!isAfterProvider && (
                      <>
                        <Input
                          label="Email"
                          translationKey="label_email"
                          {...form.register('email')}
                          type="email"
                          placeholder={t('email_address', 'Email Address')}
                        />
                        <Input
                          label="Password"
                          translationKey="label_password"
                          {...form.register('password')}
                          autoComplete="off"
                          type="password"
                          placeholder={t('label_password', 'Password')}
                        />
                      </>
                    )}
                    <Input
                      label="Company"
                      translationKey="label_company"
                      {...form.register('company')}
                      autoComplete="off"
                      type="text"
                      placeholder={t('label_company', 'Company')}
                    />
                  </div>
                  <div className={clsx('text-[12px]')}>
                    {t(
                      'by_registering_you_agree_to_our',
                      'By registering you agree to our'
                    )}
                    &nbsp;
                    <a
                      href={`https://postiz.com/terms`}
                      className="underline hover:font-bold"
                      rel="nofollow"
                    >
                      {t('terms_of_service', 'Terms of Service')}
                    </a>
                    &nbsp;
                    {t('and', 'and')}&nbsp;
                    <a
                      href={`https://postiz.com/privacy`}
                      rel="nofollow"
                      className="underline hover:font-bold"
                    >
                      {t('privacy_policy', 'Privacy Policy')}
                    </a>
                    &nbsp;
                  </div>
                  <div className="text-center mt-6">
                    <div className="w-full flex">
                      <Button
                        type="submit"
                        className="flex-1 rounded-[10px] !h-[52px]"
                        loading={loading}
                      >
                        {t('create_account', 'Create Account')}
                      </Button>
                    </div>
                    <p className="mt-4 text-sm">
                      {t('already_have_an_account', 'Already Have An Account?')}
                      &nbsp;
                      <Link
                        href="/auth/login"
                        className="underline  cursor-pointer"
                      >
                        {t('sign_in', 'Sign In')}
                      </Link>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
