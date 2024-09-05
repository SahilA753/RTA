'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../../../public/cypresslogo.svg';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Loader from '@/components/global/Loader';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { loginSchema } from '@/lib/types';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
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

    const result = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);

    if (result?.error) {
      setSubmitError('Invalid email or password.');
    } else {
      router.replace('/dashboard'); // Replace with your post-login redirect
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full sm:w-[400px] space-y-6 flex flex-col items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src={Logo} alt="cypress Logo" width={50} height={50} />
          <span className="font-semibold text-4xl dark:text-white">Kladbase</span>
        </Link>
        <p className="text-foreground/60 text-center">
          An all-In-One Collaboration and Productivity Platform
        </p>
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
          {submitError && (
            <p className="text-red-500 text-sm text-center">{submitError}</p>
          )}
          <Button type="submit" className="w-full p-6" size="lg" disabled={isLoading}>
            {isLoading ? <Loader/> : 'Login'}
          </Button>
        </form>
        <p className="text-center">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
