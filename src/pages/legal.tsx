import { VahaCta, VahaPageShell, VahaPanel } from '../components/vaha/VahaUI';

export default function Legal() {
  return (
    <VahaPageShell>
      <div className="vaha-container flex min-h-[60vh] items-center justify-center py-10">
        <VahaPanel className="max-w-xl text-center" eyebrow="Policies" title="Legal" description="Legal information and policies for Savannah Bar & Grill.">
          <div className="mt-6 space-y-2 text-sm text-vaha-muted">
            <p>© 2026 Savannah Bar & Grill. All rights reserved.</p>
            <p>17 Wellingborough Road, Northampton, NN1 2AB</p>
            <p>Privacy Policy | Terms of Service</p>
          </div>
          <VahaCta href="/" className="mt-8">
            Back Home
          </VahaCta>
        </VahaPanel>
      </div>
    </VahaPageShell>
  );
}
