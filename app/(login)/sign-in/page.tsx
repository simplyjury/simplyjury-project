import { Suspense } from 'react';
import { SimplyJuryLogin } from '../simplyjury-login';

export default function SignInPage() {
  return (
    <Suspense>
      <SimplyJuryLogin mode="signin" />
    </Suspense>
  );
}
