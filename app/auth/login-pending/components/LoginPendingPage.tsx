'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AuthForm } from '@/app/components/AuthForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPending() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const attemptId = searchParams.get('attempt_id') || '';
  const adminId = searchParams.get('admin_id') || '';

  
  const [timeLeft, setTimeLeft] = useState(300); 

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  useEffect(() => {
  if (timeLeft <= 0) {
    toast.error('Login attempt expired. Please try again.');
    router.push('/auth/login');
  }
}, [timeLeft, router]);

  return (
    <AuthForm
      title="Login Pending Approval"
      description="Your access request is under review"
    >
      <div className="space-y-6">
       
        <Alert className="bg-blue-50 border-blue-200">
          <Clock className="h-4 w-4 text-blue-800" />
          <AlertDescription className="text-blue-800 ml-2">
            Your login attempt is awaiting approval from a Super Admin.
          </AlertDescription>
        </Alert>

    
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Email Address</p>
            <p className="text-white font-medium text-sm mt-1">{email}</p>
          </div>
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Attempt ID</p>
            <p className="text-gray-300 font-mono text-xs mt-1 break-all">{attemptId}</p>
          </div>
        </div>

       
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 font-semibold text-sm mb-2">✓ What Happens Next:</p>
          <ul className="space-y-2 text-xs text-green-300">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Super Admin(s) will review your login request</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>You&apos;ll receive approval email with One-Time Password (OTP)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Use the OTP to complete your login</span>
            </li>
          </ul>
        </div>

        {/* Timer */}
        <div className="text-center p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
          <p className="text-gray-400 text-xs mb-2">Approval window expires in:</p>
          <p className="text-green-400 font-mono text-2xl font-bold">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
        </div>

        {/* Email Reminder */}
        <Alert className="bg-yellow-50 border-yellow-200">
          <Mail className="h-4 w-4 text-yellow-800" />
          <AlertDescription className="text-yellow-800 ml-2 text-xs">
            Check your email (including spam folder) for approval and OTP notifications.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-green-400 hover:bg-green-500 text-black font-bold"
          >
            Back to Login
          </Button>
          {/* <Button
            variant="outline"
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-900/50"
            onClick={() => {
              navigator.clipboard.writeText(attemptId);
              alert('Attempt ID copied to clipboard');
            }}
          >
            Copy Attempt ID
          </Button> */}
          <Button
  className="w-full bg-green-400 text-black font-bold"
  onClick={() =>
    router.push(
      `/auth/verify-otp?purpose=login_approved&admin_id=${adminId}&attempt_id=${attemptId}&email=${email}`
    )
  }
>
  I’ve Received My OTP
</Button>
        </div>

       
        <div className="text-center p-3 bg-gray-900/30 rounded text-xs text-gray-400">
          <p>Need help? Contact your Super Administrator</p>
          <p className="text-gray-500 mt-1">Attempt ID: {attemptId.slice(0, 12)}...</p>
        </div>
      </div>
    </AuthForm>
  );
}