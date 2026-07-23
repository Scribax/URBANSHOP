'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <main className="bg-zinc-950 min-h-screen text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full text-center space-y-8"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-neon" />
          </div>
        </div>

        <div className="space-y-3">
          <span className="tag-label">PEDIDO CONFIRMADO</span>
          <h1 className="font-display text-[clamp(3rem,8vw,5rem)] text-white uppercase leading-none mt-4">
            ¡GRACIAS POR<br />TU COMPRA!
          </h1>
          <p className="font-sans text-sm text-zinc-400">
            Tu pedido fue procesado exitosamente. Recibirás un email de confirmación en breve.
          </p>
          {orderId && (
            <p className="font-accent text-xs text-zinc-600 uppercase tracking-widest">
              PEDIDO #{orderId.slice(-8).toUpperCase()}
            </p>
          )}
        </div>

        <div className="spray-sep" />

        <div className="space-y-3">
          <p className="font-accent text-xs text-zinc-500 uppercase tracking-widest">
            LA CULTURA PRIMERO. LA MODA DESPUÉS.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-black font-display text-xs tracking-widest uppercase px-6 py-3 hover:bg-zinc-200 transition-all"
            >
              SEGUIR COMPRANDO
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-zinc-800 text-white font-display text-xs tracking-widest uppercase px-6 py-3 hover:border-white transition-all"
            >
              INICIO
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
