'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../../../public/cypresslogo.svg';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Loader from '@/components/global/Loader';
import { z } from 'zod';
import { signupSchema } from '@/lib/types';


const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    try {
      signupSchema.parse(formData);
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setSubmitError(e.errors[0]?.message || "Invalid input");
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Send the signup request to the API
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email, password: formData.password }),
    });

    setIsLoading(false);

    if (response.ok) {
      // Redirect to the verification page
      router.push('/verify-email');
    } else {
      const data = await response.json();
      setSubmitError(data.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full sm:w-[400px] space-y-6 flex flex-col items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src={Logo} alt="cypress Logo" width={50} height={50} />
          <span className="font-semibold text-4xl dark:text-white">Kladbase</span>
        </Link>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          {submitError && (
            <p className="text-red-500 text-sm text-center">{submitError}</p>
          )}
          <Button type="submit" className="w-full p-6" size="lg" disabled={isLoading}>
            {isLoading ? <Loader/> : 'Sign Up'}
          </Button>
        </form>
        <p className="text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-primary">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
