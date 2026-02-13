// app/auth/reset-password/page.tsx
import { Suspense } from 'react';
import ResetPasswordForm from './component/ResetPasswordForm';


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
