'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { AuthForm } from '@/app/components/AuthForm';
import { toast } from 'sonner';
import { loginAdmin } from "@/app/mock/auth";
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type APIError = {
  status: number;
  message: string;
  data?: Record<string, unknown>;
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    setFieldErrors({});

    try {
      const res = await loginAdmin(values);

     
      if (res.message === "Login pending approval. Check your email.") {
        toast.info('🔐 Login Pending Approval', {
          description: `Approval requested from ${res.approvers_notified || 1} Super Admin(s). Check your email.`,
          duration: 5000,
        });

        router.push(
          `/auth/login-pending?admin_id=${res.admin_id}&attempt_id=${res.attempt_id}&email=${values.email}`
        );
        return;
      }

    
      toast.success('✅ OTP Sent', {
        description: 'Check your email for the verification code.',
        duration: 4000,
      });

      router.push(
        `/auth/verify-otp?admin_id=${res.admin_id}&purpose=login&email=${values.email}&attempt_id=${res.attempt_id}`
      );
    } catch (err: unknown) {
      console.error('Login error:', err);

      const apiError = err as APIError;
      const errorMessage = apiError.message?.toLowerCase() || '';
      const statusCode = apiError.status || 500;

     
      if (statusCode === 401 || errorMessage.includes('invalid credentials')) {
        setFieldErrors({
          email: 'Invalid credentials',
          password: 'Invalid credentials',
        });
        toast.error('❌ Invalid Credentials', {
          description: 'Email or password is incorrect. Please try again.',
          duration: 4000,
        });
      }
   
      else if (statusCode === 403 || errorMessage.includes('please verify your account')) {
        setFieldErrors({
          email: 'Account not verified',
        });
        toast.warning('⚠️ Account Not Verified', {
          description: 'Please verify your email address first.',
          duration: 4000,
        });
      }
    
      else if (statusCode === 429 || errorMessage.includes('too many attempts')) {
        toast.warning('⏱️ Too Many Attempts', {
          description: 'Please try again in a few minutes.',
          duration: 4000,
        });
      }
    
      else if (statusCode >= 500) {
        toast.error('🔴 Server Error', {
          description: 'Something went wrong on our end. Please try again later.',
          duration: 5000,
        });
      }
   
      else {
        toast.error('❌ Login Failed', {
          description: apiError.message || 'An unexpected error occurred.',
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthForm
      title="Admin Login"
      description="Sign in to access the control dashboard"
      footer={
        <div className="space-y-4">
          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-green-400 hover:text-green-400 hover:underline transition-colors text-sm"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="text-center text-gray-400 text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-green-400 hover:text-green-400 hover:underline transition-colors font-medium"
            >
              Request Access
            </Link>
          </div>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium tracking-wide">Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <Input
                      type="email"
                      placeholder="admin@primelabs.com"
                      className={`bg-gray-900/50 text-white pl-10 h-11 rounded-lg focus:ring-2 transition-all duration-200 ${
                        fieldErrors.email
                          ? 'border-2 border-red-500 focus:border-red-500 focus:ring-red-500/30'
                          : 'border-gray-700 focus:border-green-400 focus:ring-green-400/20'
                      }`}
                      {...field}
                    />
                  </div>
                </FormControl>
                {fieldErrors.email && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </div>
                )}
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />

         <FormField
  control={form.control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-white text-sm font-medium tracking-wide">
        Password
      </FormLabel>

      <FormControl>
        <div className="relative">
       
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>

         
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className={`bg-gray-900/50 text-white pl-10 pr-10 h-11 rounded-lg focus:ring-2 transition-all duration-200 ${
              fieldErrors.password
                ? "border-2 border-red-500 focus:border-red-500 focus:ring-red-500/30"
                : "border-gray-700 focus:border-green-400 focus:ring-green-400/20"
            }`}
            {...field}
          />

        
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </FormControl>

      {fieldErrors.password && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{fieldErrors.password}</span>
        </div>
      )}

      <FormMessage className="text-red-400 text-xs" />
    </FormItem>
  )}
/>

          <Button
            type="submit"
            className="w-full bg-green-400 hover:bg-green-500 text-black font-bold h-11 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl shadow-green-400/20"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </span>
            )}
          </Button>
        </form>
      </Form>
    </AuthForm>
  );
}