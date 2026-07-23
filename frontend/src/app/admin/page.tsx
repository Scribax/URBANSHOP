'use client';

import React, { useState, useEffect } from 'react';
import { useShop } from '@/context/ShopContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, FolderOpen, ShoppingCart,
  Users, Ticket, Image, Settings, LogOut, Menu, X,
  TrendingUp, DollarSign, Archive, AlertTriangle, ChevronRight,
  Plus, Pencil, Trash2, Save, Eye, EyeOff, UploadCloud
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'DASHBOARD', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'products', label: 'PRODUCTOS', icon: <Package className="w-4 h-4" /> },
  { id: 'categories', label: 'CATEGORÍAS', icon: <Tag className="w-4 h-4" /> },
  { id: 'collections', label: 'COLECCIONES', icon: <FolderOpen className="w-4 h-4" /> },
  { id: 'orders', label: 'PEDIDOS', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'coupons', label: 'CUPONES', icon: <Ticket className="w-4 h-4" /> },
  { id: 'newsletter', label: 'NEWSLETTER', icon: <Users className="w-4 h-4" /> },
  { id: 'settings', label: 'CONFIGURACIÓN', icon: <Settings className="w-4 h-4" /> },
];

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">{label}</span>
        <div className="text-zinc-600">{icon}</div>
      </div>
      <div className="font-display text-3xl text-white">{value}</div>
      {sub && <div className="font-accent text-[10px] text-zinc-600 uppercase tracking-widest">{sub}</div>}
    </div>
  );
}

function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <span className="tag-label mb-3 inline-block">OVERVIEW</span>
        <h2 className="font-display text-4xl text-white uppercase">PANEL DE CONTROL</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Ventas Totales" value="$0" sub="Comenzá a vender" />
        <StatCard icon={<ShoppingCart className="w-5 h-5" />} label="Pedidos" value="0" sub="Esta semana" />
        <StatCard icon={<Package className="w-5 h-5" />} label="Productos" value="0" sub="En catálogo" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Suscriptores" value="0" sub="Newsletter" />
      </div>
      <div className="bg-zinc-900 border border-zinc-800 p-6">
        <h3 className="font-display text-xl text-white uppercase mb-4">ACTIVIDAD RECIENTE</h3>
        <div className="flex items-center justify-center h-32 text-zinc-700">
          <div className="text-center space-y-2">
            <TrendingUp className="w-8 h-8 mx-auto" />
            <p className="font-accent text-xs uppercase tracking-widest">AÚN SIN ACTIVIDAD. AGREGÁ PRODUCTOS PARA COMENZAR.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsPanel({ token }: { token: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sizes: '',
    colors: '',
    isActive: true,
    categoryId: '',
    collectionId: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetch_ = () => {
    setLoading(true);
    fetch(`${API_URL}/api/products/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchMetadata = () => {
    fetch(`${API_URL}/api/categories`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); });

    fetch(`${API_URL}/api/collections/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCollections(data); });
  };

  useEffect(() => {
    fetch_();
    fetchMetadata();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `${API_URL}/api/products/${editing.id}` : `${API_URL}/api/products`;
    const method = editing ? 'PUT' : 'POST';
    const body = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
      images: images,
      categoryId: form.categoryId || null,
      collectionId: form.collectionId || null,
    };

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    fetch_();
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', description: '', price: '', stock: '', sizes: '', colors: '', isActive: true, categoryId: '', collectionId: '' });
    setImages([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar producto?')) return;
    await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetch_();
  };

  const startEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      sizes: p.sizes.join(', '),
      colors: p.colors.join(', '),
      isActive: p.isActive,
      categoryId: p.categoryId || '',
      collectionId: p.collectionId || ''
    });
    setImages(p.images || []);
    setShowForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [...images];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/api/products/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            uploaded.push(data.url);
          }
        }
      }
      setImages(uploaded);
    } catch (err) {
      alert('Error al subir archivos');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="tag-label mb-2 inline-block">CATÁLOGO</span>
          <h2 className="font-display text-3xl text-white uppercase">PRODUCTOS</h2>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', description: '', price: '', stock: '', sizes: '', colors: '', isActive: true, categoryId: '', collectionId: '' }); setImages([]); }} className="flex items-center gap-2 bg-white text-black font-display text-xs tracking-widest uppercase px-4 py-2 hover:bg-zinc-200 transition-all cursor-pointer">
          <Plus className="w-4 h-4" /> NUEVO PRODUCTO
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-700 p-6 space-y-4">
          <h3 className="font-display text-xl text-white uppercase">{editing ? 'EDITAR' : 'NUEVO'} PRODUCTO</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[['NOMBRE', 'name', 'text'], ['PRECIO (ARS)', 'price', 'number'], ['STOCK', 'stock', 'number']].map(([label, field, type]) => (
              <div key={field} className="space-y-1">
                <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">{label}</label>
                <input type={type} value={(form as any)[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500" required />
              </div>
            ))}
            <div className="space-y-1">
              <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">TALLES (separados por coma)</label>
              <input value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500" required />
            </div>
            <div className="space-y-1">
              <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">COLORES (separados por coma)</label>
              <input value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} placeholder="Negro, Blanco" className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500" required />
            </div>
            <div className="space-y-1">
              <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Categoría</label>
              <select
                value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500 cursor-pointer"
              >
                <option value="">Sin Categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Colección</label>
              <select
                value={form.collectionId}
                onChange={e => setForm({ ...form, collectionId: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500 cursor-pointer"
              >
                <option value="">Sin Colección</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
              </select>
            </div>
            
            {/* Multi-Image upload dropzone with previews */}
            <div className="space-y-2 md:col-span-3">
              <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest block">Imágenes del Producto</label>
              
              {images.length > 0 && (
                <div className="flex gap-4 flex-wrap mb-3">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 bg-zinc-800 border border-zinc-700 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 cursor-pointer transition-colors shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/60 p-6 text-center transition-colors cursor-pointer group">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={uploading}
                />
                <div className="space-y-2">
                  <UploadCloud className="w-8 h-8 text-zinc-500 group-hover:text-white mx-auto transition-colors" />
                  <p className="font-display text-xs text-white uppercase tracking-widest">
                    {uploading ? 'SUBIENDO IMÁGENES...' : 'HACÉ CLICK O ARRASTRÁ FOTOS LOCALES'}
                  </p>
                  <p className="font-accent text-[10px] text-zinc-600 uppercase tracking-widest">
                    SOPORTA PNG, JPG, WEBP (SELECCIÓN MÚLTIPLE)
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">DESCRIPCIÓN</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500 resize-none" required />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="pActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-black focus:ring-0" />
            <label htmlFor="pActive" className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest select-none cursor-pointer">Producto Visible en Catálogo</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex items-center gap-2 bg-white text-black font-display text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-zinc-200 transition-all cursor-pointer"><Save className="w-4 h-4" /> GUARDAR</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="border border-zinc-700 text-zinc-400 font-display text-xs tracking-widest uppercase px-5 py-2.5 hover:text-white hover:border-zinc-500 transition-all cursor-pointer">CANCELAR</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32 text-zinc-700">
          <div className="font-display text-xl animate-pulse uppercase">CARGANDO...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border border-zinc-800 space-y-3">
          <Package className="w-10 h-10 text-zinc-700 mx-auto" />
          <p className="font-accent text-xs text-zinc-600 uppercase tracking-widest">SIN PRODUCTOS. CREÁ EL PRIMERO.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['NOMBRE', 'PRECIO', 'STOCK', 'TALLES', 'ESTADO', ''].map(h => (
                  <th key={h} className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 pr-4 font-sans font-bold text-sm text-white uppercase">{p.name}</td>
                  <td className="py-3 pr-4 font-accent text-sm text-zinc-300">${p.price.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span className={`font-accent text-[10px] px-2 py-1 uppercase tracking-widest ${p.stock <= 5 ? 'bg-red-900/30 text-red-400' : 'bg-zinc-900 text-zinc-400'}`}>{p.stock}</span>
                  </td>
                  <td className="py-3 pr-4 font-accent text-xs text-zinc-500">{p.sizes.join(', ')}</td>
                  <td className="py-3 pr-4">
                    <span className={`font-accent text-[10px] uppercase tracking-widest ${p.isActive ? 'text-neon' : 'text-zinc-600'}`}>{p.isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                  </td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => startEdit(p)} className="p-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-zinc-500 hover:text-accent transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrdersPanel({ token }: { token: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const STATUS_STYLES: Record<string, string> = {
    PENDING: 'text-yellow-400', PAID: 'text-neon', SHIPPED: 'text-blue-400',
    DELIVERED: 'text-zinc-400', CANCELLED: 'text-accent',
  };

  useEffect(() => {
    fetch(`${API_URL}/api/orders/admin/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setOrders(data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${API_URL}/api/orders/admin/${id}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="tag-label mb-2 inline-block">GESTIÓN</span>
        <h2 className="font-display text-3xl text-white uppercase">PEDIDOS</h2>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-32 text-zinc-700"><div className="font-display text-xl animate-pulse">CARGANDO...</div></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border border-zinc-800 space-y-3">
          <ShoppingCart className="w-10 h-10 text-zinc-700 mx-auto" />
          <p className="font-accent text-xs text-zinc-600 uppercase tracking-widest">AÚN NO HAY PEDIDOS.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['PEDIDO', 'CLIENTE', 'TOTAL', 'ESTADO', 'FECHA', 'ACCIÓN'].map(h => (
                  <th key={h} className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {orders.map(order => {
                const details = order.customerDetails as any;
                return (
                  <tr key={order.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 pr-4 font-accent text-xs text-zinc-300">{order.orderNumber}</td>
                    <td className="py-3 pr-4 font-sans text-sm text-zinc-300">{details?.name || 'N/A'}</td>
                    <td className="py-3 pr-4 font-accent text-sm font-bold text-white">${order.total.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`font-display text-xs ${STATUS_STYLES[order.status] || 'text-zinc-400'}`}>{order.status}</span>
                    </td>
                    <td className="py-3 pr-4 font-accent text-[10px] text-zinc-500">{new Date(order.createdAt).toLocaleDateString('es-AR')}</td>
                    <td className="py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-white text-[10px] font-accent uppercase px-2 py-1 outline-none cursor-pointer"
                      >
                        {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LoginPanel({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [email, setEmail] = useState('admin@latinbrou.com');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
      if (!data.user?.isAdmin) throw new Error('Acceso restringido al panel de administración');
      onLogin(data.access_token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-zinc-950 min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md space-y-8"
      >
        <div>
          <span className="tag-label mb-3 inline-block">ADMINISTRACIÓN</span>
          <h1 className="font-display text-5xl text-white uppercase">PANEL DE<br />CONTROL</h1>
          <p className="font-accent text-xs text-zinc-500 mt-3 uppercase tracking-widest">ACCESO RESTRINGIDO</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white text-sm px-4 py-3 outline-none transition-colors"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">CONTRASEÑA</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white text-sm px-4 py-3 pr-10 outline-none transition-colors"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs font-accent text-accent uppercase tracking-wider">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-display text-sm tracking-widest uppercase hover:bg-zinc-200 transition-all disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? 'INGRESANDO...' : 'INGRESAR AL PANEL'}
          </button>
        </form>

        <div className="bg-zinc-900 border border-zinc-800 p-4">
          <p className="font-accent text-[10px] text-zinc-600 uppercase tracking-widest">
            CREDENCIALES POR DEFECTO: admin@latinbrou.com / admin_latinbrou_2026
          </p>
        </div>
      </motion.div>
    </main>
  );
}

function CategoriesPanel({ token }: { token: string }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState('');

  const fetchCategories = () => {
    fetch(`${API_URL}/api/categories`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const url = editing ? `${API_URL}/api/categories/${editing.id}` : `${API_URL}/api/categories`;
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });

    if (res.ok) {
      fetchCategories();
      setShowForm(false);
      setEditing(null);
      setName('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar categoría? Los productos asociados se desvincularán.')) return;
    await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="tag-label mb-2 inline-block">CLASIFICACIÓN</span>
          <h2 className="font-display text-3xl text-white uppercase">CATEGORÍAS</h2>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setName(''); }}
          className="flex items-center gap-2 bg-white text-black font-display text-xs tracking-widest uppercase px-4 py-2 hover:bg-zinc-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> NUEVA CATEGORÍA
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-700 p-6 space-y-4 max-w-md">
          <h3 className="font-display text-xl text-white uppercase">{editing ? 'EDITAR' : 'NUEVA'} CATEGORÍA</h3>
          <div className="space-y-1">
            <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Nombre de Categoría</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex items-center gap-2 bg-white text-black font-display text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-zinc-200 transition-all cursor-pointer">
              <Save className="w-4 h-4" /> GUARDAR
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="border border-zinc-700 text-zinc-400 font-display text-xs tracking-widest uppercase px-5 py-2.5 hover:text-white hover:border-zinc-500 transition-all cursor-pointer">
              CANCELAR
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32 text-zinc-700"><div className="font-display text-xl animate-pulse">CARGANDO...</div></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 border border-zinc-800 space-y-3">
          <Tag className="w-10 h-10 text-zinc-700 mx-auto" />
          <p className="font-accent text-xs text-zinc-600 uppercase tracking-widest">SIN CATEGORÍAS. CREÁ LA PRIMERA.</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-w-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">NOMBRE</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">SLUG</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 pr-4 font-sans font-bold text-sm text-white uppercase">{c.name}</td>
                  <td className="py-3 pr-4 font-accent text-xs text-zinc-500">{c.slug}</td>
                  <td className="py-3 flex gap-2 justify-end">
                    <button onClick={() => { setEditing(c); setName(c.name); setShowForm(true); }} className="p-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-zinc-500 hover:text-accent transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CollectionsPanel({ token }: { token: string }) {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', bannerImage: '', isActive: true });

  const fetchCollections = () => {
    fetch(`${API_URL}/api/collections/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCollections(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCollections(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const url = editing ? `${API_URL}/api/collections/${editing.id}` : `${API_URL}/api/collections`;
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      fetchCollections();
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', description: '', bannerImage: '', isActive: true });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar colección?')) return;
    await fetch(`${API_URL}/api/collections/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCollections();
  };

  const startEdit = (c: any) => {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description || '',
      bannerImage: c.bannerImage || '',
      isActive: c.isActive
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="tag-label mb-2 inline-block">LANZAMIENTOS</span>
          <h2 className="font-display text-3xl text-white uppercase">COLECCIONES</h2>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', description: '', bannerImage: '', isActive: true }); }}
          className="flex items-center gap-2 bg-white text-black font-display text-xs tracking-widest uppercase px-4 py-2 hover:bg-zinc-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> NUEVA COLECCIÓN
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-700 p-6 space-y-4 max-w-lg">
          <h3 className="font-display text-xl text-white uppercase">{editing ? 'EDITAR' : 'NUEVA'} COLECCIÓN</h3>
          <div className="space-y-1">
            <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500 resize-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">URL de Imagen Banner (opcional)</label>
            <input
              type="text"
              value={form.bannerImage}
              onChange={e => setForm({ ...form, bannerImage: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={e => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-black focus:ring-0"
            />
            <label htmlFor="isActive" className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest select-none cursor-pointer">Colección Activa</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex items-center gap-2 bg-white text-black font-display text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-zinc-200 transition-all cursor-pointer">
              <Save className="w-4 h-4" /> GUARDAR
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="border border-zinc-700 text-zinc-400 font-display text-xs tracking-widest uppercase px-5 py-2.5 hover:text-white hover:border-zinc-500 transition-all cursor-pointer">
              CANCELAR
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32 text-zinc-700"><div className="font-display text-xl animate-pulse">CARGANDO...</div></div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16 border border-zinc-800 space-y-3">
          <FolderOpen className="w-10 h-10 text-zinc-700 mx-auto" />
          <p className="font-accent text-xs text-zinc-600 uppercase tracking-widest">SIN COLECCIONES. CREÁ LA PRIMERA.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">NOMBRE</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">SLUG</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">DESCRIPCIÓN</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">ESTADO</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {collections.map(c => (
                <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 pr-4 font-sans font-bold text-sm text-white uppercase">{c.name}</td>
                  <td className="py-3 pr-4 font-accent text-xs text-zinc-500">{c.slug}</td>
                  <td className="py-3 pr-4 font-sans text-xs text-zinc-400 line-clamp-1 max-w-[200px] mt-1.5">{c.description || '-'}</td>
                  <td className="py-3 pr-4">
                    <span className={`font-accent text-[10px] uppercase tracking-widest ${c.isActive ? 'text-neon' : 'text-zinc-600'}`}>{c.isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                  </td>
                  <td className="py-3 flex gap-2 justify-end">
                    <button onClick={() => startEdit(c)} className="p-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-zinc-500 hover:text-accent transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CouponsPanel({ token }: { token: string }) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    value: '',
    isActive: true,
    expiryDate: ''
  });

  const fetchCoupons = () => {
    setLoading(true);
    fetch(`${API_URL}/api/coupons/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCoupons(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;

    const url = editing ? `${API_URL}/api/coupons/${editing.id}` : `${API_URL}/api/coupons`;
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...form,
        value: parseFloat(form.value),
        expiryDate: form.expiryDate ? form.expiryDate : null
      })
    });

    if (res.ok) {
      fetchCoupons();
      setShowForm(false);
      setEditing(null);
      setForm({ code: '', discountType: 'PERCENTAGE', value: '', isActive: true, expiryDate: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar cupón?')) return;
    await fetch(`${API_URL}/api/coupons/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCoupons();
  };

  const startEdit = (c: any) => {
    setEditing(c);
    setForm({
      code: c.code,
      discountType: c.discountType,
      value: String(c.value),
      isActive: c.isActive,
      expiryDate: c.expiryDate ? c.expiryDate.split('T')[0] : ''
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="tag-label mb-2 inline-block">MARKETING</span>
          <h2 className="font-display text-3xl text-white uppercase">CUPONES</h2>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ code: '', discountType: 'PERCENTAGE', value: '', isActive: true, expiryDate: '' }); }}
          className="flex items-center gap-2 bg-white text-black font-display text-xs tracking-widest uppercase px-4 py-2 hover:bg-zinc-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> NUEVO CUPÓN
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-700 p-6 space-y-4 max-w-lg">
          <h3 className="font-display text-xl text-white uppercase">{editing ? 'EDITAR' : 'NUEVO'} CUPÓN</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Código</label>
              <input
                type="text"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
                placeholder="SALE20"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500 uppercase"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Tipo Descuento</label>
              <select
                value={form.discountType}
                onChange={e => setForm({ ...form, discountType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500 cursor-pointer"
              >
                <option value="PERCENTAGE">PORCENTAJE (%)</option>
                <option value="FIXED_AMOUNT">MONTO FIJO ($)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Valor Descuento</label>
              <input
                type="number"
                value={form.value}
                onChange={e => setForm({ ...form, value: e.target.value })}
                placeholder="20"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Fecha Expiración (opcional)</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-zinc-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="couponActive"
              checked={form.isActive}
              onChange={e => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-black focus:ring-0"
            />
            <label htmlFor="couponActive" className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest select-none cursor-pointer">Cupón Activo</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex items-center gap-2 bg-white text-black font-display text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-zinc-200 transition-all cursor-pointer">
              <Save className="w-4 h-4" /> GUARDAR
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="border border-zinc-700 text-zinc-400 font-display text-xs tracking-widest uppercase px-5 py-2.5 hover:text-white hover:border-zinc-500 transition-all cursor-pointer">
              CANCELAR
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32 text-zinc-700"><div className="font-display text-xl animate-pulse">CARGANDO...</div></div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 border border-zinc-800 space-y-3">
          <Ticket className="w-10 h-10 text-zinc-700 mx-auto" />
          <p className="font-accent text-xs text-zinc-600 uppercase tracking-widest">SIN CUPONES ACTIVOS. CREÁ EL PRIMERO.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">CÓDIGO</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">TIPO</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">VALOR</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">EXPIRACIÓN</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">ESTADO</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 pr-4 font-display text-sm text-white uppercase tracking-wider">{c.code}</td>
                  <td className="py-3 pr-4 font-accent text-xs text-zinc-500">{c.discountType === 'PERCENTAGE' ? 'PORCENTAJE' : 'MONTO FIJO'}</td>
                  <td className="py-3 pr-4 font-sans font-bold text-sm text-white">{c.discountType === 'PERCENTAGE' ? `${c.value}%` : `$${c.value.toLocaleString()}`}</td>
                  <td className="py-3 pr-4 font-accent text-xs text-zinc-500">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'NUNCA'}</td>
                  <td className="py-3 pr-4">
                    <span className={`font-accent text-[10px] uppercase tracking-widest ${c.isActive ? 'text-neon' : 'text-zinc-600'}`}>{c.isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                  </td>
                  <td className="py-3 flex gap-2 justify-end">
                    <button onClick={() => startEdit(c)} className="p-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-zinc-500 hover:text-accent transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NewsletterPanel({ token }: { token: string }) {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = () => {
    setLoading(true);
    fetch(`${API_URL}/api/newsletter/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSubscribers(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar suscriptor de la lista?')) return;
    await fetch(`${API_URL}/api/newsletter/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchSubscribers();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="tag-label mb-2 inline-block">AUDIENCIA</span>
        <h2 className="font-display text-3xl text-white uppercase">NEWSLETTER</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-zinc-700"><div className="font-display text-xl animate-pulse">CARGANDO...</div></div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-16 border border-zinc-800 space-y-3">
          <Users className="w-10 h-10 text-zinc-700 mx-auto" />
          <p className="font-accent text-xs text-zinc-600 uppercase tracking-widest">AÚN NO HAY SUSCRIPTORES EN LA LISTA.</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-w-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">EMAIL</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4">FECHA REGISTRO</th>
                <th className="text-left font-accent text-[10px] text-zinc-500 uppercase tracking-widest py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {subscribers.map(s => (
                <tr key={s.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 pr-4 font-sans font-bold text-sm text-white">{s.email}</td>
                  <td className="py-3 pr-4 font-accent text-xs text-zinc-500">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="py-3 flex justify-end">
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-zinc-500 hover:text-accent transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ token }: { token: string }) {
  const [heroTitle, setHeroTitle] = useState("NO ES | ROPA. | ES IDENTIDAD.");
  const [heroSub, setHeroSub] = useState("Nacido en la calle. Vestí tu identidad. La cultura primero, la moda después.");
  const [marqueeInput, setMarqueeInput] = useState("NO SEGUIMOS TENDENCIAS. LAS CREAMOS., LATIN BROÚ 2026, VESTÍ TU IDENTIDAD, CADA DROP CUENTA UNA HISTORIA");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/config/homepage`)
      .then(res => res.json())
      .then(data => {
        if (data && data.heroTitle) {
          setHeroTitle(data.heroTitle);
          setHeroSub(data.heroSub);
          setMarqueeInput(data.marqueeTexts.join(', '));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const marqueeTexts = marqueeInput.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch(`${API_URL}/api/config/homepage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ heroTitle, heroSub, marqueeTexts })
      });
      if (res.ok) {
        setMessage('Configuración de la página principal guardada correctamente.');
      } else {
        setMessage('Error al guardar la configuración.');
      }
    } catch (err) {
      setMessage('Error de red al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-700">
        <div className="font-display text-xl animate-pulse">CARGANDO...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="tag-label mb-3 inline-block">CMS</span>
        <h2 className="font-display text-4xl text-white uppercase">CONFIGURACIÓN WEB</h2>
      </div>

      <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 p-6 space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label className="font-accent text-[11px] text-zinc-400 uppercase tracking-widest block">
            Título Principal del Hero
          </label>
          <input
            type="text"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 text-white text-sm px-4 py-3 outline-none transition-colors"
            required
          />
          <p className="text-[10px] text-zinc-500 font-accent uppercase tracking-wider leading-relaxed">
            Consejo de Diseño: Usá barras verticales "|" para dividir en 3 líneas y mantener el estilo visual.
            Ej: "NO ES | ROPA. | ES IDENTIDAD." (Primera línea normal, segunda outlined, tercera subrayada).
          </p>
        </div>

        <div className="space-y-2">
          <label className="font-accent text-[11px] text-zinc-400 uppercase tracking-widest block">
            Subtítulo del Hero
          </label>
          <textarea
            value={heroSub}
            onChange={(e) => setHeroSub(e.target.value)}
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 text-white text-sm px-4 py-3 outline-none transition-colors resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="font-accent text-[11px] text-zinc-400 uppercase tracking-widest block">
            Textos del Carrusel / Banner (separados por coma)
          </label>
          <input
            type="text"
            value={marqueeInput}
            onChange={(e) => setMarqueeInput(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 text-white text-sm px-4 py-3 outline-none transition-colors"
            required
          />
          <p className="text-[10px] text-zinc-500 font-accent uppercase tracking-wider leading-relaxed">
            Se mostrarán como una línea rotativa sin fin en la página de inicio.
          </p>
        </div>

        {message && (
          <div className={`p-4 border ${message.includes('correctamente') ? 'border-neon/30 bg-neon/5 text-neon' : 'border-accent/30 bg-accent/5 text-accent'}`}>
            <span className="font-accent text-xs font-bold uppercase tracking-widest">{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-white text-black font-display text-sm tracking-widest uppercase px-6 py-3.5 hover:bg-zinc-200 transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
        </button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const { token, user, loginUser, logoutUser } = useShop();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!token || !user?.isAdmin) {
    return <LoginPanel onLogin={loginUser} />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <ProductsPanel token={token} />;
      case 'categories': return <CategoriesPanel token={token} />;
      case 'collections': return <CollectionsPanel token={token} />;
      case 'orders': return <OrdersPanel token={token} />;
      case 'coupons': return <CouponsPanel token={token} />;
      case 'newsletter': return <NewsletterPanel token={token} />;
      case 'settings': return <SettingsPanel token={token} />;
      default: return (
        <div className="flex items-center justify-center h-64 text-zinc-700">
          <div className="text-center space-y-2">
            <div className="font-display text-2xl uppercase text-zinc-800">EN DESARROLLO</div>
            <p className="font-accent text-xs uppercase tracking-widest">ESTA SECCIÓN ESTARÁ DISPONIBLE PRÓXIMAMENTE</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white flex">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-900 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-display text-lg tracking-widest text-white">LATIN BROÚ</span>
              <div className="tag-label mt-1 text-[9px]">ADMIN PANEL</div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-500 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all cursor-pointer rounded-sm ${
                activeSection === item.id
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {item.icon}
              <span className="font-accent text-[11px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-900 space-y-3">
          <div className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">{user.email}</div>
          <button
            onClick={logoutUser}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-accent text-[11px] uppercase tracking-widest cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> CERRAR SESIÓN
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="h-16 border-b border-zinc-900 flex items-center gap-4 px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-zinc-400 hover:text-white cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-[11px] font-accent text-zinc-500 uppercase tracking-widest">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{NAV_ITEMS.find(n => n.id === activeSection)?.label}</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
