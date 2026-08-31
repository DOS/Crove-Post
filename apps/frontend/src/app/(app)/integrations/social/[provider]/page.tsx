import { ContinueIntegration } from '@gitroom/frontend/components/launches/continue.integration';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function Page(
  props: {
    params: Promise<{
      provider: string;
    }>;
    searchParams: Promise<any>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const {
    provider
  } = params;

  const cookieStore = await cookies();
  const get = cookieStore.get('__Host-crove-auth') || cookieStore.get('auth');
  return <ContinueIntegration searchParams={searchParams} provider={provider} logged={!!get?.name} />;
}
