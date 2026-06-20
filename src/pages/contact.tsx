export default function Contact() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black pb-16 pt-8">
      <div className="bg-black/60 rounded-2xl shadow-2xl border border-luxury-accent/30 p-10 flex flex-col items-center max-w-xl w-full">
        <h1 className="text-5xl font-serif font-bold text-luxury-accent mb-4 drop-shadow-lg">Contact Us</h1>
        <p className="mb-8 text-lg text-white/80 text-center">We'd love to hear from you! Reach out with any questions or feedback.</p>
        <form className="w-full flex flex-col gap-4 mt-4" aria-label="Contact Form">
          <input className="px-4 py-3 rounded-lg bg-black/40 border border-luxury-accent text-white placeholder:text-white/60 focus:ring-2 focus:ring-luxury-accent" placeholder="Name" aria-label="Name" required />
          <input className="px-4 py-3 rounded-lg bg-black/40 border border-luxury-accent text-white placeholder:text-white/60 focus:ring-2 focus:ring-luxury-accent" placeholder="Email" aria-label="Email" type="email" required />
          <textarea className="px-4 py-3 rounded-lg bg-black/40 border border-luxury-accent text-white placeholder:text-white/60 focus:ring-2 focus:ring-luxury-accent min-h-[100px]" placeholder="Message" aria-label="Message" required />
          <button type="submit" className="luxury-cta bg-gradient-to-r from-luxury-accent to-yellow-400 text-black rounded-full font-bold text-lg py-3 mt-2">Send Message</button>
        </form>
        <div className="mt-8 text-white/70 text-center text-sm">Or email us at <a href="mailto:info@savannah.com" className="underline hover:text-luxury-accent">info@savannah.com</a></div>
      </div>
    </main>
  );
}
