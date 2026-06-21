import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  VahaButton,
  VahaLoading,
  VahaPageShell,
  VahaPanel,
} from '../vaha/VahaUI';

export function StaffShell({ children }: { children: ReactNode }) {
  return <VahaPageShell>{children}</VahaPageShell>;
}

export function StaffLoading({ label = 'Checking staff access…' }: { label?: string }) {
  return (
    <StaffShell>
      <VahaLoading label={label} />
    </StaffShell>
  );
}

export function StaffAccessDenied({
  message = 'Sign in with an admin or employee account.',
  showLogin = true,
}: {
  message?: string;
  showLogin?: boolean;
}) {
  return (
    <StaffShell>
      <div className="vaha-container flex min-h-[60vh] items-center justify-center py-10">
        <VahaPanel title="Staff Access Required" description={message} className="max-w-lg text-center">
          {showLogin ? (
            <Link href="/staff/login" className="mt-4 inline-block">
              <VahaButton variant="solid">Staff Sign In</VahaButton>
            </Link>
          ) : null}
        </VahaPanel>
      </div>
    </StaffShell>
  );
}

export function StaffPageHeader({
  eyebrow = 'Savannah staff',
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <VahaPanel eyebrow={eyebrow} title={title} description={description}>
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </VahaPanel>
  );
}

export function StaffSectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="vaha-eyebrow">{children}</h2>;
}
