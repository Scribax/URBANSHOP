'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, ArrowUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await fetch(`${API_URL}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setSubmitted(true);
        setEmail('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Upper footer grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-zinc-900">
          
          {/* Newsletter Column */}
          <div className="lg:col-span-6 space-y-6">
            <span className="tape-label">SUSCRIBITE AL DROP</span>
            <h3 className="font-display text-4xl text-white uppercase tracking-wider leading-none">
              ENTERATE PRIMERO. <br />
              CONSEGUÍ EL ACCESO EXCLUSIVO.
            </h3>
            <p className="font-sans text-xs text-zinc-400 max-w-sm uppercase tracking-wide">
              No enviamos spam. Solo coordenadas de nuevos drops, colaboraciones limitadas y códigos de descuento para miembros del barrio.
            </p>
            
            {submitted ? (
              <div className="bg-zinc-900 border border-zinc-850 p-4 inline-block">
                <span className="font-accent text-xs font-bold text-neon uppercase tracking-widest">
                  ✔ BIENVENIDO A LA CULTURA LATIN BROÚ. REVISÁ TU CORREO.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-md border border-zinc-800 focus-within:border-zinc-500 transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="TU EMAIL ACÁ"
                  className="flex-1 bg-transparent px-4 py-3 text-xs uppercase tracking-widest font-accent text-white placeholder-zinc-600 outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-white text-black p-3 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Navigation Links Column */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-5 lg:col-start-8">
            <div className="space-y-4">
              <h4 className="font-accent text-[11px] font-bold text-zinc-500 uppercase tracking-widest">NUESTROS DROP</h4>
              <ul className="space-y-2 text-xs uppercase tracking-widest font-accent">
                <li><Link href="/products" className="text-zinc-400 hover:text-white transition-colors">Remeras Oversized</Link></li>
                <li><Link href="/products" className="text-zinc-400 hover:text-white transition-colors">Hoodies & Crewnecks</Link></li>
                <li><Link href="/products" className="text-zinc-400 hover:text-white transition-colors">Pantalones Cargo</Link></li>
                <li><Link href="/products" className="text-zinc-400 hover:text-white transition-colors">Colección Invierno</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-accent text-[11px] font-bold text-zinc-500 uppercase tracking-widest">INFORMACIÓN</h4>
              <ul className="space-y-2 text-xs uppercase tracking-widest font-accent">
                <li><Link href="/#history" className="text-zinc-400 hover:text-white transition-colors">Sobre la Marca</Link></li>
                <li><Link href="/products" className="text-zinc-400 hover:text-white transition-colors">Tabla de Talles</Link></li>
                <li><Link href="/products" className="text-zinc-400 hover:text-white transition-colors">Cambios & Devoluciones</Link></li>
                <li><Link href="/admin" className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">Portal Admin</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Lower footer */}
        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <span className="font-display text-xl tracking-widest text-zinc-700">LATIN BROÚ</span>
            <span className="text-zinc-800 hidden md:inline">|</span>
            <p className="text-[10px] font-accent text-zinc-500 uppercase tracking-widest">
              © 2026 LATIN BROÚ. HECHO EN LATINOAMÉRICA. TODOS LOS DERECHOS RESERVADOS.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="tag-label">ORIGEN LATINO</span>
            <button
              onClick={scrollToTop}
              className="p-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white transition-all cursor-pointer rounded-full"
              title="Volver Arriba"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
