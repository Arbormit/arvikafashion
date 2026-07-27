import React, { useState } from 'react';
import { X, User as UserIcon, Lock, Mail, Sparkles, Check, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { db } from '../services/db';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, setUser }) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loggedUser = db.login(email || 'freja.lindqvist@copenhagen.dk', 'customer');
    setUser(loggedUser);
    onClose();
  };

  const handleDemoLogin = () => {
    const loggedUser = db.login('freja.lindqvist@copenhagen.dk', 'customer');
    setUser(loggedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#1C1C1C]/70 hover:text-[#214C3A] rounded-full hover:bg-[#EFE6D8]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#214C3A] text-[#D8C6A5] font-serif font-bold text-xl flex items-center justify-center mx-auto shadow-md">
            AR
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#214C3A]">
            {mode === 'login' ? 'Client Sign In' : 'Create Arvika Account'}
          </h2>
          <p className="text-xs text-[#8C7A6B] font-sans">
            Access VIP European promotions, order tracking, and wishlist synchronization.
          </p>
        </div>

        {/* Demo Fast Login Triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleDemoLogin}
            className="w-full bg-[#EFE6D8] border border-[#D8C6A5] text-[#214C3A] p-2.5 rounded-2xl text-[11px] font-montserrat font-bold hover:bg-[#D8C6A5] transition-all flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Demo Customer Login</span>
          </button>

          <button
            onClick={() => {
              const adminUser = db.login('admin@arvikafashion.com', 'admin');
              setUser(adminUser);
              onClose();
            }}
            className="w-full bg-[#214C3A] text-[#FAF8F4] p-2.5 rounded-2xl text-[11px] font-montserrat font-bold hover:bg-[#4A5D4E] transition-all flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-[#D8C6A5]" />
            <span>Demo Store Admin Login</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#EFE6D8]"></div>
          <span className="flex-shrink mx-3 text-[10px] font-montserrat uppercase text-[#8C7A6B] font-bold">Or Email</span>
          <div className="flex-grow border-t border-[#EFE6D8]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {mode === 'signup' && (
            <div>
              <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Freja Lindqvist"
                  className="w-full bg-white pl-9 pr-3 py-2.5 rounded-xl border border-[#D8C6A5] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="freja@copenhagen.dk"
                className="w-full bg-white pl-9 pr-3 py-2.5 rounded-xl border border-[#D8C6A5] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white pl-9 pr-3 py-2.5 rounded-xl border border-[#D8C6A5] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#214C3A] hover:bg-[#4A5D4E] text-[#FAF8F4] py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#EFE6D8]">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-xs text-[#214C3A] underline font-montserrat font-semibold"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already registered? Sign In'}
          </button>
        </div>

      </div>
    </div>
  );
};
