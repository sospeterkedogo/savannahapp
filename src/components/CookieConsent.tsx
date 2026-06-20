import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('savannah_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  function handleAccept() {
    localStorage.setItem('savannah_cookie_consent', 'true');
    setShow(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] border-t border-luxury-accent/30 bg-black/90 p-4 text-sm text-white/80 shadow-2xl backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1700px] flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-8">
        <p className="text-center md:text-left leading-relaxed">
          We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
          By clicking <strong className="text-luxury-accent">"Accept All"</strong>, you consent to our use of cookies.
        </p>
        <div className="flex shrink-0 gap-4">
          <button 
            onClick={handleAccept}
            className="whitespace-nowrap rounded-full bg-luxury-accent px-6 py-2.5 font-bold text-black transition-colors hover:bg-white"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
