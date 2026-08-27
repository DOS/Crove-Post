'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';

export default function TicketAuthPage() {
  const searchParams = useSearchParams();
  const fetch = useFetch();
  const [error, setError] = useState('');

  const ticket = searchParams.get('ticket');
  const redirectTo = searchParams.get('redirect_to') || '/';

  useEffect(() => {
    if (!ticket) {
      setError('Missing ticket parameter');
      return;
    }

    fetch('/v1/ticket/consume', {
      method: 'POST',
      body: JSON.stringify({
        ticket,
        redirect_to: redirectTo,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          window.location.href = data.redirect_to || redirectTo;
        } else {
          setError(data.message || 'Invalid or expired ticket');
        }
      })
      .catch((err) => {
        setError('Failed to consume authentication ticket');
      });
  }, [ticket, redirectTo]);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-white">
        <div className="bg-third p-8 rounded-xl border border-tableBorder text-center max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-2">Authentication Error</h2>
          <p className="text-gray-300 text-sm mb-4">{error}</p>
          <a
            href="/auth/login"
            className="inline-block bg-btnPrimary px-4 py-2 rounded-lg text-sm font-medium"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <LoadingComponent />;
}
