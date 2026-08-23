import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getBrandNameServerSide } from '@gitroom/helpers/utils/is.general.server.side';

export const metadata: Metadata = {
  title: `${getBrandNameServerSide()} - Agent`,
  description: '',
};

export default async function Page() {
  return redirect('/agents/new');
}
