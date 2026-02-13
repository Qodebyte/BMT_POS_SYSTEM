'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DecodedToken {
  admin_id: string;
  email: string;
  role?: string;
  verified?: boolean;
  reset?: boolean;
  iat?: number;
  exp?: number;
  full_name?: string;
  username?: string;
}

export function useAuthCheck() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
      
        const token = localStorage.getItem('adminToken');

      
        if (!token || !token.trim()) {
          router.push('/auth/login');
          return;
        }

      
        const parts = token.trim().split('.');
        if (parts.length !== 3) {
          console.warn('Invalid token format - missing parts');
          throw new Error('Invalid token format');
        }

        let decoded: DecodedToken;
        try {
          const payload = parts[1];
        
          const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
          const decoded_str = atob(padded);
          decoded = JSON.parse(decoded_str);
        } catch (e) {
          console.warn('Failed to decode token payload', e);
          throw new Error('Failed to decode token');
        }

      
        if (decoded.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          if (decoded.exp < currentTime) {
            console.warn('Token expired at:', new Date(decoded.exp * 1000));
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminDetail');
            router.push('/auth/login');
            return;
          }
        }

    
        localStorage.setItem('adminDetail', JSON.stringify(decoded));
        console.log('Auth check passed, admin detail saved');

      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminDetail');
        router.push('/auth/login');
      }
    };

    checkAuth();

   
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, [router]);
}