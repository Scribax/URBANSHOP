'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { motion } from 'framer-motion';

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  description: string;
  category?: { name: string } | null;
  collection?: { name: string } | null;
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const [hovered, setHovered] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images[0] || null;
  const secondaryImage = product.images[1] || null;

  const handleQuickAdd = () => {
    if (!selectedSize && product.sizes.length > 0) return;
    addToCart(
      product,
      selectedSize || product.sizes[0] || 'Única',
      product.colors[0] || 'Negro'
    );
    setQuickAddOpen(false);
    setSelectedSize('');
  };

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setQuickAddOpen(false); }}
    >
      {/* Product Image Area */}
      <div className="relative aspect-[3/4] bg-zinc-900 border border-zinc-800 overflow-hidden mb-3">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {/* Main / Secondary image swap */}
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hovered && secondaryImage ? secondaryImage : primaryImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            /* Placeholder when no real images */
            <div className="absolute inset-0 flex items-end justify-center pb-6">
              <span className="font-display text-[5rem] text-zinc-800 leading-none">LB</span>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
          {product.collection && (
            <span className="tape-label-dark text-[9px]">{product.collection.name.toUpperCase()}</span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="tag-label text-[9px]">ÚLTIMAS UNIDADES</span>
          )}
        </div>

        {/* Wishlist btn */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all cursor-pointer ${
            inWishlist
              ? 'bg-white text-accent'
              : 'bg-black/40 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add bar - slides up on hover */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: hovered ? 0 : '100%' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 bg-white z-10"
        >
          {!quickAddOpen ? (
            <button
              onClick={() => setQuickAddOpen(true)}
              className="w-full py-3 flex items-center justify-center gap-2 text-black font-display text-[11px] tracking-widest uppercase cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              QUICK ADD
            </button>
          ) : (
            <div className="p-3">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`text-[10px] font-accent font-bold px-2 py-1 border cursor-pointer transition-all ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'border-zinc-300 text-zinc-700 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                onClick={handleQuickAdd}
                disabled={product.sizes.length > 0 && !selectedSize}
                className="w-full py-2 bg-black text-white font-display text-[10px] tracking-widest uppercase disabled:opacity-50 cursor-pointer"
              >
                {selectedSize ? 'AGREGAR AL CARRITO' : 'ELEGÍ UN TALLE'}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wider leading-tight hover:text-zinc-300 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-accent text-sm font-bold text-white">${product.price.toLocaleString()}</span>
          {product.category && (
            <span className="font-accent text-[9px] text-zinc-600 uppercase tracking-widest">{product.category.name}</span>
          )}
        </div>
        {/* Color dots */}
        {product.colors.length > 0 && (
          <div className="flex gap-1.5 pt-1">
            {product.colors.slice(0, 4).map((color, i) => {
              const colorMap: { [key: string]: string } = {
                'negro': '#000000', 'blanco': '#ffffff', 'gris oscuro': '#2d2d2d',
                'oliva': '#6b7c52', 'rojo': '#ff3b30', 'caqui': '#c3a07a',
              };
              const bgColor = colorMap[color.toLowerCase()] || '#888888';
              return (
                <div
                  key={i}
                  title={color}
                  className="w-3 h-3 rounded-full border border-zinc-700 hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: bgColor }}
                />
              );
            })}
            {product.colors.length > 4 && (
              <span className="font-accent text-[9px] text-zinc-600">+{product.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
