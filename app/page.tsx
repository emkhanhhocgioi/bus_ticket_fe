import { redirect } from 'next/navigation';

export default function RootPage() {
  // Auto redirect to order page
  redirect('/order');
}
