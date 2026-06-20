import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaCheck, FaCircleQuestion } from 'react-icons/fa6';
import { useCurrentProfile } from '../lib/useCurrentProfile';
import type { OnboardingRole, OnboardingState, OnboardingStep } from '../types/app';

const STORAGE_PREFIX = 'savannah-onboarding';

const stepsByRole: Record<OnboardingRole, OnboardingStep[]> = {
  guest: [
    {
      id: 'browse-menu',
      title: 'Browse the menu',
      body: 'Open a category and add items to your cart.',
      href: '/menu',
      actionLabel: 'View Menu',
    },
    {
      id: 'checkout-location',
      title: 'Checkout with location',
      body: 'Use guest checkout and share location only when you choose.',
      href: '/checkout',
      actionLabel: 'Checkout',
    },
    {
      id: 'create-profile',
      title: 'Save receipts',
      body: 'Create a customer account when you want profile details and invoices saved.',
      href: '/login?redirect=/profile',
      actionLabel: 'Create Account',
    },
  ],
  customer: [
    {
      id: 'profile-details',
      title: 'Complete profile',
      body: 'Save contact, address, and optional Google Maps location.',
      href: '/profile',
      actionLabel: 'Open Profile',
    },
    {
      id: 'saved-invoices',
      title: 'Review invoices',
      body: 'Use your profile to find receipts and invoice numbers.',
      href: '/profile',
      actionLabel: 'View Receipts',
    },
    {
      id: 'order-again',
      title: 'Order again',
      body: 'Build a cart from the latest live menu.',
      href: '/menu',
      actionLabel: 'View Menu',
    },
  ],
  employee: [
    {
      id: 'orders-queue',
      title: 'Check orders',
      body: 'Open the live queue and update order status as work progresses.',
      href: '/staff/orders',
      actionLabel: 'Open Orders',
    },
    {
      id: 'menu-availability',
      title: 'Update availability',
      body: 'Keep prices, descriptions, and item visibility current.',
      href: '/staff/menu',
      actionLabel: 'Open Menu',
    },
    {
      id: 'guest-context',
      title: 'Use receipt context',
      body: 'Guest orders include contact details, notes, and optional Maps links.',
      href: '/staff/orders',
      actionLabel: 'Review Orders',
    },
  ],
  admin: [
    {
      id: 'staff-dashboard',
      title: 'Open staff dashboard',
      body: 'Start from the staff app for operational work.',
      href: '/staff',
      actionLabel: 'Staff Home',
    },
    {
      id: 'manage-menu',
      title: 'Manage menu',
      body: 'Admins can create, update, duplicate, hide, and delete menu rows.',
      href: '/staff/menu',
      actionLabel: 'Manage Menu',
    },
    {
      id: 'audit-orders',
      title: 'Monitor orders',
      body: 'Review customer and guest orders with receipts, invoices, and status.',
      href: '/staff/orders',
      actionLabel: 'Open Orders',
    },
  ],
};

function storageKey(role: OnboardingRole) {
  return `${STORAGE_PREFIX}:${role}`;
}

function readState(role: OnboardingRole): OnboardingState {
  try {
    const saved = window.localStorage.getItem(storageKey(role));
    if (saved) return JSON.parse(saved) as OnboardingState;
  } catch {
    // Ignore blocked storage and show the default onboarding state.
  }

  return { completed: [], dismissed: false };
}

export default function RoleOnboarding() {
  const { loading, role } = useCurrentProfile();
  const steps = stepsByRole[role];
  const [state, setState] = useState<OnboardingState>({ completed: [], dismissed: false });
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const completedCount = state.completed.length;
  const isComplete = completedCount >= steps.length;

  useEffect(() => {
    if (loading) return;

    const nextState = readState(role);
    setState(nextState);
    setOpen(!nextState.dismissed && nextState.completed.length < steps.length);
  }, [loading, role, steps.length]);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
  }, [open, role]);

  useEffect(() => {
    if (loading) return;
    window.localStorage.setItem(storageKey(role), JSON.stringify(state));
  }, [loading, role, state]);

  const title = useMemo(() => {
    if (role === 'admin') return 'Admin Onboarding';
    if (role === 'employee') return 'Employee Onboarding';
    if (role === 'customer') return 'Customer Onboarding';
    return 'Guest Onboarding';
  }, [role]);

  function toggleStep(stepId: string) {
    setState((current) => {
      const completed = current.completed.includes(stepId)
        ? current.completed.filter((id) => id !== stepId)
        : [...current.completed, stepId];

      return {
        ...current,
        completed,
        dismissed: completed.length >= steps.length ? true : current.dismissed,
      };
    });
  }

  function dismiss() {
    setState((current) => ({ ...current, dismissed: true }));
    setOpen(false);
  }

  function reset() {
    setState({ completed: [], dismissed: false });
    setOpen(true);
  }

  if (loading) return null;

  return (
    <>
      <button
        type="button"
        className="fixed bottom-5 right-5 z-[70] grid h-12 w-12 place-items-center rounded-full border border-luxury-accent/40 bg-black/80 text-luxury-accent shadow-2xl backdrop-blur hover:bg-luxury-accent hover:text-black"
        onClick={() => setOpen(true)}
        aria-label={`Open ${title}`}
      >
        <FaCircleQuestion aria-hidden="true" />
      </button>

      {open && (
        <section
          className="fixed bottom-20 right-4 z-[80] w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-luxury-accent/30 bg-black/90 p-5 text-white shadow-2xl backdrop-blur md:right-5"
          role="dialog"
          aria-labelledby="role-onboarding-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-luxury-accent/80">{role}</p>
              <h2 id="role-onboarding-title" className="text-2xl font-serif font-bold text-luxury-accent">{title}</h2>
              <p className="mt-1 text-sm text-white/65">{completedCount} of {steps.length} complete</p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={dismiss}
              className="rounded-full border border-white/20 px-3 py-2 text-sm font-bold text-white hover:border-luxury-accent hover:text-luxury-accent"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {steps.map((step) => {
              const checked = state.completed.includes(step.id);

              return (
                <article key={step.id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleStep(step.id)}
                      className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${checked ? 'border-luxury-accent bg-luxury-accent text-black' : 'border-white/30 text-white'}`}
                      aria-label={`${checked ? 'Mark incomplete' : 'Mark complete'}: ${step.title}`}
                    >
                      {checked && <FaCheck aria-hidden="true" className="text-xs" />}
                    </button>
                    <div>
                      <h3 className="text-base font-bold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-white/65">{step.body}</p>
                      {step.href && step.actionLabel && (
                        <Link href={step.href} className="mt-3 inline-flex text-sm font-semibold text-luxury-accent underline underline-offset-4">
                          {step.actionLabel}
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button type="button" onClick={reset} className="text-sm font-semibold text-white/65 underline underline-offset-4 hover:text-luxury-accent">
              Reset
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="luxury-cta rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-5 py-2 text-sm font-bold text-black"
            >
              {isComplete ? 'Done' : 'Keep Going'}
            </button>
          </div>
        </section>
      )}
    </>
  );
}
