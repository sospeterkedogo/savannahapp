import { VahaPageHero, VahaPageShell } from '../components/vaha/VahaUI';

export default function Hours() {
  return (
    <VahaPageShell>
      <VahaPageHero
        eyebrow="Hours"
        title="Opening Hours"
        description="When we are open for food and drinks."
      />

      <section className="vaha-section bg-vaha-ink-soft">
        <div className="vaha-container mx-auto max-w-lg">
          <table className="w-full text-vaha-cream">
            <tbody>
              {[
                ['Monday – Thursday', '12:00 – 23:00'],
                ['Friday', '12:00 – 00:00'],
                ['Saturday', '10:00 – 00:00'],
                ['Sunday', '10:00 – 22:00'],
              ].map(([day, hours]) => (
                <tr key={day} className="border-b border-white/10">
                  <td className="py-4 text-vaha-muted">{day}</td>
                  <td className="py-4 text-right font-medium">{hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-10 text-center text-sm text-vaha-muted">
            17 Wellingborough Road, Northampton, NN1 2AB
          </p>
        </div>
      </section>
    </VahaPageShell>
  );
}
