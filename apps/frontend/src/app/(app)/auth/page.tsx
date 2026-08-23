import { internalFetch } from '@gitroom/helpers/utils/internal.fetch';
export const dynamic = 'force-dynamic';
import { Register } from '@gitroom/frontend/components/auth/register';
import { Metadata } from 'next';
import { getBrandNameServerSide } from '@gitroom/helpers/utils/is.general.server.side';

export const metadata: Metadata = {
  title: `${getBrandNameServerSide()} Register`,
  description: '',
};

export default async function Auth(params: {searchParams: Promise<{provider: string}>}) {
  return <Register />;
}
