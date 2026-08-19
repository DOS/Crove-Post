import { Plugs } from '@gitroom/frontend/components/plugs/plugs';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { getBrandNameServerSide } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${getBrandNameServerSide()} Plugs`,
  description: '',
};
export default async function Index() {
  return <Plugs />;
}
