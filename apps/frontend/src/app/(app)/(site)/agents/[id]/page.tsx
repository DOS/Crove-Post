import { Metadata } from 'next';
import { AgentChat } from '@gitroom/frontend/components/agents/agent.chat';
import { getBrandNameServerSide } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${getBrandNameServerSide()} - Agent`,
  description: '',
};
export default async function Page() {
  return (
    <AgentChat />
  );
}
