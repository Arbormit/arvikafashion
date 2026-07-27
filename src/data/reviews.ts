import { Review } from '../types';

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    userName: 'Freja Lindqvist',
    country: '🇩🇰 Denmark (Copenhagen)',
    rating: 5,
    title: 'The fabric quality surpasses high-end European labels',
    comment: 'I ordered the Stockholm Oversized Linen Shirt and Reykjavik Midi Dress. The drape, stitching, and French seam bindings are immaculate. Better handfeel than brands charging three times as much in Scandinavian boutiques.',
    date: 'July 18, 2026',
    isVerifiedBuyer: true,
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    helpfulCount: 34
  },
  {
    id: 'rev-2',
    userName: 'Ananya Sharma',
    country: '🇮🇳 India (New Delhi)',
    rating: 5,
    title: 'Proud of Indian Export Craftsmanship',
    comment: 'The Arvika Signature Trench Coat arrived in gorgeous plastic-free organic linen packaging. Fits like custom bespoke tailoring. The Jaipur linen weave is so breathable for humid weather.',
    date: 'July 12, 2026',
    isVerifiedBuyer: true,
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    helpfulCount: 28
  },
  {
    id: 'rev-3',
    userName: 'Maximilian Weber',
    country: '🇩🇪 Germany (Munich)',
    rating: 5,
    title: 'Exceptional Organic Cotton & Zero Flaws',
    comment: 'We sourced bulk organic tees for our boutique in Munich after testing Arvika samples. The 240 GSM organic slub cotton holds wash after wash without losing elasticity. Outstanding communication with their Faridabad export team.',
    date: 'July 05, 2026',
    isVerifiedBuyer: true,
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    helpfulCount: 19
  },
  {
    id: 'rev-4',
    userName: 'Claire Laurent',
    country: '🇫🇷 France (Paris)',
    rating: 5,
    title: 'Understated Luxury at its Purest',
    comment: 'The Turku Silk-Merino Knit Sweater is heavenly. Ultra light yet warm enough for Parisian autumn evenings. The natural dye hues match minimalist wardrobe aesthetics perfectly.',
    date: 'June 29, 2026',
    isVerifiedBuyer: true,
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    helpfulCount: 42
  },
  {
    id: 'rev-5',
    userName: 'Astrid Sorensen',
    country: '🇸🇪 Sweden (Stockholm)',
    rating: 5,
    title: 'Fast DHL Global Express & Sustainable Packaging',
    comment: 'Delivered to Stockholm in 4 business days! Appreciated the linen wash-care handbook included in the parcel. Will definitely order the trench coat next.',
    date: 'June 20, 2026',
    isVerifiedBuyer: true,
    userAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
    helpfulCount: 15
  }
];
