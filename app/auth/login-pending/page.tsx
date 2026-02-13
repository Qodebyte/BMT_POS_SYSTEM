
import { Suspense } from 'react';
import LoginPending from './components/LoginPendingPage';



export default function LoginPendingPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LoginPending />
    </Suspense>
  );
}
