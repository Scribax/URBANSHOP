'use client';

import React from 'react';
import { useShop } from '@/context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQuantity, removeFromCart, cartTotal } = useShop();

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-zinc-950 border-l border-zinc-800 p-6 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-white" />
                <h2 className="text-xl font-display uppercase tracking-widest text-white">TU ORDEN</h2>
              </div>
              <button 
                onClick={() => setCartOpen(false)} 
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items list */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-accent text-sm tracking-wider uppercase text-zinc-300">CARRITO VACÍO</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">NADA POR ACÁ. EXPRESÁ TU IDENTIDAD CON LAS MEJORES PRENDAS.</p>
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="tape-label cursor-pointer text-xs mt-2"
                  >
                    EXPLORAR DROPS
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 p-3 bg-zinc-900/40 border border-zinc-900 rounded-sm"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-24 bg-zinc-900 relative shrink-0 overflow-hidden border border-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Item Description */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-sans font-bold text-sm text-white uppercase tracking-wider line-clamp-1">{item.name}</h4>
                          <span className="font-accent text-xs font-bold text-white">${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 border border-zinc-800 uppercase tracking-widest font-accent">
                            TALLE: {item.size}
                          </span>
                          <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 border border-zinc-800 uppercase tracking-widest font-accent">
                            COLOR: {item.color}
                          </span>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-zinc-800 bg-zinc-900 rounded-sm">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-white text-zinc-400 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-accent font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-white text-zinc-400 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-500 hover:text-accent transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="pt-6 border-t border-zinc-800 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="font-accent text-xs text-zinc-400 uppercase tracking-widest">TOTAL ESTIMADO</span>
                  <span className="font-display text-2xl text-white">${cartTotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest text-center">
                  ENVÍOS A TODO EL PAÍS. SELECCIÓN DE TALLES DE VENTA EXCLUSIVA.
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="block w-full py-4 text-center bg-white text-black font-display text-sm tracking-widest uppercase hover:bg-zinc-200 transition-all font-bold"
                >
                  FINALIZAR COMPRA
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
