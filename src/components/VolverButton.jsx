'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function VolverButton({ className = '', fallback = '/' }) {
  const router = useRouter();

  function handleBack() {
    router.push(fallback);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`mb-4 pl-2 pr-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${className}`}
    >
      <ChevronLeft className="inline mr-2" />
      Volver
    </button>
  );
}