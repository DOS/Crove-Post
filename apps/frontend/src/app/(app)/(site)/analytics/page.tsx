export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { PlatformAnalytics } from '@gitroom/frontend/components/platform-analytics/platform.analytics';
import { getBrandNameServerSide } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${getBrandNameServerSide()} Analytics`,
  description: '',
};
export default async function Index() {
  return <PlatformAnalytics />;
}
