import React, { useState } from 'react';
import { ArrowRight, Filter } from 'lucide-react';
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
    { id: 'scarf', label: 'Scarves' },
    { id: 'beachwear-kaftan', label: 'Beach Wear & Kaftans' },
    { id: 'bags', label: 'Bags & Totes' },
    { id: 'linen', label: 'Linen' },
    { id: 'cotton', label: 'Cotton' },
    { id: 'dresses', label: 'Dresses' },
    { id: 'outerwear', label: 'Outerwear & Knits' },
    { id: 'trousers-pants', label: 'Trousers' },
  ];

  const matchesCategory = (p: Product, filterId: string) => {
    if (filterId === 'all') return p.isTrending || p.isBestSeller;

    const fId = filterId.toLowerCase();
    const catIdLower = (p.categoryId || '').toLowerCase();
    const catNameLower = (p.categoryName || '').toLowerCase();
    const fabricLower = (p.fabric || '').toLowerCase();
    const nameLower = (p.name || '').toLowerCase();
    const subLower = (p.subtitle || '').toLowerCase();

    if (fId === 'scarf' || fId === 'scarves') {
      return catIdLower.includes('scarf') || catIdLower.includes('stole') || catNameLower.includes('scarf') || catNameLower.includes('stole') || nameLower.includes('scarf') || nameLower.includes('scarfe') || nameLower.includes('stole') || nameLower.includes('wrap') || subLower.includes('scarf') || subLower.includes('scarfe');
    }
    if (fId === 'beachwear-kaftan' || fId === 'kaftan' || fId === 'resort' || fId === 'eco-resort') {
      return catIdLower.includes('kaftan') || catIdLower.includes('resort') || catIdLower.includes('beach') || catNameLower.includes('kaftan') || catNameLower.includes('resort') || catNameLower.includes('beach') || nameLower.includes('kaftan') || nameLower.includes('beach') || nameLower.includes('resort') || nameLower.includes('coverup') || subLower.includes('kaftan');
    }
    if (fId === 'bags' || fId === 'bags-accessories' || fId === 'totes') {
      return catIdLower.includes('bag') || catIdLower.includes('tote') || catNameLower.includes('bag') || catNameLower.includes('tote') || nameLower.includes('bag') || nameLower.includes('tote') || nameLower.includes('carryall');
    }
    if (fId === 'linen') {
      return catIdLower.includes('linen') || catNameLower.includes('linen') || fabricLower.includes('linen') || nameLower.includes('linen') || subLower.includes('linen');
    }
    if (fId === 'cotton') {
      return catIdLower.includes('cotton') || catNameLower.includes('cotton') || fabricLower.includes('cotton') || nameLower.includes('cotton') || subLower.includes('cotton');
    }
    if (fId === 'dresses') {
      return catIdLower.includes('dress') || catNameLower.includes('dress') || nameLower.includes('dress') || subLower.includes('dress');
    }
    if (fId === 'outerwear') {
      return catIdLower.includes('coat') || catIdLower.includes('jacket') || catIdLower.includes('knit') || catNameLower.includes('coat') || catNameLower.includes('jacket') || catNameLower.includes('knit') || nameLower.includes('coat') || nameLower.includes('jacket') || nameLower.includes('blazer') || nameLower.includes('trench') || nameLower.includes('sweater');
    }
    if (fId === 'trousers-pants' || fId === 'trousers' || fId === 'pants') {
      return catIdLower.includes('trouser') || catIdLower.includes('pant') || catIdLower.includes('culotte') || catNameLower.includes('trouser') || catNameLower.includes('pant') || nameLower.includes('trouser') || nameLower.includes('pant');
    }
    return p.categoryId === filterId || p.categoryName === filterId;
  };

  const filteredProducts = products.filter(p => matchesCategory(p, filter)).slice(0, 8);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <span className="text-xs font-montserrat uppercase tracking-[0.25em] text-[#7B9B88] font-bold flex items-center gap-1.5">
            CURRENT SEASON FAVORITES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2A26] mt-2">
            Trending European Couture
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-montserrat font-bold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                filter === f.id
                  ? 'bg-[#7B9B88] text-white shadow-xs border border-[#7B9B88]'
                  : 'bg-[#E8F0EC]/60 text-[#2D2A26] hover:bg-[#E8F0EC] border border-[#D5E4DC]'
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
          className="inline-flex items-center space-x-3 bg-[#7B9B88] text-white px-8 py-4 rounded-full font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#688875] transition-all shadow-md group cursor-pointer"
        >
          <span>Explore All 30+ Garment Categories</span>
          <ArrowRight className="w-4 h-4 text-[#E8DCB8] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};
