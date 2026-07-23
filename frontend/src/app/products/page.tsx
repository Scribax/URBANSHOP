'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function ProductsCatalog() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category');
  const colParam = searchParams.get('collection');

  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('TODAS');
  const [activeCollection, setActiveCollection] = useState('TODAS');
  const [categories, setCategories] = useState<string[]>(['TODAS']);

  // Fetch products
  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          // Extract unique categories
          const uniqueCats = Array.from(new Set(data.map((p: any) => p.category?.name).filter(Boolean))) as string[];
          setCategories(['TODAS', ...uniqueCats]);
        }
      })
      .catch(() => {});
  }, []);

  // Sync state from query parameters once products/categories are loaded or URL changes
  useEffect(() => {
    if (catParam) {
      setActiveCategory(catParam.toUpperCase());
    } else {
      setActiveCategory('TODAS');
    }

    if (colParam) {
      setActiveCollection(colParam);
    } else {
      setActiveCollection('TODAS');
    }
  }, [catParam, colParam]);

  // Apply filters
  useEffect(() => {
    let result = products;

    if (activeCategory !== 'TODAS') {
      result = result.filter((p) => p.category?.name?.toUpperCase() === activeCategory.toUpperCase());
    }

    if (activeCollection !== 'TODAS') {
      result = result.filter((p) => p.collection?.slug === activeCollection);
    }

    if (search.trim()) {
      result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    setFiltered(result);
  }, [products, activeCategory, activeCollection, search]);

  return (
    <main className="bg-zinc-950 text-white min-h-screen">
      <Navbar />
      <CartDrawer />

      {/* Page header */}
      <section className="pt-36 pb-12 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="tag-label mb-3 inline-block">CATÁLOGO COMPLETO</span>
              <h1 className="font-display text-[clamp(3rem,8vw,7rem)] text-white uppercase leading-none">
                PRODUCTOS
              </h1>
            </div>
            <p className="font-accent text-xs text-zinc-500 uppercase tracking-widest max-w-[200px]">
              {filtered.length} PRENDAS DISPONIBLES {activeCollection !== 'TODAS' && `EN ESTA COLECCIÓN`}
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Search Bar */}
      <div className="sticky top-20 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-accent text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-all cursor-pointer ${
                  activeCategory.toUpperCase() === cat.toUpperCase()
                    ? 'border-white bg-white text-black font-bold'
                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
            {activeCollection !== 'TODAS' && (
              <button
                onClick={() => setActiveCollection('TODAS')}
                className="font-accent text-[10px] uppercase tracking-widest px-3 py-1.5 border border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 flex items-center gap-1 cursor-pointer"
              >
                LIMPIAR COLECCIÓN <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 border border-zinc-800 px-3 py-2 focus-within:border-zinc-500 transition-colors w-full md:w-56">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="BUSCAR..."
              className="bg-transparent text-[11px] uppercase tracking-widest font-accent text-white placeholder-zinc-600 outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-zinc-500 hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-zinc-900 space-y-4">
            <div className="font-display text-2xl text-zinc-700 uppercase">SIN RESULTADOS</div>
            <p className="font-accent text-xs text-zinc-500 uppercase tracking-widest">
              Intenta cambiar los filtros o el término de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <main className="bg-zinc-950 text-white min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="font-display text-2xl text-zinc-700 animate-pulse uppercase">CARGANDO CATÁLOGO...</div>
        </div>
        <Footer />
      </main>
    }>
      <ProductsCatalog />
    </Suspense>
  );
}
