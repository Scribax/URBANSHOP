'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { ShoppingBag, Heart, Menu, X, Trash2, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { cartCount, wishlist, toggleWishlist, addToCart, setCartOpen, user, logoutUser } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo - Aggressive Typography */}
        <Link href="/" className="flex items-center gap-1 group select-none">
          <span className="font-display text-2xl tracking-widest text-white transition-all group-hover:tracking-[0.15em]">
            LATIN BROÚ
          </span>
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse self-end mb-2" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/products" className="font-accent text-xs font-bold tracking-widest text-zinc-400 hover:text-white transition-colors uppercase">
            PRODUCTOS
          </Link>
          <span className="text-zinc-800">/</span>
          <Link href="/#collections" className="font-accent text-xs font-bold tracking-widest text-zinc-400 hover:text-white transition-colors uppercase">
            COLECCIONES
          </Link>
          <span className="text-zinc-800">/</span>
          <Link href="/#history" className="font-accent text-xs font-bold tracking-widest text-zinc-400 hover:text-white transition-colors uppercase">
            CULTURA
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Admin panel link if logged in */}
          {user?.isAdmin && (
            <Link 
              href="/admin" 
              className="text-zinc-400 hover:text-neon transition-colors p-2 flex items-center gap-1"
              title="Admin Dashboard"
            >
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-accent font-bold uppercase hidden lg:inline tracking-wider">PANEL</span>
            </Link>
          )}

          {/* Wishlist Trigger */}
          <div className="relative">
            <button
              onClick={() => setWishlistOpen(!wishlistOpen)}
              className="text-zinc-400 hover:text-white transition-colors p-2 cursor-pointer relative"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent rounded-full" />
              )}
            </button>

            {/* Wishlist Dropdown Box */}
            <AnimatePresence>
              {wishlistOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setWishlistOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-zinc-950 border border-zinc-850 p-4 z-20 shadow-2xl rounded-sm"
                  >
                    <h3 className="font-accent text-xs font-bold tracking-widest text-white uppercase pb-2 border-b border-zinc-900 flex justify-between">
                      <span>FAVORITOS ({wishlist.length})</span>
                      <button onClick={() => setWishlistOpen(false)} className="text-zinc-500 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </h3>
                    <div className="max-h-60 overflow-y-auto py-2 space-y-3">
                      {wishlist.length === 0 ? (
                        <p className="text-[10px] text-zinc-500 text-center py-4 uppercase font-accent">SIN FAVORITOS AÚN</p>
                      ) : (
                        wishlist.map((item) => (
                          <div key={item.id} className="flex gap-3 items-center justify-between text-xs">
                            <div className="flex gap-2 items-center">
                              <div className="w-8 h-10 bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.images[0] || '/images/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-bold text-white uppercase text-[11px] line-clamp-1">{item.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  addToCart(item, item.sizes[0] || 'M', item.colors[0] || 'Black');
                                  toggleWishlist(item);
                                }}
                                className="text-[10px] font-accent text-zinc-300 hover:text-white border border-zinc-800 px-2 py-1 bg-zinc-900"
                              >
                                AGREGAR
                              </button>
                              <button onClick={() => toggleWishlist(item)} className="text-zinc-500 hover:text-accent">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Button */}
          <div className="relative">
            {user ? (
              <Link
                href={user.isAdmin ? "/admin" : "/profile"}
                className="text-zinc-400 hover:text-white transition-colors p-2 flex items-center gap-1.5"
                title="Mi Perfil"
              >
                <User className="w-4 h-4" />
                <span className="text-[10px] font-accent font-bold uppercase hidden lg:inline tracking-wider max-w-[60px] truncate">{user.name?.split(' ')[0] || 'PERFIL'}</span>
              </Link>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-zinc-400 hover:text-white transition-colors p-2 cursor-pointer"
                title="Ingresar / Registrarse"
              >
                <User className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Shopping Bag Trigger */}
          <button
            onClick={() => setCartOpen(true)}
            className="text-zinc-400 hover:text-white transition-colors p-2 cursor-pointer relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-accent font-black rounded-full w-4.5 h-4.5 flex items-center justify-center border border-zinc-950">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu Slideout */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-zinc-950 z-50 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
                <span className="font-display text-xl tracking-widest text-white">LATIN BROÚ</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-6 py-8">
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display text-3xl tracking-wider text-zinc-300 hover:text-white uppercase"
                >
                  PRODUCTOS
                </Link>
                <Link
                  href="/#collections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display text-3xl tracking-wider text-zinc-300 hover:text-white uppercase"
                >
                  COLECCIONES
                </Link>
                <Link
                  href="/#history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display text-3xl tracking-wider text-zinc-300 hover:text-white uppercase"
                >
                  CULTURA
                </Link>
              </nav>
            </div>
            
            <div className="border-t border-zinc-900 pt-6 space-y-4">
              <span className="tag-label">DROP 01 - COLOQUIAL</span>
              <p className="text-[10px] text-zinc-600 font-accent uppercase tracking-widest">
                BUENOS AIRES - SANTIAGO - SÃO PAULO - CDMX
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
