'use client';

import { Suspense } from 'react';
import InstallmentsPage from './InstallmentContent';


export default function InstallmentsMainPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading installments...</div>
      </div>
    }>
      <InstallmentsPage />
    </Suspense>
  );
}