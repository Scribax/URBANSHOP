'use client';

import React, { useState, useEffect } from 'react';
import { useShop } from '@/context/ShopContext';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

type Step = 'customer' | 'shipping' | 'confirm';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, user } = useShop();
  const router = useRouter();
  const [step, setStep] = useState<Step>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [customer, setCustomer] = useState({ name: '', email: '' });
  const [shipping, setShipping] = useState({ address: '', city: '', zip: '', phone: '' });

  // Pre-fill customer details if user is logged in
  useEffect(() => {
    if (user) {
      setCustomer((prev) => ({
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate/${couponCode.trim()}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Cupón inválido o expirado');
      }
      const data = await res.json();
      setCoupon(data);
      setCouponSuccess(`¡CUPÓN APLICADO: ${data.code}!`);
    } catch (err: any) {
      setCoupon(null);
      setCouponError(err.message || 'Código de cupón inválido');
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const discountAmount = coupon
    ? coupon.discountType === 'PERCENTAGE'
      ? (cartTotal * coupon.value) / 100
      : coupon.value
    : 0;

  const orderTotal = Math.max(0, cartTotal - discountAmount);

  const steps: Step[] = ['customer', 'shipping', 'confirm'];
  const stepLabels = ['TUS DATOS', 'ENVÍO', 'CONFIRMAR'];
  const currentIndex = steps.indexOf(step);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerDetails: customer,
          shippingAddress: shipping,
          items: orderItems,
          couponCode: coupon ? coupon.code : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al crear el pedido');
      }

      const { order, checkoutUrl } = await res.json();

      // If backend returned real MP link, redirect there, otherwise mock payment
      if (checkoutUrl && !checkoutUrl.includes('mock-payment')) {
        clearCart();
        window.location.href = checkoutUrl;
      } else {
        // Mock payment: simulate a local payment confirmation
        const mockRes = await fetch(`${API_URL}/api/orders/mock-pay/${order.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        clearCart();
        router.push(`/checkout/success?orderId=${order.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pedido. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="bg-zinc-950 min-h-screen text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen gap-6">
          <ShoppingBag className="w-12 h-12 text-zinc-700" />
          <h1 className="font-display text-3xl text-zinc-600 uppercase">CARRITO VACÍO</h1>
          <Link href="/products" className="tape-label">EXPLORAR PRODUCTOS</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-zinc-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <span className="tag-label mb-3 inline-block">CHECKOUT</span>
          <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-white uppercase leading-none">
            FINALIZÁ TU COMPRA
          </h1>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-12">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i <= currentIndex ? 'text-white' : 'text-zinc-700'}`}>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-accent font-bold transition-all ${
                  i < currentIndex ? 'bg-white border-white text-black' : 
                  i === currentIndex ? 'border-white text-white' : 
                  'border-zinc-800 text-zinc-700'
                }`}>
                  {i < currentIndex ? '✓' : i + 1}
                </div>
                <span className="font-accent text-[10px] uppercase tracking-widest hidden sm:inline">{stepLabels[i]}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-3 ${i < currentIndex ? 'bg-zinc-400' : 'bg-zinc-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form Column */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {step === 'customer' && (
                <motion.div
                  key="customer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-2xl text-white uppercase tracking-wider">TUS DATOS</h2>
                  <FormField label="NOMBRE COMPLETO" value={customer.name} onChange={(v) => setCustomer({ ...customer, name: v })} placeholder="Juan García" />
                  <FormField label="EMAIL" type="email" value={customer.email} onChange={(v) => setCustomer({ ...customer, email: v })} placeholder="juan@ejemplo.com" />
                  <NavButtons
                    onNext={() => {
                      if (!customer.name || !customer.email) { setError('Completá todos los campos'); return; }
                      setError(''); setStep('shipping');
                    }}
                    disableBack
                  />
                </motion.div>
              )}

              {step === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-2xl text-white uppercase tracking-wider">DIRECCIÓN DE ENVÍO</h2>
                  <FormField label="DIRECCIÓN" value={shipping.address} onChange={(v) => setShipping({ ...shipping, address: v })} placeholder="Av. Corrientes 1234, Piso 3" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="CIUDAD" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} placeholder="Buenos Aires" />
                    <FormField label="CÓDIGO POSTAL" value={shipping.zip} onChange={(v) => setShipping({ ...shipping, zip: v })} placeholder="C1043" />
                  </div>
                  <FormField label="TELÉFONO" type="tel" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: v })} placeholder="+54 11 1234-5678" />
                  <NavButtons
                    onBack={() => { setError(''); setStep('customer'); }}
                    onNext={() => {
                      if (!shipping.address || !shipping.city || !shipping.zip || !shipping.phone) { setError('Completá todos los campos'); return; }
                      setError(''); setStep('confirm');
                    }}
                  />
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-2xl text-white uppercase tracking-wider">CONFIRMÁ TU PEDIDO</h2>
                  
                  <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-2">
                    <div className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest pb-2 border-b border-zinc-800">TUS DATOS</div>
                    <p className="text-sm font-sans text-zinc-300">{customer.name} — {customer.email}</p>
                    <p className="text-sm font-sans text-zinc-300">{shipping.address}, {shipping.city} ({shipping.zip}) — {shipping.phone}</p>
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-800 p-3">
                      <p className="text-xs font-accent text-red-400 uppercase tracking-wider">{error}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full py-4 bg-white text-black font-display text-sm tracking-widest uppercase hover:bg-zinc-200 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'PROCESANDO...' : 'CONFIRMAR Y PAGAR CON MERCADOPAGO'}
                    </button>
                    <button
                      onClick={() => { setError(''); setStep('shipping'); }}
                      className="flex items-center gap-2 text-zinc-500 hover:text-white font-accent text-xs uppercase tracking-widest cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> VOLVER
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && step !== 'confirm' && (
              <p className="mt-4 text-xs font-accent text-accent uppercase tracking-wider">{error}</p>
            )}
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 border border-zinc-800 p-6 sticky top-28 space-y-4">
              <h3 className="font-display text-lg text-white uppercase tracking-widest">TU ORDEN</h3>
              <div className="spray-sep" />
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-16 bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      {item.image && item.image !== '/images/placeholder.jpg' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display text-sm text-zinc-700">LB</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white uppercase line-clamp-1">{item.name}</p>
                      <p className="text-[10px] font-accent text-zinc-500">{item.size} / {item.color} × {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-white font-accent">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {/* Coupon discount input */}
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <label className="font-accent text-[9px] text-zinc-500 uppercase tracking-widest block">CUPÓN DE DESCUENTO</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="SALE20"
                    disabled={!!coupon}
                    className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-accent text-white uppercase outline-none focus:border-zinc-500 disabled:opacity-50"
                  />
                  {coupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="border border-zinc-700 text-zinc-400 hover:text-white px-3 py-2 text-xs font-accent uppercase cursor-pointer"
                    >
                      QUITAR
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-white text-black hover:bg-zinc-200 px-4 py-2 text-xs font-accent font-bold uppercase cursor-pointer"
                    >
                      APLICAR
                    </button>
                  )}
                </div>
                {couponError && <p className="text-[10px] font-accent text-accent uppercase tracking-wider">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] font-accent text-neon uppercase tracking-wider">{couponSuccess}</p>}
              </div>

              <div className="spray-sep" />
              
              {coupon && (
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="font-accent text-xs uppercase tracking-widest">DESCUENTO ({coupon.code})</span>
                  <span className="font-sans text-sm font-bold">-${discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-1">
                <span className="font-accent text-xs text-zinc-500 uppercase tracking-widest">TOTAL</span>
                <span className="font-display text-2xl text-white">${orderTotal.toLocaleString()}</span>
              </div>
              <p className="text-[9px] font-accent text-zinc-600 uppercase tracking-widest text-center">
                INCLUYE IVA. ENVÍO A CALCULAR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FormField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white text-sm font-sans px-4 py-3 outline-none transition-colors placeholder-zinc-700"
      />
    </div>
  );
}

function NavButtons({ onBack, onNext, disableBack }: { onBack?: () => void; onNext?: () => void; disableBack?: boolean }) {
  return (
    <div className="flex items-center justify-between pt-4">
      {!disableBack && onBack ? (
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white font-accent text-xs uppercase tracking-widest cursor-pointer transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> VOLVER
        </button>
      ) : <div />}
      {onNext && (
        <button onClick={onNext} className="flex items-center gap-3 bg-white text-black font-display text-xs tracking-widest uppercase px-6 py-3 hover:bg-zinc-200 transition-all cursor-pointer">
          CONTINUAR <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
