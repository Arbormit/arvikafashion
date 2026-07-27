import React, { useState } from 'react';
import { X, Search, PackageCheck, Truck, ShieldCheck, Check, Clock, FileText, ArrowRight } from 'lucide-react';
import { Order, Currency } from '../types';
import { db } from '../services/db';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onViewInvoice: (order: Order) => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  currency,
  onViewInvoice
}) => {
  if (!isOpen) return null;

  const [inputQuery, setInputQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFoundOrder(null);
    setHasSearched(true);

    if (!inputQuery.trim()) {
      setErrorMsg('Please enter a valid Tracking ID or Invoice Number.');
      return;
    }

    const match = db.getOrderByTrackingId(inputQuery.trim());
    if (match) {
      setFoundOrder(match);
    } else {
      setErrorMsg(`No active order found with Tracking ID "${inputQuery.trim()}". Please check your receipt or email confirmation.`);
    }
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Payment Verified': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Out for Delivery': return 4;
      case 'Delivered': return 5;
      default: return 0;
    }
  };

  const steps = [
    { label: 'Order Placed', desc: 'Received by Atelier' },
    { label: 'Payment Verified', desc: 'UPI UTR / Card Approved' },
    { label: 'Processing', desc: 'Quality Check & Packing' },
    { label: 'Shipped', desc: 'DHL Express Dispatch' },
    { label: 'Out for Delivery', desc: 'Local Courier Delivery' },
    { label: 'Delivered', desc: 'Signed & Received' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in overflow-y-auto font-sans">
      <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE6D8]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#214C3A] text-[#D8C6A5] flex items-center justify-center font-serif font-bold text-lg">
              AR
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#214C3A]">Real-Time Order Tracking</h2>
              <p className="text-xs text-[#8C7A6B]">Enter your unique Order Tracking ID (e.g. ARV-20260727-8X4K9P)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#1C1C1C]/70 hover:text-[#214C3A] rounded-full hover:bg-[#EFE6D8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="e.g. ARV-20260720-9X2M4K or INV-2026-10492"
              className="w-full bg-white pl-12 pr-28 py-3.5 rounded-2xl border border-[#D8C6A5] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#214C3A]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#214C3A] hover:bg-[#4A5D4E] text-[#FAF8F4] px-4 py-2 rounded-xl text-xs font-montserrat font-bold transition-all"
            >
              Track Order
            </button>
          </div>

          {/* Quick Demo Tracking ID Helper */}
          <div className="text-[11px] text-[#8C7A6B] flex items-center gap-1.5">
            <span>Try demo tracking ID:</span>
            <button
              type="button"
              onClick={() => {
                setInputQuery('ARV-20260720-9X2M4K');
                setFoundOrder(db.getOrderByTrackingId('ARV-20260720-9X2M4K'));
                setHasSearched(true);
                setErrorMsg(null);
              }}
              className="font-mono text-[#214C3A] font-bold underline hover:text-[#4A5D4E]"
            >
              ARV-20260720-9X2M4K
            </button>
          </div>
        </form>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs text-center font-medium animate-fade-in">
            {errorMsg}
          </div>
        )}

        {/* Order Tracking Details View */}
        {foundOrder && (
          <div className="space-y-6 pt-2 animate-fade-in">
            
            {/* Top Status Summary Card */}
            <div className="bg-white border border-[#D8C6A5] p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#EFE6D8] pb-3">
                <div>
                  <span className="text-[10px] uppercase font-montserrat font-bold text-[#8C7A6B]">
                    Tracking ID: <strong className="font-mono text-[#214C3A]">{foundOrder.orderTrackingId}</strong>
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#214C3A] mt-0.5">
                    Order Status: <span className="text-emerald-800">{foundOrder.status}</span>
                  </h3>
                </div>

                <button
                  onClick={() => onViewInvoice(foundOrder)}
                  className="bg-[#EFE6D8] hover:bg-[#D8C6A5] text-[#214C3A] px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center space-x-1.5 w-max"
                >
                  <FileText className="w-4 h-4 text-[#C5A059]" />
                  <span>View Tax Invoice</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#8C7A6B] block">Order Date</span>
                  <span className="font-bold text-[#214C3A]">{foundOrder.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C7A6B] block">Est. Delivery</span>
                  <span className="font-bold text-[#214C3A]">{foundOrder.estimatedDelivery}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C7A6B] block">Air Waybill</span>
                  <span className="font-mono text-[11px] text-[#214C3A]">{foundOrder.trackingNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C7A6B] block">Payment Verification</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                    {foundOrder.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Tracking Progress Timeline Bar */}
            <div className="bg-white border border-[#EFE6D8] p-5 rounded-2xl space-y-4">
              <h4 className="font-serif font-bold text-base text-[#214C3A]">Shipment Journey Progress</h4>
              
              <div className="relative flex items-center justify-between">
                {steps.map((step, idx) => {
                  const currentIdx = getStatusStepIndex(foundOrder.status);
                  const isDone = idx <= currentIdx;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'bg-[#214C3A] text-[#D8C6A5] shadow-md border-2 border-[#C5A059]'
                            : 'bg-[#EFE6D8] text-[#8C7A6B]'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[10px] font-montserrat font-bold mt-2 ${isDone ? 'text-[#214C3A]' : 'text-[#8C7A6B]'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Log History */}
            <div className="bg-white border border-[#EFE6D8] p-5 rounded-2xl space-y-3">
              <h4 className="font-serif font-bold text-base text-[#214C3A] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C5A059]" />
                <span>Tracking History Log</span>
              </h4>

              <div className="space-y-2.5 divide-y divide-[#EFE6D8] text-xs">
                {foundOrder.statusHistory.map((hist, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between">
                    <div>
                      <span className="font-montserrat font-bold text-[#214C3A] block">{hist.status}</span>
                      <p className="text-[11px] text-[#8C7A6B] mt-0.5">{hist.note}</p>
                    </div>
                    <span className="text-[10px] text-[#8C7A6B] font-mono whitespace-nowrap pl-2">
                      {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
