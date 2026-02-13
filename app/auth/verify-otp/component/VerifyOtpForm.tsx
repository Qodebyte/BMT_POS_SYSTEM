'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AuthForm } from '@/app/components/AuthForm';
import { verifyOtp, verifyApprovedLoginOtp, resendOtp  } from "@/app/mock/auth";
import { toast } from 'sonner';
import { AdminDetail } from '@/app/utils/type';
import { getFirstAllowedPage } from '@/app/utils/getFirstAllowedPage';

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const admin_id = searchParams.get('admin_id') || '';
  const purpose = (searchParams.get('purpose') || '') as 'register' | 'login_approved' | 'login' | 'reset_password';
  const email = searchParams.get('email') || '';
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  async function onSubmit(values: z.infer<typeof otpSchema>) {
  setLoading(true);
  try {
    let response;

    if (purpose === 'login_approved') {
      const login_attempt_id = searchParams.get('attempt_id') || '';
      response = await verifyApprovedLoginOtp({
        admin_id,
        otp: values.otp,
        login_attempt_id,
      });
    } else {
      response = await verifyOtp({
        admin_id,
        otp: values.otp,
        purpose,
      });
    }

    const token = response.token;
    if (!token) throw new Error('No token received from server');

    localStorage.setItem('adminToken', token);

  
    const adminDetailStr = localStorage.getItem('adminDetail');
    let adminDetail: AdminDetail | null = adminDetailStr
      ? JSON.parse(adminDetailStr)
      : null;

    if (!adminDetail) {
      const payload = token.split('.')[1];
      const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
      adminDetail = JSON.parse(atob(padded));
      localStorage.setItem('adminDetail', JSON.stringify(adminDetail));
    }

    toast.success('Verification successful! Redirecting...');

    if (purpose === 'reset_password') {
      router.push(`/auth/reset-password?admin_id=${admin_id}`);
      return;
    }

   
    if (!adminDetail) {
      throw new Error('Admin details not found after verification');
    }

    const allowedPage = getFirstAllowedPage(adminDetail);

    if (!allowedPage) {
    
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminDetail');
      toast.error('You do not have permission to access any pages. Please contact admin.');
      router.push('/auth/login');
      return;
    }

    router.push(allowedPage);

  } catch (err: unknown) {
    let message = 'Invalid or expired OTP';
    let fieldError: 'otp' | null = null;

    if (err instanceof Error) {
      message = err.message;
      if (message.toLowerCase().includes('otp') || 
          message.toLowerCase().includes('invalid') || 
          message.toLowerCase().includes('expired')) {
        fieldError = 'otp';
      }
    }

    if (fieldError) {
      form.setError(fieldError, { type: 'server', message });
    }

    toast.error(message);
    console.error('OTP verification error:', err);
  } finally {
    setLoading(false);
  }
}


  async function handleResend() {
    setResendLoading(true);

    try {
      const login_attempt_id =
        purpose === 'login_approved'
          ? searchParams.get('attempt_id') || undefined
          : undefined;

      await resendOtp({
        email,
        purpose,
        login_attempt_id,
      });

    
      form.clearErrors('otp');
      form.resetField('otp');
      
      toast.success('OTP resent successfully! Check your email.');
    } catch (err: unknown) {
      let message = 'Failed to resend OTP';

      if (err instanceof Error) {
        message = err.message;
      }

      toast.error(message);
      console.error('Resend OTP error:', err);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <AuthForm 
      title="Verify Identity" 
      description={`Enter the 6-digit code sent to ${email}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField 
            control={form.control} 
            name="otp" 
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium tracking-wide">Verification Code</FormLabel>
                <FormControl>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <Input 
                      placeholder="123456" 
                      className={`bg-gray-900/50 border-gray-700 text-white pl-10 h-11 rounded-lg focus:border-green-400 focus:ring-green-400/20 text-center tracking-widest text-lg transition-colors ${
                        fieldState.error ? 'border-red-500 focus:border-red-500 focus:ring-red-400/20' : ''
                      }`}
                      maxLength={6}
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        field.onChange(value);
                      
                        if (fieldState.error) {
                          form.clearErrors('otp');
                        }
                      }}
                    />
                  </div>
                </FormControl>
                <div className="text-gray-500 text-xs mt-1 flex justify-between">
                  <span>• Enter the 6-digit code</span>
                  <span className="text-green-400">{field.value?.length || 0}/6</span>
                </div>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )} 
          />
          
          {/* OTP Timer/Resend */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-green-400 hover:text-green-400 hover:bg-green-400/10 text-sm"
            >
              {resendLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Resend Code
                </span>
              )}
            </Button>
            
            <div className="text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span>Code expires in: 05:00</span>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-green-400 hover:bg-green-400 text-black font-bold h-11 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl shadow-green-400/20"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Verifying Code...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Verify & Continue
              </span>
            )}
          </Button>
        </form>
      </Form>
    </AuthForm>
  );
}