export default function Hours() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black pb-16 pt-8">
      <div className="bg-black/60 rounded-2xl shadow-2xl border border-luxury-accent/30 p-10 flex flex-col items-center max-w-xl w-full">
        <h1 className="text-5xl font-serif font-bold text-luxury-accent mb-4 drop-shadow-lg">Opening Hours</h1>
        <p className="mb-8 text-lg text-white/80 text-center">Check out our opening hours below.</p>
        <div className="w-full mt-6">
          <table className="w-full text-white/90 text-lg">
            <tbody>
              <tr><td className="py-2">Monday - Thursday</td><td className="py-2 text-right">12:00 – 23:00</td></tr>
              <tr><td className="py-2">Friday</td><td className="py-2 text-right">12:00 – 00:00</td></tr>
              <tr><td className="py-2">Saturday</td><td className="py-2 text-right">10:00 – 00:00</td></tr>
              <tr><td className="py-2">Sunday</td><td className="py-2 text-right">10:00 – 22:00</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
