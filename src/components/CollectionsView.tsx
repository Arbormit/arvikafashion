import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Check, 
  Grid2X2, 
  Grid3X3,
  RotateCcw
} from 'lucide-react';
import { Product, Currency, Category } from '../types';
import { CATEGORIES } from '../data/categories';
import { ProductCard } from './ProductCard';

interface CollectionsViewProps {
  products: Product[];
  currency: Currency;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onBuyNow: (product: Product, color: string, size: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: Set<string>;
  cartItemIds?: Set<string>;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  products,
  currency,
  selectedCategory,
  setSelectedCategory,
  onQuickView,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  cartItemIds = new Set()
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Available Sizes & Fabrics for filtering
  const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const ALL_FABRICS = [
    '100% Certified French Normandy Organic Linen',
    '100% GOTS Certified Organic Long-Staple Indian Cotton',
    'Heavyweight Linen-Wool Weather Twill',
    '70% Wild Mulberry Silk, 30% Fine Australian Merino',
    '100% Hand-loomed Linen-Cotton'
  ];

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (selectedCategory) {
        const catLower = selectedCategory.toLowerCase();
        const pCatId = (p.categoryId || '').toLowerCase();
        const pCatName = (p.categoryName || '').toLowerCase();
        const pFabric = (p.fabric || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        const pSub = (p.subtitle || '').toLowerCase();

        if (catLower === 'scarf' || catLower === 'scarves') {
          if (!pCatId.includes('scarf') && !pCatId.includes('stole') && !pCatName.includes('scarf') && !pCatName.includes('stole') && !pName.includes('scarf') && !pName.includes('scarfe') && !pName.includes('stole') && !pName.includes('wrap') && !pSub.includes('scarf') && !pSub.includes('scarfe')) return false;
        } else if (catLower === 'beachwear-kaftan' || catLower === 'kaftan' || catLower === 'resort' || catLower === 'eco-resort') {
          if (!pCatId.includes('kaftan') && !pCatId.includes('resort') && !pCatId.includes('beach') && !pCatName.includes('kaftan') && !pCatName.includes('resort') && !pCatName.includes('beach') && !pName.includes('kaftan') && !pName.includes('beach') && !pName.includes('resort') && !pName.includes('coverup') && !pSub.includes('kaftan')) return false;
        } else if (catLower === 'bags' || catLower === 'bags-accessories' || catLower === 'totes') {
          if (!pCatId.includes('bag') && !pCatId.includes('tote') && !pCatName.includes('bag') && !pCatName.includes('tote') && !pName.includes('bag') && !pName.includes('tote') && !pName.includes('carryall')) return false;
        } else if (catLower === 'linen') {
          if (!pCatId.includes('linen') && !pCatName.includes('linen') && !pFabric.includes('linen') && !pName.includes('linen') && !pSub.includes('linen')) return false;
        } else if (catLower === 'cotton') {
          if (!pCatId.includes('cotton') && !pCatName.includes('cotton') && !pFabric.includes('cotton') && !pName.includes('cotton') && !pSub.includes('cotton')) return false;
        } else if (catLower === 'dresses') {
          if (!pCatId.includes('dress') && !pCatName.includes('dress') && !pName.includes('dress') && !pSub.includes('dress')) return false;
        } else if (catLower === 'outerwear') {
          if (!pCatId.includes('coat') && !pCatId.includes('jacket') && !pCatId.includes('knit') && !pCatName.includes('coat') && !pCatName.includes('jacket') && !pCatName.includes('knit') && !pName.includes('coat') && !pName.includes('jacket') && !pName.includes('blazer') && !pName.includes('trench') && !pName.includes('sweater')) return false;
        } else if (catLower === 'trousers-pants' || catLower === 'trousers' || catLower === 'pants') {
          if (!pCatId.includes('trouser') && !pCatId.includes('pant') && !pCatId.includes('culotte') && !pCatName.includes('trouser') && !pCatName.includes('pant') && !pName.includes('trouser') && !pName.includes('pant')) return false;
        } else {
          if (p.categoryId !== selectedCategory && p.categoryName !== selectedCategory) return false;
        }
      }

      // Search match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCategory = p.categoryName.toLowerCase().includes(query);
        const matchesFabric = p.fabric.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesFabric) return false;
      }

      // Size match
      if (selectedSize && !p.sizes.includes(selectedSize)) return false;

      // Fabric match
      if (selectedFabric && !p.fabric.includes(selectedFabric)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') {
        const pA = currency === 'INR' ? a.priceINR : a.priceEUR;
        const pB = currency === 'INR' ? b.priceINR : b.priceEUR;
        return pA - pB;
      }
      if (sortBy === 'price-high') {
        const pA = currency === 'INR' ? a.priceINR : a.priceEUR;
        const pB = currency === 'INR' ? b.priceINR : b.priceEUR;
        return pB - pA;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0; // Featured
    });
  }, [products, selectedCategory, searchQuery, selectedSize, selectedFabric, sortBy, currency]);

  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setSelectedSize(null);
    setSelectedFabric(null);
    setSortBy('featured');
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Category Selection Carousel / Grid (8 Categories) */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-montserrat uppercase tracking-[0.2em] text-[#7B9B88] font-bold flex items-center gap-1.5">
              EXPLORE OUR GARMENT ATELIERS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2A26] mt-1">
              Curated European Collections
            </h2>
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-[#7B9B88] underline font-montserrat font-bold hover:text-[#688875]"
            >
              Show All Categories ({products.length})
            </button>
          )}
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[90px] ${
                selectedCategory === cat.id
                  ? 'bg-[#7B9B88] text-white border-[#7B9B88] shadow-md scale-105'
                  : 'bg-[#FAF8F4] hover:bg-[#E8F0EC]/60 border-[#EAE2D7] text-[#2D2A26]'
              }`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#E8DCB8] mb-2 group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <span className="font-serif text-xs font-bold leading-tight line-clamp-2">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Category Highlight Header Banner */}
      {activeCategoryObj && (
        <div className="bg-[#E8F0EC] text-[#2D2A26] p-6 sm:p-8 rounded-3xl border border-[#D5E4DC] shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-montserrat uppercase tracking-widest text-[#4E6E5D] bg-[#FAF8F4] px-3 py-1 rounded-full border border-[#7B9B88]/30 font-bold">
              Selected Category
            </span>
            <h3 className="font-serif text-3xl font-bold text-[#2D2A26]">
              {activeCategoryObj.name}
            </h3>
            <p className="text-xs font-sans text-[#2D2A26]/85 leading-relaxed">
              {activeCategoryObj.description}
            </p>
            <div className="text-[11px] text-[#4E6E5D] font-montserrat font-bold pt-1">
              Featured Fabric: {activeCategoryObj.featuredFabric}
            </div>
          </div>

          <button
            onClick={() => setSelectedCategory(null)}
            className="bg-[#7B9B88] text-white hover:bg-[#688875] px-5 py-2.5 rounded-full font-montserrat text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-xs"
          >
            <X className="w-4 h-4" /> Clear Category Filter
          </button>
        </div>
      )}

      {/* Search Bar & Filter Controls Toolbar */}
      <div className="bg-[#F3ECE3]/60 p-4 rounded-2xl border border-[#E5DDD0] flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B9B88]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search linen, trench, silk, sizes..."
            className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl text-xs font-sans border border-[#D5E4DC] focus:outline-none focus:ring-2 focus:ring-[#7B9B88] text-[#2D2A26]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7B9B88]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & Sorting */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
          
          {/* Size Filter */}
          <select
            value={selectedSize || ''}
            onChange={(e) => setSelectedSize(e.target.value || null)}
            className="bg-white text-xs font-montserrat font-semibold text-[#2D2A26] px-3 py-2.5 rounded-xl border border-[#D5E4DC] focus:outline-none"
          >
            <option value="">All Sizes</option>
            {ALL_SIZES.map(s => <option key={s} value={s}>Size {s}</option>)}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white text-xs font-montserrat font-semibold text-[#2D2A26] px-3 py-2.5 rounded-xl border border-[#D5E4DC] focus:outline-none"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* Reset Filters */}
          {(selectedCategory || searchQuery || selectedSize || selectedFabric) && (
            <button
              onClick={resetAllFilters}
              className="p-2.5 bg-white text-[#7B9B88] hover:bg-[#7B9B88] hover:text-white rounded-xl border border-[#D5E4DC] transition-all"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <span className="text-xs font-montserrat text-[#7B9B88] font-bold ml-2">
            {filteredProducts.length} Garments Found
          </span>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
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
      ) : (
        <div className="text-center py-16 bg-[#FAF8F4] border border-dashed border-[#D5E4DC] rounded-3xl space-y-4">
          <p className="font-serif text-2xl font-bold text-[#2D2A26]">
            No garments match your active filters
          </p>
          <p className="text-xs text-[#7B9B88] font-sans">
            Try resetting search terms or size constraints.
          </p>
          <button
            onClick={resetAllFilters}
            className="bg-[#7B9B88] text-white px-6 py-2.5 rounded-full font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#688875] transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}

    </section>
  );
};
