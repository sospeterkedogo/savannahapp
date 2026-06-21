import Link from 'next/link';
import { useCart } from '../lib/cart';
import { VahaButton, VahaCta, VahaPageShell, VahaPanel, vahaInputClass } from '../components/vaha/VahaUI';

export default function Cart() {
  const { items, count, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <VahaPageShell>
      <div className="vaha-container flex flex-col gap-4 py-6">
        <VahaPanel eyebrow="Cart" title="Your Order" description={`${count} item${count === 1 ? '' : 's'} ready for checkout.`} />

        {items.length === 0 ? (
          <VahaPanel className="text-center">
            <p className="text-vaha-muted">Your cart is empty.</p>
            <VahaCta href="/menu" variant="solid" className="mt-6">
              Browse Menu
            </VahaCta>
          </VahaPanel>
        ) : (
          <VahaPanel>
            <div className="mt-4 grid gap-3">
              {items.map((item) => (
                <article key={item.id} className="grid gap-3 border border-white/10 bg-vaha-ink p-4 md:grid-cols-[1fr_120px_auto] md:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-vaha-muted">{item.menuTitle} | {item.service}</p>
                    <h2 className="mt-1 font-serif text-2xl text-vaha-cream">{item.itemName}</h2>
                    <p className="mt-2 text-sm text-vaha-muted">{item.description}</p>
                    {item.notes ? <p className="mt-2 text-sm text-vaha-muted/80">Notes: {item.notes}</p> : null}
                  </div>
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-vaha-muted">
                    Qty
                    <input
                      className={vahaInputClass}
                      type="number"
                      min="1"
                      max="99"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                      aria-label={`Quantity for ${item.itemName}`}
                    />
                  </label>
                  <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                    <p className="text-lg font-semibold text-vaha-gold">{item.price}</p>
                    <VahaButton variant="ghost" onClick={() => removeItem(item.id)}>
                      Remove
                    </VahaButton>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
              <VahaButton variant="outline" onClick={clearCart}>
                Clear Cart
              </VahaButton>
              <div className="flex flex-col gap-3 md:items-end">
                <p className="font-serif text-2xl text-vaha-cream">Subtotal £{subtotal.toFixed(2)}</p>
                <VahaCta href="/checkout" variant="solid">
                  Checkout
                </VahaCta>
              </div>
            </div>
          </VahaPanel>
        )}
      </div>
    </VahaPageShell>
  );
}
