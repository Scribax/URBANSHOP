'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';

// --- ANIMATION VARIANTS ---
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const revealFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

// --- SUB COMPONENTS ---

interface HeroSectionProps {
  config: {
    heroTitle: string;
    heroSub: string;
  };
}

function HeroSection({ config }: HeroSectionProps) {
  const parts = config.heroTitle.split('|').map(p => p.trim());

  return (
    <section className="relative min-h-screen flex flex-col justify-end pb-20 overflow-hidden bg-zinc-950">
      {/* Background layered gradients - no images needed, pure CSS street atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-zinc-950 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10" />

      {/* Concrete texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Abstract graffiti-inspired background shapes */}
      <div className="absolute top-0 right-0 w-[65vw] h-full bg-gradient-to-bl from-zinc-900 via-zinc-950 to-transparent" />
      <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-accent/5 blur-[120px] z-0" />
      <div className="absolute bottom-[30%] left-[20%] w-48 h-48 rounded-full bg-neon/5 blur-[100px] z-0" />

      {/* Corner stamp */}
      <div className="absolute top-32 right-8 md:right-16 z-20 rotate-[8deg]">
        <div className="tape-label-dark text-[10px] tracking-[0.2em]">DROP 01</div>
      </div>
      <div className="absolute top-44 right-8 md:right-16 z-20 -rotate-[4deg] mt-2">
        <div className="tape-label text-[10px] tracking-[0.2em]">LIMITED</div>
      </div>

      {/* Main hero content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl"
        >
          {/* Tag label */}
          <motion.div variants={fadeUp} className="mb-8">
            <span className="tag-label">COLECCIÓN 2026 — BARRIO SERIES</span>
          </motion.div>

          {/* Main headline — Typography is the hero */}
          <motion.h1
            variants={fadeUp}
            className="font-display text-[clamp(4rem,14vw,12rem)] leading-[0.85] tracking-tight text-white uppercase mb-6"
          >
            {parts.length >= 3 ? (
              <>
                {parts[0]}<br />
                <span className="text-stroke-white">{parts[1]}</span><br />
                {parts[2].includes(' ') ? (
                  <>
                    {parts[2].split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="relative inline-block">
                      {parts[2].split(' ').pop()}
                      <span className="absolute -bottom-2 left-0 right-0 h-[3px] bg-accent" />
                    </span>
                  </>
                ) : (
                  <span className="relative inline-block">
                    {parts[2]}
                    <span className="absolute -bottom-2 left-0 right-0 h-[3px] bg-accent" />
                  </span>
                )}
              </>
            ) : (
              config.heroTitle
            )}
          </motion.h1>

          {/* Sub headline */}
          <motion.p
            variants={fadeUp}
            className="font-accent text-sm text-zinc-400 max-w-sm uppercase tracking-[0.1em] leading-relaxed mb-10"
          >
            {config.heroSub}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 bg-white text-black font-display tracking-[0.15em] text-sm px-8 py-4 uppercase hover:bg-zinc-100 transition-all hover:gap-5"
            >
              EXPLORAR COLECCIÓN
              <span className="text-lg">→</span>
            </Link>
            <Link
              href="/#drops"
              className="inline-flex items-center gap-3 border border-zinc-700 text-white font-display tracking-[0.15em] text-sm px-8 py-4 uppercase hover:border-white transition-all"
            >
              VER DROPS
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating bottom-right brand text */}
        <div className="absolute bottom-0 right-6 md:right-16 text-right">
          <p className="font-display text-[clamp(3rem,8vw,7rem)] text-zinc-900 uppercase leading-none select-none pointer-events-none">
            2026
          </p>
        </div>
      </div>

      {/* Spray separator at the bottom */}
      <div className="spray-sep absolute bottom-0 left-0 right-0 z-20" />
    </section>
  );
}

function DropBanner({ config }: { config: { marqueeTexts: string[] } }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="drops" ref={ref} className="py-4 bg-white overflow-hidden">
      <motion.div
        animate={isInView ? { x: [0, -1200] } : {}}
        transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
        className="flex gap-16 whitespace-nowrap"
      >
        {[...Array(4)].map((_, i) => (
          <span key={i} className="flex gap-16 items-center">
            {config.marqueeTexts.map((text, j) => (
              <React.Fragment key={j}>
                <span className="font-display text-black text-sm tracking-[0.2em] uppercase">{text}</span>
                {j < config.marqueeTexts.length - 1 && <span className="font-display text-black text-sm">★</span>}
              </React.Fragment>
            ))}
            {i < 3 && <span className="font-display text-black text-sm">★</span>}
          </span>
        ))}
      </motion.div>
    </section>
  );
}

function CollectionsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/collections`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCollections(data); })
      .catch(() => {});
  }, []);

  if (collections.length === 0) return null;

  return (
    <section id="collections" ref={ref} className="py-24 max-w-7xl mx-auto px-6">
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className="space-y-12"
      >
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="tag-label mb-4 inline-block">COLECCIONES</span>
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-white uppercase leading-none">
              NUESTRA OFERTA
            </h2>
          </div>
          <Link
            href="/products"
            className="font-accent text-xs text-zinc-400 hover:text-white uppercase tracking-widest underline underline-offset-4 transition-colors"
          >
            VER TODOS LOS PRODUCTOS →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {collections.map((col, i) => {
            const badges = ['DROP 01', 'COLECCIÓN', 'LIMITED', 'NUEVO'];
            const label = badges[i % badges.length];
            return (
              <motion.div
                key={col.id}
                variants={fadeUp}
                className="group relative bg-zinc-900 border border-zinc-800 p-8 flex flex-col justify-between min-h-[380px] hover:border-zinc-600 transition-all cursor-pointer overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Collection label and items count */}
                <div className="flex justify-between items-start relative z-10">
                  <span className="tape-label-dark text-[10px]">{label}</span>
                  <span className="font-accent text-[10px] text-zinc-600">DROP</span>
                </div>

                {/* Collection name */}
                <div className="relative z-10 space-y-3">
                  <h3 className="font-display text-4xl text-white uppercase leading-none group-hover:tracking-wide transition-all duration-300">
                    {col.name}
                  </h3>
                  <p className="font-accent text-xs text-zinc-400 max-w-[200px] uppercase tracking-wide leading-relaxed">
                    {col.description}
                  </p>
                  <Link
                    href={`/products?collection=${col.slug}`}
                    className="inline-flex items-center gap-2 text-[11px] font-accent font-bold text-white uppercase tracking-widest group-hover:gap-4 transition-all"
                  >
                    EXPLORAR <span>→</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

function FeaturedProducts() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section ref={ref} className="py-24 bg-zinc-950/50">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div>
              <span className="tag-label mb-4 inline-block">NOVEDADES</span>
              <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-white uppercase leading-none">
                PRODUCTOS DESTACADOS
              </h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              const badge = product.collection?.name || (product.stock <= 5 && product.stock > 0 ? 'ÚLTIMAS' : 'NUEVO');
              const primaryImage = product.images?.[0] || null;
              return (
                <motion.div
                  key={product.id}
                  variants={fadeUp}
                  className="group cursor-pointer"
                >
                  <Link href={`/products/${slug}`} className="block">
                    {/* Product image placeholder */}
                    <div className="relative aspect-[3/4] bg-zinc-900 border border-zinc-800 overflow-hidden mb-4">
                      {primaryImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={primaryImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-display text-5xl text-zinc-800 group-hover:text-zinc-700 transition-colors uppercase text-center px-4 leading-none">
                            LB
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="tape-label-dark text-[9px]">{badge.toUpperCase()}</span>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {/* Quick add button on hover */}
                      <div className="absolute bottom-0 left-0 right-0 bg-white text-black text-center py-3 font-display text-xs tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        VER DETALLES
                      </div>
                    </div>

                    {/* Product info */}
                    <div className="space-y-2">
                      <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider group-hover:text-zinc-300 transition-colors">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-accent text-sm font-bold text-white">${product.price.toLocaleString()}</span>
                        <div className="flex gap-1.5 pt-1">
                          {product.colors.slice(0, 4).map((color: string, i: number) => {
                            const colorMap: Record<string, string> = {
                              'negro': '#000000', 'blanco': '#ffffff', 'gris oscuro': '#2d2d2d',
                              'oliva': '#6b7c52', 'rojo': '#ff3b30',
                            };
                            return (
                              <div
                                key={i}
                                className="w-3 h-3 rounded-full border border-zinc-700"
                                style={{ backgroundColor: colorMap[color.toLowerCase()] || '#888888' }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div variants={fadeUp} className="text-center pt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 border border-zinc-700 text-white font-display tracking-[0.15em] text-sm px-10 py-4 uppercase hover:border-white hover:bg-white hover:text-black transition-all"
            >
              VER TODOS LOS PRODUCTOS
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function BrandHistory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="history" ref={ref} className="py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeUp}>
              <span className="tag-label mb-4 inline-block">QUIÉNES SOMOS</span>
            </motion.div>
            <motion.h2 variants={revealFromLeft} className="font-display text-[clamp(2.5rem,5vw,4.5rem)] text-white uppercase leading-none">
              LA CULTURA<br />PRIMERO.<br />
              <span className="text-zinc-600">LA MODA</span><br />
              DESPUÉS.
            </motion.h2>
            <motion.p variants={fadeUp} className="font-sans text-sm text-zinc-400 max-w-md leading-relaxed">
              Latin Broú nació en las calles latinoamericanas, donde el graffiti habla más que las palabras, donde la música mueve el alma y donde el estilo no se compra — se construye. Cada prenda que creamos lleva esa energía.
            </motion.p>
            <motion.p variants={fadeUp} className="font-sans text-sm text-zinc-400 max-w-md leading-relaxed">
              No somos una tendencia. Somos un movimiento. Cada drop es una declaración. Cada tela, un manifiesto.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              {['BUENOS AIRES', 'SANTIAGO', 'SÃO PAULO', 'CDMX'].map((city) => (
                <div key={city} className="tag-label">{city}</div>
              ))}
            </motion.div>
          </motion.div>

          {/* Abstract visual placeholder with stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="relative"
          >
            <div className="bg-zinc-900 border border-zinc-800 p-12 relative">
              <div className="absolute top-0 left-0 right-0 bottom-0 opacity-5"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)`,
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="relative z-10 grid grid-cols-2 gap-8">
                {[
                  { value: '2026', label: 'Fundación' },
                  { value: '100%', label: 'Latinoamericano' },
                  { value: '4+', label: 'Ciudades' },
                  { value: '∞', label: 'Identidad' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center border border-zinc-800 p-6">
                    <div className="font-display text-4xl text-white mb-2">{stat.value}</div>
                    <div className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 tape-label rotate-[3deg]">LATIN STREET</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function HomePage() {
  const [config, setConfig] = useState({
    heroTitle: "NO ES | ROPA. | ES IDENTIDAD.",
    heroSub: "Nacido en la calle. Vestí tu identidad. La cultura primero, la moda después.",
    marqueeTexts: [
      "NO SEGUIMOS TENDENCIAS. LAS CREAMOS.",
      "LATIN BROÚ 2026",
      "VESTÍ TU IDENTIDAD",
      "CADA DROP CUENTA UNA HISTORIA"
    ]
  });

  useEffect(() => {
    fetch(`${API_URL}/api/config/homepage`)
      .then(res => res.json())
      .then(data => {
        if (data && data.heroTitle) {
          setConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="bg-zinc-950 text-white">
      <Navbar />
      <CartDrawer />
      <HeroSection config={config} />
      <DropBanner config={config} />
      <CollectionsSection />
      <FeaturedProducts />
      <BrandHistory />
      <Footer />
    </main>
  );
}
