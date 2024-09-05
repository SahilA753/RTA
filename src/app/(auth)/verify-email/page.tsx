'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

const VerifyEmailPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full sm:w-[400px] space-y-6 flex flex-col items-center">
        <h1 className="text-2xl font-semibold">Email Verification</h1>
        <p className="text-center">"Please check your email for verification!"</p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
