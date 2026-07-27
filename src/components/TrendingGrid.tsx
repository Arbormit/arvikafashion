import React, { useState } from 'react';
import { Sparkles, ArrowRight, Filter } from 'lucide-react';
import { Product, Currency } from '../types';
import { ProductCard } from './ProductCard';

interface TrendingGridProps {
  products: Product[];
  currency: Currency;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onBuyNow: (product: Product, color: string, size: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: Set<string>;
  cartItemIds?: Set<string>;
  onExploreAll: () => void;
}

export const TrendingGrid: React.FC<TrendingGridProps> = ({
  products,
  currency,
  onQuickView,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  cartItemIds = new Set(),
  onExploreAll
}) => {
  const [filter, setFilter] = useState<string>('all');

  const CATEGORY_FILTERS = [
    { id: 'all', label: 'All Curated' },
    { id: 'pure-linen', label: 'Pure Linen Couture' },
    { id: 'organic-cotton', label: 'Organic Cotton' },
    { id: 'coats-jackets', label: 'Trench & Blazers' },
    { id: 'scandi-dresses', label: 'Scandinavian Dresses' },
  ];

  const filteredProducts = filter === 'all'
    ? products.filter(p => p.isTrending || p.isBestSeller).slice(0, 8)
    : products.filter(p => p.categoryId === filter).slice(0, 8);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <span className="text-xs font-montserrat uppercase tracking-[0.25em] text-[#8C7A6B] font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            CURRENT SEASON FAVORITES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#214C3A] mt-2">
            Trending European Couture
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-montserrat font-bold whitespace-nowrap transition-all ${
                filter === f.id
                  ? 'bg-[#214C3A] text-[#FAF8F4] shadow-md'
                  : 'bg-[#EFE6D8]/60 text-[#1C1C1C] hover:bg-[#EFE6D8]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={currency}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
            onToggleWishlist={onToggleWishlist}
            isWishlisted={wishlistIds.has(product.id)}
            isInCart={cartItemIds.has(product.id)}
          />
        ))}
      </div>

      {/* Explore Full Catalog Button */}
      <div className="mt-14 text-center">
        <button
          onClick={onExploreAll}
          className="inline-flex items-center space-x-3 bg-[#214C3A] text-[#FAF8F4] px-8 py-4 rounded-full font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#4A5D4E] transition-all shadow-md group"
        >
          <span>Explore All 30+ Garment Categories</span>
          <ArrowRight className="w-4 h-4 text-[#D8C6A5] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};
