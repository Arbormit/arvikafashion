import React from 'react';
import { Lock, Home, UserCheck } from 'lucide-react';
import { User } from '../types';

interface ForbiddenViewProps {
  user: User;
  onGoHome: () => void;
  onOpenAuth: () => void;
}

export const ForbiddenView: React.FC<ForbiddenViewProps> = ({ user, onGoHome, onOpenAuth }) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#FAF8F4] font-sans">
      <div className="max-w-md w-full bg-white border border-[#EFE6D8] rounded-3xl p-8 sm:p-10 text-center shadow-lg space-y-6">
        
        {/* Clean Enterprise Icon */}
        <div className="w-16 h-16 bg-[#EFE6D8]/60 text-[#214C3A] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        {/* User-facing Message */}
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-[#214C3A]">
            Access Denied
          </h1>
          <p className="text-xs text-[#8C7A6B] leading-relaxed max-w-sm mx-auto">
            You do not have permission to view this page. Please sign in with an authorized account or return to the store homepage.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onGoHome}
            className="bg-[#214C3A] text-[#FAF8F4] px-6 py-3 rounded-xl font-montserrat font-bold text-xs hover:bg-[#1A3D2F] transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Homepage</span>
          </button>

          {!user.isLoggedIn && (
            <button
              onClick={onOpenAuth}
              className="border border-[#214C3A] text-[#214C3A] hover:bg-[#214C3A] hover:text-[#FAF8F4] px-6 py-3 rounded-xl font-montserrat font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
