
import { Suspense } from 'react';
import VerifyOtpForm from './component/VerifyOtpForm';



export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <VerifyOtpForm />
    </Suspense>
  );
}
