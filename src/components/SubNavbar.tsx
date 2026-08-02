import React from 'react';
import { 
  PackageCheck, 
  Heart, 
  ShoppingBag, 
  ShieldAlert, 
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { Currency, User, CartItem, WishlistItem, ActiveTab } from '../types';

interface SubNavbarProps {
  user: User;
  currency: Currency;
  cart: CartItem[];
  wishlist: WishlistItem[];
  onNavigateBuyNow: () => void;
  onOpenTrackOrder: () => void;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onOpenAdminPanel: () => void;
}

export const SubNavbar: React.FC<SubNavbarProps> = () => {
  return null;
};
