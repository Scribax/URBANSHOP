'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const { loginUser } = useShop();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleClose = () => {
    setError('');
    setForm({ email: '', password: '', name: '' });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Error al iniciar sesión');
        }

        const data = await res.json();
        loginUser(data.access_token, data.user);
        handleClose();
      } else {
        // Register flow
        const registerRes = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });

        if (!registerRes.ok) {
          const errData = await registerRes.json();
          throw new Error(errData.message || 'Error al registrarse');
        }

        // Login automatically after registration
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        });

        if (!loginRes.ok) {
          throw new Error('Registro exitoso. Iniciá sesión con tus credenciales.');
        }

        const data = await loginRes.json();
        loginUser(data.access_token, data.user);
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || 'Algo salió mal. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 p-8 space-y-6 shadow-2xl z-10"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Tabs */}
            <div className="flex border-b border-zinc-900 pb-2">
              <button
                onClick={() => { setTab('login'); setError(''); }}
                className={`flex-1 text-center font-display text-base tracking-widest uppercase pb-2 cursor-pointer transition-all ${
                  tab === 'login' ? 'text-white border-b-2 border-white font-bold' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                Ingresar
              </button>
              <button
                onClick={() => { setTab('register'); setError(''); }}
                className={`flex-1 text-center font-display text-base tracking-widest uppercase pb-2 cursor-pointer transition-all ${
                  tab === 'register' ? 'text-white border-b-2 border-white font-bold' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div className="space-y-1">
                  <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest block">Nombre Completo</label>
                  <div className="relative flex items-center border border-zinc-800 focus-within:border-zinc-500 transition-colors bg-zinc-900/40">
                    <User className="w-4 h-4 text-zinc-600 absolute left-3" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="JUAN GÓMEZ"
                      className="w-full bg-transparent text-xs text-white uppercase tracking-widest pl-10 pr-4 py-3 outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest block">Email</label>
                <div className="relative flex items-center border border-zinc-800 focus-within:border-zinc-500 transition-colors bg-zinc-900/40">
                  <Mail className="w-4 h-4 text-zinc-600 absolute left-3" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="CORREO@EJEMPLO.COM"
                    className="w-full bg-transparent text-xs text-white uppercase tracking-widest pl-10 pr-4 py-3 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest block">Contraseña</label>
                <div className="relative flex items-center border border-zinc-800 focus-within:border-zinc-500 transition-colors bg-zinc-900/40">
                  <Lock className="w-4 h-4 text-zinc-600 absolute left-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-xs text-white pl-10 pr-10 py-3 outline-none font-sans"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-600 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-900/40 p-3 text-center">
                  <p className="text-[10px] font-accent text-accent uppercase tracking-wide">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white text-black hover:bg-zinc-200 transition-all font-display text-xs tracking-widest uppercase disabled:opacity-50 cursor-pointer pt-4"
              >
                {loading ? 'PROCESANDO...' : tab === 'login' ? 'INICIAR SESIÓN' : 'REGISTRARSE'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
