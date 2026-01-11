"use client";
import React from 'react';
import ErrorFallback from '@/components/shared/ErrorFallback';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorFallback error={error} reset={reset} />;
}
