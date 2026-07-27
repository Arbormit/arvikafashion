import { Product } from '../types';

export const PRODUCTS: Product[] = [
  // PURE LINEN COUTURE
  {
    id: 'arv-101',
    name: 'Stockholm Oversized Linen Shirt',
    subtitle: 'Classic French Seam Button-Down',
    categoryId: 'pure-linen',
    categoryName: 'Pure Linen Couture',
    priceINR: 5490,
    priceEUR: 68,
    originalPriceINR: 6990,
    originalPriceEUR: 85,
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Warm Sand', hex: '#D8C6A5' },
      { name: 'Forest Green', hex: '#214C3A' },
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Stone Beige', hex: '#EFE6D8' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    fabric: '100% Certified French Normandy Organic Linen',
    gsm: 185,
    fit: 'Relaxed Scandinavian Oversized Fit',
    description: 'Woven in Jaipur from hand-selected French flax yarn. Features a soft structured band collar, natural mother-of-pearl buttons, and dropped shoulders for an airy silhouette.',
    sustainabilityNotes: 'Zero microplastics, OEKO-TEX® Standard 100 dye certification, zero-waste Jaipur atelier tailoring.',
    isTrending: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 142,
    sku: 'ARV-LNN-101',
    inStock: true
  },
  {
    id: 'arv-102',
    name: 'Copenhagen Tailored Linen Tunic',
    subtitle: 'Mandarin Collar Minimal Tunic',
    categoryId: 'pure-linen',
    categoryName: 'Pure Linen Couture',
    priceINR: 6290,
    priceEUR: 78,
    originalPriceINR: 7500,
    originalPriceEUR: 92,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Forest Green', hex: '#214C3A' },
      { name: 'Charcoal Black', hex: '#1C1C1C' },
      { name: 'Olive Green', hex: '#4A5D4E' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: '100% Pure Pre-washed Heavyweight Linen',
    gsm: 210,
    fit: 'Straight Architectural Cut',
    description: 'Designed for quiet luxury. Deep side slits ensure effortless motion, while subtle tonal topstitching adds discreet craftsmanship detail.',
    sustainabilityNotes: 'Woven using rainwater-harvested flax processing in Jaipur.',
    isTrending: true,
    rating: 4.8,
    reviewCount: 98,
    sku: 'ARV-LNN-102',
    inStock: true
  },
  {
    id: 'arv-103',
    name: 'Aarhus Wide-Leg Linen Trouser',
    subtitle: 'High-Waisted Pleated Pant',
    categoryId: 'pure-linen',
    categoryName: 'Pure Linen Couture',
    priceINR: 5990,
    priceEUR: 74,
    originalPriceINR: 7200,
    originalPriceEUR: 89,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Stone Beige', hex: '#EFE6D8' },
      { name: 'Taupe', hex: '#8C7A6B' },
      { name: 'Warm Sand', hex: '#D8C6A5' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% European Linen',
    gsm: 220,
    fit: 'High-Rise Wide-Leg Fit',
    description: 'Effortless tailoring featuring front double pleats, elasticated back waistband for comfort, and deep side seam slash pockets.',
    sustainabilityNotes: 'Dyed using low-impact Azo-free organic pigments.',
    isTrending: false,
    rating: 4.9,
    reviewCount: 76,
    sku: 'ARV-LNN-103',
    inStock: true
  },
  {
    id: 'arv-104',
    name: 'Gothenburg Linen Wrap Shirt',
    subtitle: 'Asymmetric Kimono-Sleeve Blouse',
    categoryId: 'pure-linen',
    categoryName: 'Pure Linen Couture',
    priceINR: 4990,
    priceEUR: 62,
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Organic Pre-shrunk Linen',
    gsm: 175,
    fit: 'Customizable Wrap Fit',
    description: 'Versatile wrap shirt with self-fabric ties and wide elbow-length sleeves. Perfect for layering over tailored trousers.',
    sustainabilityNotes: 'Fair Trade Certified ethical workshop assembly in Faridabad.',
    rating: 4.7,
    reviewCount: 54,
    sku: 'ARV-LNN-104',
    inStock: true
  },

  // ORGANIC COTTON ESSENTIALS
  {
    id: 'arv-201',
    name: 'Oslo Heavyweight Organic Tee',
    subtitle: '240 GSM Slub Organic Cotton',
    categoryId: 'organic-cotton',
    categoryName: 'Organic Cotton Essentials',
    priceINR: 2490,
    priceEUR: 32,
    originalPriceINR: 2990,
    originalPriceEUR: 38,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Charcoal Black', hex: '#1C1C1C' },
      { name: 'Olive Green', hex: '#4A5D4E' },
      { name: 'Stone Beige', hex: '#EFE6D8' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    fabric: '100% GOTS Certified Organic Long-Staple Indian Cotton',
    gsm: 240,
    fit: 'Boxy Modern Fit',
    description: 'The foundation of minimalist wardrobes. Knitted from comb-spun organic yarn that holds its shape wash after wash without pilling.',
    sustainabilityNotes: 'GOTS Certified yarn from farmer cooperatives in Gujarat & Rajasthan.',
    isTrending: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 210,
    sku: 'ARV-COT-201',
    inStock: true
  },
  {
    id: 'arv-202',
    name: 'Malmö Crisp Poplin Utility Shirt',
    subtitle: 'GOTS Organic Cotton Poplin',
    categoryId: 'organic-cotton',
    categoryName: 'Organic Cotton Essentials',
    priceINR: 4290,
    priceEUR: 54,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Taupe', hex: '#8C7A6B' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: '100% Organic Fine Cotton Poplin',
    gsm: 140,
    fit: 'Crisp Straight Cut',
    description: 'Tailored with clean minimalist seam lines, a curved curved hemline, and hidden placket detail.',
    sustainabilityNotes: '100% biodegradable trims and organic dyes.',
    rating: 4.8,
    reviewCount: 64,
    sku: 'ARV-COT-202',
    inStock: true
  },
  {
    id: 'arv-203',
    name: 'Helsinki Ribbed Tank & Lounge Set',
    subtitle: 'Organic Cotton-Elastane Fine Rib',
    categoryId: 'organic-cotton',
    categoryName: 'Organic Cotton Essentials',
    priceINR: 3490,
    priceEUR: 44,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Warm Sand', hex: '#D8C6A5' },
      { name: 'Ivory White', hex: '#FAF8F4' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '95% Organic Cotton, 5% Elastane',
    gsm: 210,
    fit: 'Form-Sculpting Soft Fit',
    description: 'Ultra-soft rib knit top engineered with double-layer self-fabric lining for seamless opacity and total comfort.',
    sustainabilityNotes: 'GOTS Certified & OEKO-TEX Standard 100.',
    rating: 4.9,
    reviewCount: 88,
    sku: 'ARV-COT-203',
    inStock: true
  },

  // ARTISANAL TRENCH COATS & JACKETS
  {
    id: 'arv-301',
    name: 'Arvika Signature Linen Trench Coat',
    subtitle: 'Double-Breasted Heritage Duster',
    categoryId: 'coats-jackets',
    categoryName: 'Artisanal Trench Coats & Jackets',
    priceINR: 12990,
    priceEUR: 155,
    originalPriceINR: 15990,
    originalPriceEUR: 190,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Forest Green', hex: '#214C3A' },
      { name: 'Warm Sand', hex: '#D8C6A5' },
      { name: 'Dark Walnut', hex: '#3D2B1F' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: 'Heavyweight Linen-Wool Weather Twill',
    gsm: 320,
    fit: 'Tailored European Trench Fit',
    description: 'Our crown jewel outerwear. Crafted with wide storm flaps, adjustable wrist straps, natural horn-effect coconut buttons, and an unlined interior exposing bound seams.',
    sustainabilityNotes: 'Hand-tailored in our master export atelier in Faridabad.',
    isTrending: true,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 87,
    sku: 'ARV-JAC-301',
    inStock: true
  },
  {
    id: 'arv-302',
    name: 'Bergen Unstructured Linen Blazer',
    subtitle: 'Relaxed Single-Breasted Jacket',
    categoryId: 'coats-jackets',
    categoryName: 'Artisanal Trench Coats & Jackets',
    priceINR: 8990,
    priceEUR: 112,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Stone Beige', hex: '#EFE6D8' },
      { name: 'Forest Green', hex: '#214C3A' },
      { name: 'Charcoal Black', hex: '#1C1C1C' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Pre-washed Heavy Linen',
    gsm: 260,
    fit: 'Soft Tailored Oversized',
    description: 'Designed without stiff shoulder pads for a natural drape. Features classic patch pockets and notch lapels.',
    sustainabilityNotes: 'Plastic-free construction including organic cotton internal stays.',
    rating: 4.8,
    reviewCount: 42,
    sku: 'ARV-JAC-302',
    inStock: true
  },
  {
    id: 'arv-303',
    name: 'Uppsala Quilted Cotton Liner Jacket',
    subtitle: 'Reversible Hand-Stitched Jacket',
    categoryId: 'coats-jackets',
    categoryName: 'Artisanal Trench Coats & Jackets',
    priceINR: 7890,
    priceEUR: 98,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Olive Green', hex: '#4A5D4E' },
      { name: 'Warm Sand', hex: '#D8C6A5' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: '100% Organic Cotton Voile & Recycled Cotton Batting',
    gsm: 220,
    fit: 'Cozy Oversized Layer',
    description: 'Featuring delicate hand-kantha stitching done by woman artisan cooperatives in Rajasthan, reversible with contrast organic binding.',
    sustainabilityNotes: 'Direct economic empowerment for 80+ rural female weavers.',
    rating: 4.9,
    reviewCount: 58,
    sku: 'ARV-JAC-303',
    inStock: true
  },

  // SCANDINAVIAN MINIMAL DRESSES
  {
    id: 'arv-401',
    name: 'Reykjavik Tiered Linen Midi Dress',
    subtitle: 'Flowing Pocketed Linen Dress',
    categoryId: 'scandi-dresses',
    categoryName: 'Scandinavian Minimal Dresses',
    priceINR: 7490,
    priceEUR: 92,
    originalPriceINR: 8990,
    originalPriceEUR: 110,
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Forest Green', hex: '#214C3A' },
      { name: 'Warm Sand', hex: '#D8C6A5' },
      { name: 'Ivory White', hex: '#FAF8F4' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Organic French Flax Linen',
    gsm: 190,
    fit: 'Fluid Tiered Silhouette',
    description: 'Effortless Nordic silhouette with subtle gathered tiers, deep side seam pockets, and an adjustable neck closure with fabric ties.',
    sustainabilityNotes: 'Woven & dyed with closed-loop water treatment in Jaipur.',
    isTrending: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 175,
    sku: 'ARV-DRS-401',
    inStock: true
  },
  {
    id: 'arv-402',
    name: 'Oslo Minimalist Wrap Shirt Dress',
    subtitle: 'Organic Cotton-Linen Hybrid Dress',
    categoryId: 'scandi-dresses',
    categoryName: 'Scandinavian Minimal Dresses',
    priceINR: 6990,
    priceEUR: 86,
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Stone Beige', hex: '#EFE6D8' },
      { name: 'Taupe', hex: '#8C7A6B' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '60% Organic Linen, 40% Organic Cotton',
    gsm: 170,
    fit: 'Adjustable Belted Wrap Cut',
    description: 'Sharp crisp collar combined with soft organic wrap drape. Features long cuff sleeves designed to be effortlessly rolled up.',
    sustainabilityNotes: 'OEKO-TEX Certified safe from toxic substances.',
    rating: 4.8,
    reviewCount: 61,
    sku: 'ARV-DRS-402',
    inStock: true
  },
  {
    id: 'arv-403',
    name: 'Lund Sleeveless Column Dress',
    subtitle: 'High-Neck Straight Linen Dress',
    categoryId: 'scandi-dresses',
    categoryName: 'Scandinavian Minimal Dresses',
    priceINR: 5990,
    priceEUR: 75,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Charcoal Black', hex: '#1C1C1C' },
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: '100% Heavy European Linen',
    gsm: 210,
    fit: 'Elegant Column Cut',
    description: 'High boat neckline with a discreet back keyhole button and deep side slit for comfortable strides.',
    sustainabilityNotes: 'Zero waste pattern cutting design.',
    rating: 4.7,
    reviewCount: 39,
    sku: 'ARV-DRS-403',
    inStock: true
  },

  // TAILORED TROUSERS & CULOTTES
  {
    id: 'arv-501',
    name: 'Tromsø Pleated Linen Culottes',
    subtitle: 'Cropped Wide-Leg Trouser',
    categoryId: 'trousers-pants',
    categoryName: 'Tailored Trousers & Culottes',
    priceINR: 5290,
    priceEUR: 66,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Warm Sand', hex: '#D8C6A5' },
      { name: 'Olive Green', hex: '#4A5D4E' },
      { name: 'Ivory White', hex: '#FAF8F4' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Pre-washed Organic Linen',
    gsm: 200,
    fit: 'High-Rise Cropped Cut',
    description: 'Sophisticated calf-length culotte trousers with clean front waistband and subtle back darts.',
    sustainabilityNotes: 'Handwoven in Rajasthan on traditional pedal looms.',
    isTrending: true,
    rating: 4.8,
    reviewCount: 72,
    sku: 'ARV-TRS-501',
    inStock: true
  },
  {
    id: 'arv-502',
    name: 'Trondheim Elasticated Linen Pants',
    subtitle: 'Everyday Relaxed Lounge Trouser',
    categoryId: 'trousers-pants',
    categoryName: 'Tailored Trousers & Culottes',
    priceINR: 4890,
    priceEUR: 60,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Stone Beige', hex: '#EFE6D8' },
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    fabric: '100% Pure Softened Linen',
    gsm: 180,
    fit: 'Relaxed Tapered Fit',
    description: 'Enclosed elastic drawstring waist with natural linen cord and deep pockets. Ideal for travel and warm climates.',
    sustainabilityNotes: 'Organic softened finish without artificial chemical wash.',
    rating: 4.9,
    reviewCount: 110,
    sku: 'ARV-TRS-502',
    inStock: true
  },

  // ARTISANAL SILK-WOOL KNITWEAR
  {
    id: 'arv-601',
    name: 'Turku Silk-Merino Fine Knit Sweater',
    subtitle: 'Featherlight Layering Knit',
    categoryId: 'silk-wool-knits',
    categoryName: 'Artisanal Silk-Wool Knitwear',
    priceINR: 7990,
    priceEUR: 98,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Taupe', hex: '#8C7A6B' },
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '70% Wild Mulberry Silk, 30% Fine Australian Merino',
    gsm: 160,
    fit: 'Subtle Relaxed Drape',
    description: 'Hand-knitted by master craftsmen. Delivers extraordinary thermal comfort, gentle sheen, and silky touch against the skin.',
    sustainabilityNotes: 'Ethically harvested mulberry silk yarns.',
    isTrending: true,
    rating: 4.9,
    reviewCount: 83,
    sku: 'ARV-KNT-601',
    inStock: true
  },
  {
    id: 'arv-602',
    name: 'Espoo Longline Silk-Blend Cardigan',
    subtitle: 'Open-Front Draped Cardigan',
    categoryId: 'silk-wool-knits',
    categoryName: 'Artisanal Silk-Wool Knitwear',
    priceINR: 8990,
    priceEUR: 110,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Warm Sand', hex: '#D8C6A5' },
      { name: 'Stone Beige', hex: '#EFE6D8' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: '60% Organic Cotton, 30% Silk, 10% Linen',
    gsm: 200,
    fit: 'Fluid Draped Fit',
    description: 'Versatile mid-thigh length open cardigan with subtle ribbed hem and sleeve cuffs.',
    sustainabilityNotes: 'Crafted with zero-waste fully fashioned knitting.',
    rating: 4.8,
    reviewCount: 47,
    sku: 'ARV-KNT-602',
    inStock: true
  },

  // ECO-LUXURY RESORT WEAR
  {
    id: 'arv-701',
    name: 'Santorini Hand-Loomed Linen Kaftan',
    subtitle: 'Embroidered Hem Resort Kaftan',
    categoryId: 'eco-resort',
    categoryName: 'Eco-Luxury Resort Wear',
    priceINR: 6990,
    priceEUR: 86,
    originalPriceINR: 8200,
    originalPriceEUR: 100,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Forest Green', hex: '#214C3A' },
      { name: 'Warm Sand', hex: '#D8C6A5' }
    ],
    sizes: ['S-M (One Size)', 'L-XL (One Size)'],
    fabric: '100% Hand-loomed Linen-Cotton',
    gsm: 165,
    fit: 'Breezy Oversized Kaftan',
    description: 'Designed for summer retreats and coastal lounging. V-neckline adorned with delicate tonal hand embroidery along the collar.',
    sustainabilityNotes: 'Hand-loomed in Bengal weaver villages.',
    isTrending: true,
    rating: 4.9,
    reviewCount: 96,
    sku: 'ARV-RSR-701',
    inStock: true
  },
  {
    id: 'arv-702',
    name: 'Ibiza Tiered Linen Beach Coverup',
    subtitle: 'Sheer Linen Voile Shirt Dress',
    categoryId: 'eco-resort',
    categoryName: 'Eco-Luxury Resort Wear',
    priceINR: 5490,
    priceEUR: 68,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Stone Beige', hex: '#EFE6D8' },
      { name: 'Olive Green', hex: '#4A5D4E' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Featherlight Linen Voile',
    gsm: 110,
    fit: 'Airy Breezy Fit',
    description: 'Translucent pure linen shirt dress that layers effortlessly over swimwear.',
    sustainabilityNotes: 'Naturally bleached using bio-enzymes without chlorine.',
    rating: 4.7,
    reviewCount: 52,
    sku: 'ARV-RSR-702',
    inStock: true
  },

  // HERITAGE CRAFT ACCESSORIES
  {
    id: 'arv-801',
    name: 'Kyoto Hand-loomed Linen Scarf',
    subtitle: 'Fringed Organic Linen Wrap',
    categoryId: 'heritage-accessories',
    categoryName: 'Heritage Craft Accessories',
    priceINR: 2990,
    priceEUR: 38,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Forest Green', hex: '#214C3A' },
      { name: 'Warm Sand', hex: '#D8C6A5' },
      { name: 'Ivory White', hex: '#FAF8F4' }
    ],
    sizes: ['One Size (70 x 200 cm)'],
    fabric: '100% Hand-spun Organic Linen',
    gsm: 130,
    fit: 'Generous Wrap Size',
    description: 'Generously proportioned scarf featuring hand-twisted raw fringes and a tactile slub texture.',
    sustainabilityNotes: 'Direct partnership with Maheshwar loom artisans.',
    isTrending: true,
    rating: 4.9,
    reviewCount: 130,
    sku: 'ARV-ACC-801',
    inStock: true
  },
  {
    id: 'arv-802',
    name: 'Antwerp Heavy Linen Market Tote',
    subtitle: 'Structured Eco-Linen Carryall',
    categoryId: 'heritage-accessories',
    categoryName: 'Heritage Craft Accessories',
    priceINR: 3490,
    priceEUR: 44,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Stone Beige', hex: '#EFE6D8' },
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['One Size (45 x 40 x 15 cm)'],
    fabric: 'Heavyweight 380 GSM Duck Linen & Vegetable Tanned Leather Handles',
    gsm: 380,
    fit: 'Spacious Daily Utility',
    description: 'Spacious everyday tote reinforced with internal pocketing, key clasp, and solid brass magnetic snaps.',
    sustainabilityNotes: 'Zero synthetic linings.',
    rating: 4.8,
    reviewCount: 68,
    sku: 'ARV-ACC-802',
    inStock: true
  },

  // ADDITIONAL VARIETY TO TOTAL 28+ PRODUCTS
  {
    id: 'arv-105',
    name: 'Geneva Linen Utility Shirt Dress',
    subtitle: 'Belted Safari Style Dress',
    categoryId: 'pure-linen',
    categoryName: 'Pure Linen Couture',
    priceINR: 6790,
    priceEUR: 84,
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Olive Green', hex: '#4A5D4E' },
      { name: 'Warm Sand', hex: '#D8C6A5' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Pre-washed Linen',
    gsm: 195,
    fit: 'Structured Belted Silhouette',
    description: 'Chest flap pockets, button-down front, and detachable self-fabric belt.',
    sustainabilityNotes: 'Natural shell buttons.',
    rating: 4.8,
    reviewCount: 45,
    sku: 'ARV-LNN-105',
    inStock: true
  },
  {
    id: 'arv-106',
    name: 'Zurich Short-Sleeve Linen Resort Shirt',
    subtitle: 'Camp Collar Casual Shirt',
    categoryId: 'pure-linen',
    categoryName: 'Pure Linen Couture',
    priceINR: 4490,
    priceEUR: 56,
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Stone Beige', hex: '#EFE6D8' },
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    fabric: '100% Organic Linen',
    gsm: 175,
    fit: 'Boxy Camp Collar Fit',
    description: 'Ideal for summer layering with wide sleeves and clean back yoke fold.',
    sustainabilityNotes: 'Waterless bio-softening treatment.',
    rating: 4.9,
    reviewCount: 92,
    sku: 'ARV-LNN-106',
    inStock: true
  },
  {
    id: 'arv-204',
    name: 'Stuttgart Organic Cotton Chino Shorts',
    subtitle: 'Tailored Mid-Length Shorts',
    categoryId: 'organic-cotton',
    categoryName: 'Organic Cotton Essentials',
    priceINR: 3790,
    priceEUR: 48,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Warm Sand', hex: '#D8C6A5' },
      { name: 'Charcoal Black', hex: '#1C1C1C' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: '100% Organic Cotton Twill',
    gsm: 230,
    fit: 'Tailored Above-Knee Cut',
    description: 'Durable organic cotton twill shorts with horn button closure and coin pocket detail.',
    sustainabilityNotes: 'GOTS certified organic cotton.',
    rating: 4.7,
    reviewCount: 38,
    sku: 'ARV-COT-204',
    inStock: true
  },
  {
    id: 'arv-205',
    name: 'Bonn Organic Cotton Crewneck Sweatshirt',
    subtitle: 'Loopback French Terry Fleece',
    categoryId: 'organic-cotton',
    categoryName: 'Organic Cotton Essentials',
    priceINR: 4990,
    priceEUR: 62,
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Forest Green', hex: '#214C3A' },
      { name: 'Taupe', hex: '#8C7A6B' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    fabric: '100% Organic Loopback French Terry',
    gsm: 360,
    fit: 'Relaxed Unisex Cut',
    description: 'Unbrushed heavy organic jersey offering breathable warmth.',
    sustainabilityNotes: 'Dyed using non-toxic herbal extracts.',
    rating: 4.9,
    reviewCount: 114,
    sku: 'ARV-COT-205',
    inStock: true
  },
  {
    id: 'arv-304',
    name: 'Vienna Minimal Cropped Linen Jacket',
    subtitle: 'Structured Collarless Jacket',
    categoryId: 'coats-jackets',
    categoryName: 'Artisanal Trench Coats & Jackets',
    priceINR: 7490,
    priceEUR: 92,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    fabric: '100% Pre-washed Heavyweight Linen',
    gsm: 280,
    fit: 'Cropped Boxy Cut',
    description: 'Clean collarless jacket with subtle hidden snap closures and wide cuffs.',
    sustainabilityNotes: 'Fair Trade export certified factory production.',
    rating: 4.8,
    reviewCount: 33,
    sku: 'ARV-JAC-304',
    inStock: true
  },
  {
    id: 'arv-404',
    name: 'Stockholm Tiered Linen Maxi Skirt',
    subtitle: 'Elasticated Waist Fluid Skirt',
    categoryId: 'scandi-dresses',
    categoryName: 'Scandinavian Minimal Dresses',
    priceINR: 5290,
    priceEUR: 66,
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Warm Sand', hex: '#D8C6A5' },
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Organic Linen',
    gsm: 180,
    fit: 'Full Maxi Length',
    description: 'Voluminous tiered skirt with deep pockets and comfortable gathered waist.',
    sustainabilityNotes: 'Natural indigo and botanical dyeing.',
    rating: 4.9,
    reviewCount: 78,
    sku: 'ARV-DRS-404',
    inStock: true
  },
  {
    id: 'arv-503',
    name: 'Uppsala Pleated Linen Shorts',
    subtitle: 'High-Rise Tailored Shorts',
    categoryId: 'trousers-pants',
    categoryName: 'Tailored Trousers & Culottes',
    priceINR: 3990,
    priceEUR: 50,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Stone Beige', hex: '#EFE6D8' },
      { name: 'Warm Sand', hex: '#D8C6A5' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Organic Linen',
    gsm: 210,
    fit: 'High-Rise Relaxed Shorts',
    description: 'Tailored front pleats, thick belt loops, and back double welt pockets.',
    sustainabilityNotes: 'Recycled paper packaging & organic labels.',
    rating: 4.8,
    reviewCount: 51,
    sku: 'ARV-TRS-503',
    inStock: true
  },
  {
    id: 'arv-603',
    name: 'Helsinki Silk-Cotton Sleeveless Knit',
    subtitle: 'Ribbed Turtleneck Shell',
    categoryId: 'silk-wool-knits',
    categoryName: 'Artisanal Silk-Wool Knitwear',
    priceINR: 4990,
    priceEUR: 62,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Charcoal Black', hex: '#1C1C1C' }
    ],
    sizes: ['S', 'M', 'L'],
    fabric: '55% Silk, 45% Organic Cotton',
    gsm: 180,
    fit: 'Slim Sculpted Cut',
    description: 'Refined high-neck shell ideal for under-blazer layering.',
    sustainabilityNotes: 'Hypoallergenic natural fiber construction.',
    rating: 4.7,
    reviewCount: 29,
    sku: 'ARV-KNT-603',
    inStock: true
  },
  {
    id: 'arv-703',
    name: 'Mykonos Organic Linen Wrap Tunic',
    subtitle: 'Side Tie Resort Tunic',
    categoryId: 'eco-resort',
    categoryName: 'Eco-Luxury Resort Wear',
    priceINR: 5990,
    priceEUR: 75,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Warm Sand', hex: '#D8C6A5' },
      { name: 'Ivory White', hex: '#FAF8F4' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Organic Hand-loomed Linen',
    gsm: 160,
    fit: 'Fluid Asymmetric Wrap',
    description: 'Side ties allow custom silhouette adjustment from relaxed to fitted.',
    sustainabilityNotes: 'Woven on traditional pit looms.',
    rating: 4.8,
    reviewCount: 46,
    sku: 'ARV-RSR-703',
    inStock: true
  },
  {
    id: 'arv-803',
    name: 'Jaipur Hand-Block Linen Scarf',
    subtitle: 'Natural Indigo Artisan Scarf',
    categoryId: 'heritage-accessories',
    categoryName: 'Heritage Craft Accessories',
    priceINR: 3290,
    priceEUR: 42,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Forest Green', hex: '#214C3A' },
      { name: 'Olive Green', hex: '#4A5D4E' }
    ],
    sizes: ['One Size (65 x 190 cm)'],
    fabric: '100% Organic Linen',
    gsm: 135,
    fit: 'Rectangular Stole',
    description: 'Subtle geometric block prints crafted using carved teakwood blocks in Sanganer, Jaipur.',
    sustainabilityNotes: '100% natural vegetable dyes.',
    rating: 4.9,
    reviewCount: 95,
    sku: 'ARV-ACC-803',
    inStock: true
  }
];
