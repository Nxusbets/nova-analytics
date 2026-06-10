import type { Metadata } from 'next';
import AskNovaPage from '@/features/ask-nova/components/ask-nova-page';

export const metadata: Metadata = {
  title: 'Ask Nova - AI Assistant'
};

export default function Page() {
  return <AskNovaPage />;
}
