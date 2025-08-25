import { Suspense } from 'react';
import { ResetPasswordView } from '@/components/auth/ResetPasswordView';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordView />
    </Suspense>
  );
}
