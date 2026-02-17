'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AuthForm } from '@/app/components/AuthForm';
import { toast } from 'sonner';
import Link from 'next/link';
import { registerAdmin } from '@/app/mock/auth';
import { Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      full_name: '', 
      email: '', 
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setLoading(true);
    try {
      const { admin_id } = await registerAdmin({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
      });

      toast.success('Registration successful! Check your email for OTP.');
      
      router.push(
        `/auth/verify-otp?admin_id=${admin_id}&purpose=register&email=${values.email}`
      );
    } catch (err: unknown) {
      let message = 'Unable to process registration';
      let fieldError: 'email' | 'password' | 'full_name' | null = null;

      if (err instanceof Error) {
        message = err.message;

       
        if (message.toLowerCase().includes('email')) {
          fieldError = 'email';
        } else if (message.toLowerCase().includes('password')) {
          fieldError = 'password';
        } else if (message.toLowerCase().includes('name')) {
          fieldError = 'full_name';
        }
      }

      
      if (fieldError) {
        form.setError(fieldError, { 
          type: 'server', 
          message 
        });
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthForm 
      title="Create Admin Account" 
      description="Register a new administrator account"
      footer={
        <div className="text-center text-gray-400 text-sm">
          Already have an account?{' '}
          <Link 
            href="/auth/login" 
            className="text-green-400 hover:text-green-400 hover:underline transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField 
            control={form.control} 
            name="full_name" 
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium tracking-wide">Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your full name" 
                    className={`bg-gray-900/50 border-gray-700 text-white h-11 rounded-lg focus:border-green-400 focus:ring-green-400/20 transition-colors ${
                      fieldState.error ? 'border-red-500 focus:border-red-500 focus:ring-red-400/20' : ''
                    }`}
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )} 
          />

          <FormField 
            control={form.control} 
            name="email" 
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium tracking-wide">Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      className={`bg-gray-900/50 border-gray-700 text-white pl-10 h-11 rounded-lg focus:border-green-400 focus:ring-green-400/20 transition-colors ${
                        fieldState.error ? 'border-red-500 focus:border-red-500 focus:ring-red-400/20' : ''
                      }`}
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )} 
          />

          <FormField 
            control={form.control} 
            name="password" 
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium tracking-wide">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <Input 
                       type={showNewPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters" 
                      className={`bg-gray-900/50 border-gray-700 text-white pl-10 h-11 rounded-lg focus:border-green-400 focus:ring-green-400/20 transition-colors ${
                        fieldState.error ? 'border-red-500 focus:border-red-500 focus:ring-red-400/20' : ''
                      }`}
                      {...field} 
                    />
                    <button
                    type="button"
                    onClick={() => setShowNewPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    tabIndex={-1}  
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )} 
          />

          <FormField 
            control={form.control} 
            name="confirmPassword" 
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium tracking-wide">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <Input 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password" 
                      className={`bg-gray-900/50 border-gray-700 text-white pl-10 h-11 rounded-lg focus:border-green-400 focus:ring-green-400/20 transition-colors ${
                        fieldState.error ? 'border-red-500 focus:border-red-500 focus:ring-red-400/20' : ''
                      }`}
                      {...field} 
                    />
                    <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )} 
          />
          
          <Button 
            type="submit" 
            className="w-full bg-green-400 hover:bg-green-400 text-black font-bold h-11 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl shadow-green-400/20"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </Form>
    </AuthForm>
  );
}