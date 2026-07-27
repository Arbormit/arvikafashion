import React, { useState } from 'react';
import { X, User as UserIcon, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import { db } from '../services/db';
import { AuthService } from '../services/authService';

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
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evaluate password strength live for signup mode
  const passwordEvaluation = AuthService.evaluatePasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const cleanEmail = AuthService.sanitize(email, 120).toLowerCase();
    const cleanPassword = password.trim();

    if (!AuthService.isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    if (mode === 'signup') {
      const cleanName = AuthService.sanitize(name, 100);
      if (!cleanName || cleanName.length < 2) {
        setErrorMessage('Full Name must be at least 2 characters long.');
        setIsSubmitting(false);
        return;
      }

      if (!passwordEvaluation.isValid) {
        setErrorMessage('Password does not meet security requirements. Must be at least 8 characters with letters & numbers.');
        setIsSubmitting(false);
        return;
      }

      // Execute Signup (Strictly assigns role: 'customer')
      try {
        const newUser = db.signup(cleanName, cleanEmail, cleanPassword);
        setUser(newUser);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Error creating account. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Execute Login
      try {
        const loggedUser = db.login(cleanEmail);
        setUser(loggedUser);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#1C1C1C]/70 hover:text-[#214C3A] rounded-full hover:bg-[#EFE6D8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#214C3A] text-[#D8C6A5] font-serif font-bold text-xl flex items-center justify-center mx-auto shadow-md border border-[#C5A059]/40">
            AR
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#214C3A]">
            {mode === 'login' ? 'Client Sign In' : 'Create Arvika Account'}
          </h2>
          <p className="text-xs text-[#8C7A6B] font-sans">
            Access VIP European promotions, order tracking, and wishlist synchronization.
          </p>
        </div>

        {/* Security Error Banner */}
        {errorMessage && (
          <div className="bg-[#FFF2F0] border border-[#FAD2CE] text-[#A84332] p-3 rounded-2xl text-xs flex items-start space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {mode === 'signup' && (
            <div>
              <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Freja Lindqvist"
                  className="w-full bg-white pl-9 pr-3 py-2.5 rounded-xl border border-[#D8C6A5] focus:outline-none focus:ring-2 focus:ring-[#214C3A]/30 text-xs"
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
                maxLength={120}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="freja@copenhagen.dk"
                className="w-full bg-white pl-9 pr-3 py-2.5 rounded-xl border border-[#D8C6A5] focus:outline-none focus:ring-2 focus:ring-[#214C3A]/30 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                maxLength={64}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white pl-9 pr-10 py-2.5 rounded-xl border border-[#D8C6A5] focus:outline-none focus:ring-2 focus:ring-[#214C3A]/30 text-xs"
              />
              {/* Show/Hide Password Eye Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#214C3A] transition-colors p-1"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live OWASP Password Strength Meter for Signup */}
            {mode === 'signup' && password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-montserrat font-semibold">
                  <span className="text-[#8C7A6B]">Password Security Level:</span>
                  <span className={passwordEvaluation.isValid ? 'text-[#214C3A] font-bold' : 'text-[#A84332]'}>
                    {passwordEvaluation.feedback}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#EFE6D8] rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      passwordEvaluation.score <= 1 ? 'bg-[#A84332] w-1/4' :
                      passwordEvaluation.score === 2 ? 'bg-[#C5A059] w-2/4' :
                      passwordEvaluation.score === 3 ? 'bg-[#214C3A] w-3/4' : 'bg-[#1A3D2F] w-full'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#214C3A] hover:bg-[#4A5D4E] disabled:opacity-50 text-[#FAF8F4] py-3 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 mt-2"
          >
            <span>{isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#EFE6D8]">
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setMode(mode === 'login' ? 'signup' : 'login');
            }}
            className="text-xs text-[#214C3A] underline font-montserrat font-semibold hover:text-[#4A5D4E]"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already registered? Sign In'}
          </button>
        </div>

      </div>
    </div>
  );
};
