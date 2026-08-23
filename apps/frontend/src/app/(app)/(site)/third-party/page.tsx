import { ThirdPartyComponent } from '@gitroom/frontend/components/third-parties/third-party.component';

export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { getBrandNameServerSide } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${getBrandNameServerSide()} Integrations`,
  description: '',
};
export default async function Index() {
  return <ThirdPartyComponent />;
}
