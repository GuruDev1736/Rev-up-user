"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const AuthGuard = ({ children, redirectTo = '/', requireAuth = false, requireGuest = false }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/login');
      } else if (requireGuest && isAuthenticated) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, loading, router, redirectTo, requireAuth, requireGuest]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect
  }

  if (requireGuest && isAuthenticated) {
    return null; // Will redirect
  }

  return children;
};

export default AuthGuard;