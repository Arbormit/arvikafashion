import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, Home, UserCheck, AlertTriangle } from 'lucide-react';
import { User } from '../types';

interface ForbiddenViewProps {
  user: User;
  onGoHome: () => void;
  onOpenAuth: () => void;
}

export const ForbiddenView: React.FC<ForbiddenViewProps> = ({ user, onGoHome, onOpenAuth }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#FAF8F4] font-sans">
      <div className="max-w-xl w-full bg-white border border-[#EFE6D8] rounded-3xl p-8 sm:p-10 text-center shadow-xl relative overflow-hidden space-y-6">
        
        {/* Decorative Alert Backdrop Header */}
        <div className="w-20 h-20 bg-[#FAF0E6] border border-[#E8D0BE] text-[#A84332] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-bounce" />
        </div>

        {/* Security Alert Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 bg-[#A84332]/10 text-[#A84332] px-3 py-1 rounded-full text-xs font-montserrat font-bold tracking-wide">
            <Lock className="w-3.5 h-3.5" />
            <span>HTTP 403 • RESTRICTED ADMIN ROUTE</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#214C3A]">
            Access Denied / Authorisation Required
          </h1>
          <p className="text-xs text-[#8C7A6B] leading-relaxed max-w-md mx-auto">
            The HQ Admin Panel is protected by strict Role-Based Access Control (RBAC). Your current user account does not possess authorized administrator privileges.
          </p>
        </div>

        {/* Audit Context Box */}
        <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-2xl p-4 text-left text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[#EFE6D8] pb-2 text-[#8C7A6B] font-montserrat font-semibold text-[11px]">
            <span>Security Audit Trace</span>
            <span className="text-[#A84332]">RBAC ENFORCED</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#8C7A6B] block">Current User:</span>
              <span className="font-semibold text-[#214C3A]">{user.isLoggedIn ? user.email : 'Unauthenticated Visitor'}</span>
            </div>
            <div>
              <span className="text-[#8C7A6B] block">Assigned Role:</span>
              <span className="font-bold uppercase text-[#A84332]">{user.role || 'GUEST'}</span>
            </div>
            <div>
              <span className="text-[#8C7A6B] block">Protected Route:</span>
              <span className="font-mono text-[#214C3A]">/admin (HQ Dashboard)</span>
            </div>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="flex items-start space-x-2 bg-[#FFF8EE] border border-[#F5E2C8] text-[#8A5B29] p-3 rounded-xl text-[11px] text-left">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Admin privileges cannot be self-assigned through registration, URL parameter tampering, or client state modification. All unauthorized access attempts are logged for security auditing.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onGoHome}
            className="bg-[#214C3A] text-[#FAF8F4] px-6 py-3 rounded-xl font-montserrat font-bold text-xs hover:bg-[#4A5D4E] transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Boutique Home</span>
          </button>

          {!user.isLoggedIn && (
            <button
              onClick={onOpenAuth}
              className="border border-[#214C3A] text-[#214C3A] hover:bg-[#214C3A] hover:text-[#FAF8F4] px-6 py-3 rounded-xl font-montserrat font-bold text-xs transition-all flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In as Admin</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
