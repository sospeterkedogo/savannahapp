import { VahaCta, VahaPageShell, VahaPanel } from '../components/vaha/VahaUI';

export default function NotFound() {
  return (
    <VahaPageShell>
      <div className="vaha-container flex min-h-[60vh] items-center justify-center py-10">
        <VahaPanel className="max-w-lg text-center" eyebrow="404" title="Page Not Found" description="Sorry, the page you are looking for does not exist.">
          <VahaCta href="/" variant="solid" className="mt-6">
            Back to Home
          </VahaCta>
        </VahaPanel>
      </div>
    </VahaPageShell>
  );
}
