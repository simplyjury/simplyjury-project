import { Suspense } from 'react';
import { SimplyJuryLogin } from '../simplyjury-login';

export default function SignUpPage() {
  return (
    <Suspense>
      <SimplyJuryLogin mode="signup" />
    </Suspense>
  );
}
