'use client';

import React, { useState, useEffect } from 'react';
import { useShop } from '@/context/ShopContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  ShoppingBag, 
  LogOut, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function ProfilePage() {
  const { token, user, logoutUser } = useShop();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!token) {
      router.push('/');
      return;
    }

    setLoading(true);
    fetch(`${API_URL}/api/orders/user/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar pedidos');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token, router]);

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Helper to format status translations
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return { text: 'PENDIENTE DE PAGO', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' };
      case 'PAID': return { text: 'PAGO APROBADO / PREPARANDO', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
      case 'SHIPPED': return { text: 'DESPACHADO / EN CAMINO', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' };
      case 'DELIVERED': return { text: 'ENTREGADO', color: 'text-neon bg-neon/10 border-neon/20' };
      case 'CANCELLED': return { text: 'CANCELADO', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
      default: return { text: status, color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20' };
    }
  };

  if (!token) return null;

  return (
    <main className="bg-zinc-950 min-h-screen text-white flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-zinc-900 pb-8">
            <div>
              <span className="tag-label mb-2 inline-block">CLIENTE MIEMBRO</span>
              <h1 className="font-display text-4xl text-white uppercase tracking-wider leading-none">Mi Perfil</h1>
              <p className="font-accent text-[11px] text-zinc-500 uppercase tracking-widest mt-2">
                Bienvenido al barrio, <span className="text-white font-bold">{user?.name}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white font-display text-[10px] tracking-widest uppercase px-4 py-2.5 transition-all cursor-pointer self-start"
            >
              <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Data Sidebar */}
            <div className="space-y-4 md:col-span-1">
              <div className="bg-zinc-900/40 border border-zinc-900 p-6 space-y-4">
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center rounded-full">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="font-accent text-[9px] text-zinc-500 uppercase tracking-widest block">Nombre</span>
                  <p className="text-sm font-bold uppercase text-white">{user?.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-accent text-[9px] text-zinc-500 uppercase tracking-widest block">Email</span>
                  <p className="text-sm text-zinc-300 font-sans">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Orders History Main Column */}
            <div className="space-y-6 md:col-span-2">
              <h2 className="font-display text-2xl text-white uppercase tracking-wider">Historial de Pedidos</h2>

              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="font-display text-zinc-700 animate-pulse text-lg tracking-widest">CARGANDO HISTORIAL...</div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 border border-zinc-900 space-y-4 bg-zinc-900/10">
                  <ShoppingBag className="w-12 h-12 text-zinc-800 mx-auto" />
                  <div className="space-y-1">
                    <p className="font-accent text-xs text-zinc-500 uppercase tracking-widest">Aún no realizaste ningún pedido.</p>
                    <p className="font-sans text-[11px] text-zinc-600 uppercase">Tus compras con el email {user?.email} aparecerán acá.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusInfo = getStatusLabel(order.status);
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <div key={order.id} className="bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 transition-colors">
                        {/* Summary Row */}
                        <div 
                          onClick={() => toggleExpand(order.id)}
                          className="p-5 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-sm tracking-wider text-white uppercase">{order.orderNumber}</span>
                              <span className={`text-[9px] font-accent px-2 py-0.5 border ${statusInfo.color} font-bold rounded-sm tracking-wider`}>
                                {statusInfo.text}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 font-accent">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} ITEMS</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-display text-lg text-white">${order.total.toLocaleString()}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                          </div>
                        </div>

                        {/* Expandable Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden border-t border-zinc-900 bg-zinc-950/40"
                            >
                              <div className="p-5 space-y-6">
                                {/* Order Tracker Timeline */}
                                <div className="space-y-3">
                                  <span className="font-accent text-[9px] text-zinc-500 uppercase tracking-widest block">SEGUIMIENTO DEL DROP</span>
                                  <div className="grid grid-cols-4 gap-2 pt-2 relative">
                                    <div className="absolute top-4 left-[12.5%] right-[12.5%] h-[2px] bg-zinc-800 -z-10" />
                                    
                                    <TrackerStep 
                                      active={true} 
                                      icon={<Clock className="w-4 h-4" />} 
                                      label="RECIBIDO" 
                                    />
                                    <TrackerStep 
                                      active={['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status)} 
                                      icon={<Package className="w-4 h-4" />} 
                                      label="PREPARANDO" 
                                    />
                                    <TrackerStep 
                                      active={['SHIPPED', 'DELIVERED'].includes(order.status)} 
                                      icon={<Truck className="w-4 h-4" />} 
                                      label="EN CAMINO" 
                                    />
                                    <TrackerStep 
                                      active={order.status === 'DELIVERED'} 
                                      icon={<CheckCircle2 className="w-4 h-4" />} 
                                      label="ENTREGADO" 
                                    />
                                  </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-3">
                                  <span className="font-accent text-[9px] text-zinc-500 uppercase tracking-widest block">PRENDAS</span>
                                  <div className="space-y-2">
                                    {order.items.map((item: any) => (
                                      <div key={item.id} className="flex items-center gap-3 bg-zinc-900/30 p-2.5 border border-zinc-900/50">
                                        <div className="w-10 h-12 bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0 overflow-hidden">
                                          {item.product?.images?.[0] ? (
                                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                          ) : (
                                            <span className="font-display text-xs text-zinc-700">LB</span>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-bold text-white uppercase truncate">{item.product?.name || 'Prenda Descatalogada'}</p>
                                          <p className="text-[10px] font-accent text-zinc-500">{item.size} / {item.color} × {item.quantity}</p>
                                        </div>
                                        <span className="text-xs font-accent text-white font-bold">${(item.price * item.quantity).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                  <div className="space-y-1">
                                    <span className="font-accent text-[9px] text-zinc-500 uppercase tracking-widest block">DIRECCIÓN DE ENTREGA</span>
                                    <p className="text-xs text-zinc-300 font-sans">{order.shippingAddress?.address}, {order.shippingAddress?.city} ({order.shippingAddress?.zip})</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-accent text-[9px] text-zinc-500 uppercase tracking-widest block">CONTACTO</span>
                                    <p className="text-xs text-zinc-300 font-sans">{order.shippingAddress?.phone}</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function TrackerStep({ active, icon, label }: { active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-1">
      <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
        active ? 'bg-white border-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'bg-zinc-950 border-zinc-800 text-zinc-700'
      }`}>
        {icon}
      </div>
      <span className={`font-accent text-[8px] tracking-wider uppercase ${active ? 'text-white font-bold' : 'text-zinc-600'}`}>{label}</span>
    </div>
  );
}
