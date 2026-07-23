'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { useShop } from '@/context/ShopContext';
import { motion } from 'framer-motion';
import { Heart, ChevronLeft, Plus, Minus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addToCart, toggleWishlist, isInWishlist } = useShop();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products/slug/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.id) {
          setProduct(data);
          if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
          if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const inWishlist = product ? isInWishlist(product.id) : false;

  if (loading) {
    return (
      <main className="bg-zinc-950 text-white min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="font-display text-2xl text-zinc-700 animate-pulse uppercase">CARGANDO...</div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="bg-zinc-950 text-white min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen gap-6">
          <div className="font-display text-8xl text-zinc-800">404</div>
          <h1 className="font-display text-2xl text-zinc-500 uppercase">PRENDA NO ENCONTRADA</h1>
          <Link href="/products" className="tape-label">VER TODOS LOS PRODUCTOS</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-zinc-950 text-white min-h-screen">
      <Navbar />
      <CartDrawer />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-10 text-[11px] font-accent text-zinc-500 uppercase tracking-widest">
          <Link href="/products" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> PRODUCTOS
          </Link>
          <span>/</span>
          <span className="text-zinc-300">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          {/* Left: Images */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-3">
            {/* Main Image */}
            <div className="aspect-[4/5] bg-zinc-900 border border-zinc-800 overflow-hidden relative">
              {product.images[activeImage] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-[10rem] text-zinc-800 leading-none">LB</span>
                </div>
              )}
              {/* Collection badge */}
              {product.collection && (
                <div className="absolute top-4 left-4">
                  <span className="tape-label-dark text-[10px]">{product.collection.name.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.slice(0, 5).map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-20 bg-zinc-900 border overflow-hidden cursor-pointer transition-all ${
                      activeImage === i ? 'border-white' : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="space-y-8 lg:pt-2"
          >
            {/* Category + name */}
            <motion.div variants={fadeUp} className="space-y-3">
              {product.category && <span className="tag-label">{product.category.name.toUpperCase()}</span>}
              <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-white uppercase leading-none mt-3">
                {product.name}
              </h1>
              <p className="font-display text-3xl text-white">${product.price.toLocaleString()}</p>
            </motion.div>

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <motion.div variants={fadeUp} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-accent text-[11px] text-zinc-500 uppercase tracking-widest">COLOR:</span>
                  <span className="font-accent text-[11px] text-white font-bold uppercase tracking-widest">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string) => {
                    const colorMap: Record<string, string> = {
                      'negro': '#000000', 'blanco': '#ffffff', 'gris oscuro': '#2d2d2d',
                      'oliva': '#6b7c52', 'rojo': '#ff3b30',
                    };
                    const bg = colorMap[color.toLowerCase()] || '#888888';
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                          selectedColor === color ? 'border-white scale-110' : 'border-zinc-700 hover:border-zinc-400'
                        }`}
                        style={{ backgroundColor: bg }}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <motion.div variants={fadeUp} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-accent text-[11px] text-zinc-500 uppercase tracking-widest">TALLE</span>
                  <button className="font-accent text-[10px] text-zinc-500 underline hover:text-white transition-colors cursor-pointer">
                    GUÍA DE TALLES
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] px-3 py-2 border text-[11px] font-accent font-bold uppercase tracking-wider cursor-pointer transition-all ${
                        selectedSize === size
                          ? 'border-white bg-white text-black'
                          : 'border-zinc-800 text-zinc-400 hover:border-white hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quantity + Add to Cart */}
            <motion.div variants={fadeUp} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-zinc-800 bg-zinc-900">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:text-white text-zinc-400 transition-colors cursor-pointer">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-accent font-bold text-white">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:text-white text-zinc-400 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="font-accent text-[10px] text-zinc-600 uppercase">{product.stock} disponibles</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 font-display text-sm tracking-widest uppercase transition-all cursor-pointer ${
                    addedFeedback
                      ? 'bg-neon text-black'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {addedFeedback ? '✔ AGREGADO AL CARRITO' : 'AGREGAR AL CARRITO'}
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-4 border transition-all cursor-pointer ${
                    inWishlist ? 'border-white bg-white text-black' : 'border-zinc-800 text-zinc-400 hover:border-white hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current text-accent' : ''}`} />
                </button>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div variants={fadeUp} className="border-t border-zinc-900 pt-8 space-y-4">
              <h3 className="font-accent text-[11px] text-zinc-500 uppercase tracking-widest">DESCRIPCIÓN</h3>
              <div className="font-sans text-sm text-zinc-400 leading-relaxed space-y-3">
                {product.description.split('\n\n').map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </motion.div>

            {/* Details chips */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {['ENVÍO GRATIS +$30K', '30 DÍAS DEVOLUCIÓN', 'PAGO SEGURO'].map((detail) => (
                <span key={detail} className="font-accent text-[9px] text-zinc-500 border border-zinc-800 px-2 py-1 uppercase tracking-widest">
                  {detail}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
