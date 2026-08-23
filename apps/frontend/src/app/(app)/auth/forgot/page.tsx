export const dynamic = 'force-dynamic';
import { Forgot } from '@gitroom/frontend/components/auth/forgot';
import { Metadata } from 'next';
import { getBrandNameServerSide } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${getBrandNameServerSide()} Forgot Password`,
  description: '',
};
export default async function Auth() {
  return <Forgot />;
}
