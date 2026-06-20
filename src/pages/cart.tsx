import Link from 'next/link';
import { useCart } from '../lib/cart';

export default function Cart() {
  const { items, count, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <main className="min-h-screen bg-black pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 px-4">
        <section className="rounded-2xl border border-luxury-accent/30 bg-black/70 p-6 shadow-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-luxury-accent/80">Cart</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-luxury-accent">Your Order</h1>
          <p className="mt-3 text-white/70">{count} item{count === 1 ? '' : 's'} ready for checkout.</p>
        </section>

        {items.length === 0 ? (
          <section className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-8 text-center shadow-xl">
            <p className="text-white/75">Your cart is empty.</p>
            <Link href="/menu" className="luxury-cta mt-6 inline-flex rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-8 py-3 font-bold text-black">
              Browse Menu
            </Link>
          </section>
        ) : (
          <section className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-5 shadow-xl">
            <div className="grid gap-4">
              {items.map((item) => (
                <article key={item.id} className="grid gap-4 rounded-xl border border-white/10 bg-black/40 p-4 md:grid-cols-[1fr_120px_auto] md:items-center">
                  <div>
                    <p className="text-sm uppercase tracking-[0.14em] text-white/45">{item.menuTitle} | {item.service}</p>
                    <h2 className="mt-1 text-2xl font-serif font-semibold text-luxury-accent">{item.itemName}</h2>
                    <p className="mt-2 text-sm text-white/65">{item.description}</p>
                    {item.notes && <p className="mt-2 text-sm text-white/55">Notes: {item.notes}</p>}
                  </div>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-white/75">
                    Quantity
                    <input
                      className="min-h-11 rounded-lg border border-luxury-accent/40 bg-black/40 px-3 py-2 text-white"
                      type="number"
                      min="1"
                      max="99"
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                    />
                  </label>
                  <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                    <p className="text-xl font-bold text-white">{item.price}</p>
                    <button onClick={() => removeItem(item.id)} className="rounded-full border border-red-400/50 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-500 hover:text-white">
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-luxury-accent/20 pt-6 md:flex-row md:items-center md:justify-between">
              <button onClick={clearCart} className="rounded-full border border-white/30 px-6 py-3 font-bold text-white hover:border-luxury-accent hover:text-luxury-accent">
                Clear Cart
              </button>
              <div className="flex flex-col gap-3 md:items-end">
                <p className="text-2xl font-bold text-white">Subtotal ${subtotal.toFixed(2)}</p>
                <Link href="/checkout" className="luxury-cta rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-8 py-3 text-center font-bold text-black">
                  Checkout
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
