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
import { toast } from 'sonner';
import { resetPassword } from '@/app/mock/auth';
import { Eye, EyeOff } from 'lucide-react';

const resetSchema = z.object({
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const admin_id = searchParams.get('admin_id') || ''; 
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { new_password: '', confirm_password: '' },
  });

  async function onSubmit(values: z.infer<typeof resetSchema>) {
    if (!admin_id) {
      toast.error('Invalid reset session. Please try again.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        admin_id,
        new_password: values.new_password,
      });

      toast.success('Password updated successfully! Redirecting to login...');
      
     
      localStorage.removeItem('adminToken');
      
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (err: unknown) {
      let message = 'Unable to process password reset';
      let fieldError: 'new_password' | 'confirm_password' | null = null;

      if (err instanceof Error) {
        message = err.message;

     
        if (message.toLowerCase().includes('password')) {
          fieldError = 'new_password';
        }
      }

    
      if (fieldError) {
        form.setError(fieldError, { 
          type: 'server', 
          message 
        });
      }

      toast.error(message);
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthForm 
      title="Set New Password" 
      description="Create a strong new password for your account"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField 
            control={form.control} 
            name="new_password" 
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium tracking-wide">New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className={`bg-gray-900/50 border-gray-700 text-white pl-10 pr-10 h-11 rounded-lg ${
                    fieldState.error ? 'border-red-500' : ''
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
            name="confirm_password" 
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium tracking-wide">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={`bg-gray-900/50 border-gray-700 text-white pl-10 pr-10 h-11 rounded-lg ${
                    fieldState.error ? 'border-red-500' : ''
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
          
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 text-sm font-medium mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Password Requirements:
            </h4>
            <ul className="text-green-300/80 text-xs space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Minimum 8 characters
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Use uppercase & lowercase letters
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Include numbers and special characters
              </li>
            </ul>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-green-400 hover:bg-green-400 text-black font-bold h-11 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl shadow-green-400/20"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Updating Password...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update Password
              </span>
            )}
          </Button>
        </form>
      </Form>
    </AuthForm>
  );
}