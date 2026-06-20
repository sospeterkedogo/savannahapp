export default function Legal() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black pb-16 pt-8">
      <div className="bg-black/60 rounded-2xl shadow-2xl border border-luxury-accent/30 p-10 flex flex-col items-center max-w-xl w-full">
        <h1 className="text-5xl font-serif font-bold text-luxury-accent mb-4 drop-shadow-lg">Legal</h1>
        <p className="mb-8 text-lg text-white/80 text-center">Legal information and policies for Savannah Bar & Grill.</p>
        <div className="w-full mt-6 text-white/80 text-sm text-center">
          <p className="mb-2">© 2026 Savannah Bar & Grill. All rights reserved.</p>
          <p className="mb-2">123 Main Street, City, Country</p>
          <p className="mb-2">Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </main>
  );
}
