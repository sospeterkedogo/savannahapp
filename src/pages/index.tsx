import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaMedal, FaUtensils, FaStar, FaClock, FaLocationDot, FaPhone, FaEnvelope, FaCalendarDays } from 'react-icons/fa6';
import { getTeaserEvents } from '../lib/events';
import type { SavannahEvent } from '../types/app';

export default function Home() {
  const [events, setEvents] = useState<SavannahEvent[]>([]);

  useEffect(() => {
    const fetchTeaser = async () => {
      const data = await getTeaserEvents(3);
      setEvents(data);
    };
    fetchTeaser();
  }, []);

  return (
    <div className="bg-black text-white">
      {/* Floating Quick Action Bar */}
      <div className="fixed bottom-8 left-1/2 z-[150] flex -translate-x-1/2 items-center gap-2 rounded-sm border border-luxury-accent/30 bg-black/60 px-2 py-2 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl luxury-fade-in md:bottom-12 md:gap-4 md:px-4">
        <a href="tel:+1234567890" className="flex items-center gap-2 rounded-sm bg-luxury-accent px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition-all hover:bg-white md:px-6 md:py-3 md:text-xs">
          <FaPhone /> Call
        </a>
        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-sm bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-white/20 md:px-6 md:py-3 md:text-xs">
          <FaLocationDot className="text-luxury-accent" /> Locate
        </a>
        <Link href="/book" className="flex items-center gap-2 rounded-sm bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-white/20 md:px-6 md:py-3 md:text-xs">
          <FaMedal className="text-luxury-accent" /> Book
        </Link>
      </div>

      {/* 1. Dramatic Full BG Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image 
            src="/images/bbq3.jpeg" 
            alt="Savannah Wood-Fired BBQ Grill" 
            fill 
            priority 
            className="object-cover object-center w-full h-full brightness-[0.45] fixed" 
          />
          
        </div>

        <div className="relative z-10 w-full h-full flex flex-col luxury-fade-in px-8 md:px-32 py-20">
          {/* Top Left Label */}
          <div className="absolute top-12 left-8 md:left-32 text-center md:text-left">
            <p className="text-[10px] md:text-sm font-semibold uppercase tracking-[0.5em] text-luxury-accent/90">
              A Masterclass in Dining
            </p>
          </div>

          {/* Top Right Detail */}
          <div className="hidden md:block absolute top-12 right-32 text-right">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-luxury-accent/90">
              Est. 2026 &bull; Northampton
            </p>
          </div>

          {/* Centered Content */}
          <div className="flex-1 flex flex-col justify-center items-center text-center mx-auto w-full">
            <div className="mb-8 flex flex-wrap justify-center gap-4 md:gap-10 text-[10px] md:text-sm font-bold uppercase tracking-[0.4em] text-luxury-accent/80">
              <span className="flex items-center gap-2 "><FaLocationDot className="text-luxury-accent" /> 17 Wellingorough Road</span>
              <span className="flex items-center gap-2"><FaPhone className="text-luxury-accent" /> +44 234 567 812</span>
              <span className="flex items-center gap-2"><FaClock className="text-luxury-accent" /> Open: 12:00 – 4:00</span>
            </div>
            
            <h1 className="text-6xl md:text-[12rem] font-serif font-bold text-white/90  drop-shadow-[0_8px_48px_rgba(197,160,89,0.4)] mb-4 tracking-tighter leading-[0.8]">
              Savannah B&G
            </h1>
            <p className="text-2xl md:text-6xl  font-light text-luxury-accent italic tracking-tight mt-8 mb-12 max-w-4xl leading-tight">
              Where taste meets tradition.
            </p>

            {/* Quick Action Navigation Bar */}
            <div className="mt-4 flex flex-wrap justify-center gap-4 md:gap-8">
              <a href="tel:+1234567890" className="flex items-center gap-3 rounded-sm border border-white/10 bg-white/5 px-6 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-luxury-accent">
                <FaPhone className="text-luxury-accent" /> Call Now
              </a>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-sm border border-white/10 bg-white/5 px-6 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-luxury-accent">
                <FaLocationDot className="text-luxury-accent" /> Get Directions
              </a>
              <Link href="/hours" className="flex items-center gap-3 rounded-sm border border-white/10 bg-white/5 px-6 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-luxury-accent">
                <FaClock className="text-luxury-accent" /> View Hours
              </Link>
            </div>
          </div>
          
          {/* Desktop Corner Buttons / Mobile Bottom Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center md:absolute md:bottom-24 md:left-12 md:right-12 md:justify-between items-center z-50 mt-12 md:mt-0">
            <Link href="/menu" className="w-full sm:w-auto text-center px-12 md:px-16 py-6 md:py-8 bg-luxury-accent text-black rounded-sm font-bold text-xl md:text-2xl hover:bg-white transition-all duration-500 shadow-2xl">
              View Menu
            </Link>
            <Link href="/book" className="w-full sm:w-auto text-center px-12 md:px-16 py-6 md:py-8 bg-black/40 border-2 border-luxury-accent text-luxury-accent rounded-sm font-bold text-xl md:text-2xl hover:bg-luxury-accent hover:text-black transition-all duration-500 backdrop-blur-xl shadow-2xl">
              Book a Table
            </Link>
          </div>

          <div className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
            <div className="h-10 w-px bg-luxury-accent" />
          </div>
        </div>
      </section>

      {/* 2. Our Story / About Section */}
      <section className="py-40 px-8 bg-black relative">
        <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-luxury-accent/20 shadow-2xl">
            <Image 
              src="/images/grilling-p.jpg" 
              alt="Our Wood-Fired Grill" 
              fill 
              className="object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
          </div>
          
          <div className="flex flex-col gap-10 luxury-fade-in">
            <span className="text-luxury-accent font-bold tracking-[0.4em] uppercase text-sm">Our Legacy</span>
            <h2 className="text-5xl md:text-8xl font-serif font-bold leading-tight">
              Get The <span className="text-luxury-accent italic">finest</span> bbq at <span className="text-luxury-accent">Savannah B&G</span>
            </h2>
            <p className="text-2xl text-white/70 leading-relaxed font-light">
              Savannah Bar & Grill is a new dining destination Northampton town center, offering a curated menu of world-class cuisine, signature cocktails, and a vibrant atmosphere.
            </p>
            <Link href="/info" className="text-luxury-accent font-bold uppercase tracking-widest text-sm underline underline-offset-8 hover:text-white transition-colors">
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Interlude: Fixed Background scrollover - PATCHED */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image 
            src="/images/about-bbq.jpeg" 
            alt="Fire and Smoke" 
            fill 
            className="object-cover brightness-[0.4] fixed scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
        <div className="text-center luxury-fade-in px-4">
          <h2 className="text-6xl md:text-[12rem] font-serif font-bold text-white italic tracking-tighter drop-shadow-[0_0_80px_rgba(197,160,89,0.3)]">
            Come for the food, stay for the experience.
          </h2>
        </div>
      </section>

      {/* 3. Signature Experience Section - BG FIXED */}
      <section className="relative py-40 px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image 
            src="/images/bbq2.jpeg" 
            alt="Experience Background" 
            fill 
            className="object-cover brightness-[0.15] fixed" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black" />
        </div>
        
        <div className="max-w-[1700px] mx-auto flex flex-col items-center relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-8xl font-serif font-bold mb-8 tracking-tighter">The Savannah B&G Experience</h2>
            <p className="text-white/60 text-2xl font-light">Crafted for those who appreciate real flavour.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full">
            <div className="p-16 rounded-md border border-white/5 bg-black/40 backdrop-blur-xl hover:border-luxury-accent/30 transition-all group">
              <FaStar className="text-5xl text-luxury-accent mb-10 group-hover:scale-110 transition-transform" />
              <h3 className="text-3xl font-serif font-bold mb-6">Special Selection</h3>
              <p className="text-white/60 text-lg font-light leading-relaxed">We are committed to quality, flavor, and service excellence.</p>
            </div>
            <div className="p-16 rounded-md border border-white/5 bg-black/40 backdrop-blur-xl hover:border-luxury-accent/30 transition-all group">
              <FaUtensils className="text-5xl text-luxury-accent mb-10 group-hover:scale-110 transition-transform" />
              <h3 className="text-3xl font-serif font-bold mb-6">Chef's Menu</h3>
              <p className="text-white/60 text-lg font-light leading-relaxed">Special dishes featuring authentic produce and premium wood-fired cuts.</p>
            </div>
            <div className="p-16 rounded-md border border-white/5 bg-black/40 backdrop-blur-xl hover:border-luxury-accent/30 transition-all group">
              <FaMedal className="text-5xl text-luxury-accent mb-10 group-hover:scale-110 transition-transform" />
              <h3 className="text-3xl font-serif font-bold mb-6">World-Class Selection</h3>
              <p className="text-white/60 text-lg font-light leading-relaxed">Award-winning mixology and a curated cellar of vintage labels and rare spirits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Menu Highlights / Visual Section */}
      <section className="py-40 px-8 bg-black">
        <div className=" mx-auto flex flex-col gap-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div>
              <h2 className="text-6xl md:text-9xl font-serif font-bold tracking-tighter">Menu Highlights</h2>
              <p className="text-luxury-accent text-2xl font-light mt-6">A journey through our most celebrated dishes.</p>
            </div>
            <Link href="/menu" className="px-12 py-5 border-2 border-luxury-accent text-luxury-accent rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-luxury-accent hover:text-black transition-all">
              Explore Full Menu
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="group relative aspect-square rounded-md overflow-hidden border border-white/10 shadow-2xl">
              <Image src="/images/meat-w.jpg" alt="Signature Steak" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-12 left-12">
                <span className="text-luxury-accent font-bold uppercase tracking-widest text-sm">The Grill</span>
                <h3 className="text-4xl font-serif font-bold text-accent mt-3">Nyama Choma</h3>
              </div>
            </div>
            <div className="group relative aspect-square rounded-md overflow-hidden border border-white/10 shadow-2xl">
              <Image src="/images/burger-drinks-p.jpg" alt="Cocktails" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-12 left-12">
                <span className="text-luxury-accent font-bold uppercase tracking-widest text-sm">The Bar</span>
                <h3 className="text-4xl font-serif font-bold text-accent mt-3">Savannah Gold</h3>
              </div>
            </div>
            <div className="group relative aspect-square rounded-md overflow-hidden border border-white/10 shadow-2xl">
              <Image src="/images/bbq-p.jpg" alt="Smoked Brisket" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-12 left-12">
                <span className="text-luxury-accent font-bold uppercase tracking-widest text-sm">Signature</span>
                <h3 className="text-4xl font-serif font-bold text-accent mt-3">Grilled Chicken</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Opening Hours & Contact Info */}
      <section className="relative py-40 px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image 
            src="/images/nyamchom.jpeg" 
            alt="Savannah Atmosphere" 
            fill 
            className="object-cover brightness-[0.15] fixed" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black" />
        </div>

        <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 relative z-10">
          <div className="flex flex-col gap-12 luxury-fade-in">
            <h2 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter text-white">Hours & Location</h2>
            <div className="grid gap-10">
              <div className="flex items-start gap-8">
                <FaLocationDot className="text-4xl text-luxury-accent shrink-0 mt-2" />
                <div>
                  <h4 className="text-2xl font-bold mb-3">Visit Us</h4>
                  <p className="text-white/60 text-lg font-light leading-relaxed">
                    17 Wellingorough Road, Northampton.<br />
                    Northamptonshire, NN1 2AB, UK.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-8">
                <FaClock className="text-4xl text-luxury-accent shrink-0 mt-2" />
                <div>
                  <h4 className="text-2xl font-bold mb-3">Service Hours</h4>
                  <table className="text-white/60 text-lg font-light w-full">
                    <tbody>
                      <tr><td className="pr-12 py-2">Mon - Thu</td><td>12:00 – 23:00</td></tr>
                      <tr><td className="pr-12 py-2">Friday</td><td>12:00 – 00:00</td></tr>
                      <tr><td className="pr-12 py-2">Saturday</td><td>10:00 – 00:00</td></tr>
                      <tr><td className="pr-12 py-2">Sunday</td><td>10:00 – 22:00</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-black/40 p-16 rounded-sm border border-white/5 backdrop-blur-xl">
            <h3 className="text-4xl font-serif font-bold mb-10">Get In Touch</h3>
            <div className="flex flex-col gap-8">
              <a href="tel:+44234567890" className="flex items-center gap-8 text-white/80 hover:text-luxury-accent transition-colors text-xl">
                <FaPhone className="text-3xl" /> +44 234 567 890
              </a>
              <a href="mailto:info@savannah.com" className="flex items-center gap-8 text-white/80 hover:text-luxury-accent transition-colors text-xl">
                <FaEnvelope className="text-3xl" /> info@savannah.com
              </a>
              <div className="h-px bg-white/10 my-6" />
              <Link href="/contact" className="px-12 py-5 bg-white/5 rounded-sm text-center font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-all border border-white/10">
                Send a Message
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Events Teaser */}
      <section className="py-32 px-8 bg-black text-center">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-12 luxury-fade-in">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-luxury-accent tracking-tighter">Events & Updates</h2>
          <p className="text-2xl text-white/70 font-light leading-relaxed">
            Stay tuned for our latest happenings, live music events, and exclusive meetups.
          </p>
          <Link href="/events" className="text-luxury-accent font-bold uppercase tracking-widest text-sm underline underline-offset-8 hover:text-white transition-colors">
            View Upcoming Events
          </Link>
        </div>
      </section>

      {/* 7. CTA / Final Section */}
      <section className="relative py-60 px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image src="/images/bbq3.jpeg" alt="Savannah BBQ Grill Background" fill className="object-cover brightness-[0.2]" />
        </div>
        <div className="max-w-[1700px] mx-auto text-center flex flex-col items-center gap-12 relative z-10">
          <h2 className="text-7xl md:text-[10rem] font-serif font-bold leading-tight tracking-tighter">Join Us for an <br />Unforgettable Experience</h2>
          <p className="text-3xl text-white/80 font-light max-w-4xl">Secure your table today and experience the best of Savannah Bar & Grill.</p>
          <Link href="/book" className="px-20 py-10 bg-luxury-accent text-black rounded-sm font-bold text-4xl hover:bg-white transition-all duration-500 shadow-[0_0_80px_rgba(197,160,89,0.5)]">
            Reserve Now
          </Link>
        </div>
      </section>

      {/* Decorative Orbs */}
      <div className="fixed top-1/2 -left-32 w-80 h-80 bg-luxury-accent/5 rounded-sm blur-[120px] pointer-events-none" />
      <div className="fixed top-0 -right-32 w-96 h-96 bg-luxury-accent/5 rounded-sm blur-[150px] pointer-events-none" />
    </div>
  );
}
