import { getT } from '@gitroom/react/translation/get.translation.service.backend';

export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import loadDynamic from 'next/dynamic';
import { TestimonialComponent } from '@gitroom/frontend/components/auth/testimonial.component';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
import { getBrandNameServerSide } from '@gitroom/helpers/utils/is.general.server.side';
import { LanguageComponent } from '@gitroom/frontend/components/layout/language.component';

const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getT();
  const brandName = getBrandNameServerSide();

  return (
    <div className="bg-[#0E0E0E] flex flex-1 p-[12px] gap-[12px] min-h-screen w-screen text-white relative">
      <div className="absolute top-4 right-4 z-50">
        <LanguageComponent />
      </div>
      <ReturnUrlComponent />
      <div className="flex flex-col py-[40px] px-[20px] flex-1 lg:w-[600px] lg:flex-none rounded-[12px] text-white p-[12px] bg-[#1A1919]">
        <div className="w-full max-w-[440px] mx-auto justify-center gap-[20px] h-full flex flex-col text-white">
          <LogoTextComponent />
          <div className="flex">{children}</div>
        </div>
      </div>
      <div className="text-[36px] flex-1 pt-[88px] hidden lg:flex flex-col items-center">
        <div className="text-center">
          {t('auth_social_proof_prefix', 'Over')}{' '}
          <span className="text-[42px] text-[#FC69FF]">20,000+</span>{' '}
          {t('auth_social_proof_middle', 'Entrepreneurs use')}
          <br />
          {brandName} {t('auth_social_proof_suffix', 'To Grow Their Social Presence')}
        </div>
        <TestimonialComponent />
      </div>
    </div>
  );
}
