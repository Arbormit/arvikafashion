import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Clock, 
  Sparkles, 
  Send, 
  Check, 
  Globe, 
  ShieldCheck, 
  Building,
  Truck
} from 'lucide-react';

import { db } from '../services/db';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Export & Wholesale Inquiry',
    message: ''
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    db.addInquiry({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message
    });

    setToastMessage('Thank you! Your message has been saved & routed to Arvika Atelier HQ. We will respond shortly! 📩');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'Export & Wholesale Inquiry',
      message: ''
    });

    setTimeout(() => setToastMessage(null), 5000);
  };

  const whatsappUrl1 = `https://wa.me/919891179374?text=${encodeURIComponent(
    'Hello Arvika Fashion! I am inquiring from your website regarding European export collections & custom tailoring.'
  )}`;

  const whatsappUrl2 = `https://wa.me/919716505898?text=${encodeURIComponent(
    'Hello Arvika Fashion! I am inquiring from your website regarding European export collections & custom tailoring.'
  )}`;

  return (
    <div className="min-h-screen bg-[#FAF8F4] font-sans pb-20 space-y-16 animate-fade-in">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#7B9B88] text-white px-6 py-3 rounded-full text-xs font-montserrat font-bold shadow-2xl border border-[#688875] flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Section */}
      <section className="bg-[#E8F0EC] text-[#2D2A26] py-16 px-4 sm:px-6 lg:px-8 border-b border-[#D5E4DC] relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-4 relative z-10">
          <span className="text-xs font-montserrat uppercase tracking-[0.3em] text-[#4E6E5D] font-bold inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-[#7B9B88]/30 shadow-xs">
            Contact Arvika Fashion 
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2A26]">
            Get in Touch with Our European Export & Craft Atelier
          </h1>
        </div>

        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#7B9B88_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Contact Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Mobile & Call Desk */}
          <div className="bg-white border border-[#EAE2D7] p-6 rounded-3xl space-y-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0EC] border border-[#D5E4DC] text-[#7B9B88] flex items-center justify-center">
              <Phone className="w-6 h-6 text-[#7B9B88]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2D2A26]">Phone & Hotline</h3>
              <p className="text-xs text-[#7B9B88] mt-0.5">Mon-Sat (09:00 - 20:00 IST / CET)</p>
            </div>
            <div className="space-y-1 font-mono text-xs text-[#2D2A26] font-bold">
              <div>🇮🇳 +91 9891179374 (India)</div>
              <div>🇮🇳 +91 9716505898 (India)</div>
            </div>
          </div>

          {/* Card 2: WhatsApp Chat */}
          <div className="bg-white border border-[#EAE2D7] p-6 rounded-3xl space-y-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2D2A26]">WhatsApp Support</h3>
              <p className="text-xs text-[#7B9B88] mt-0.5">Instant Chat & String Order Support</p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={whatsappUrl1}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-xl font-montserrat text-xs font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp: +91 9891179374</span>
              </a>
              <a
                href={whatsappUrl2}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 bg-[#7B9B88] hover:bg-[#688875] text-white px-3 py-2 rounded-xl font-montserrat text-xs font-bold transition-all shadow-xs border border-[#688875]"
              >
                <MessageCircle className="w-3.5 h-3.5 text-white" />
                <span>WhatsApp: +91 9716505898</span>
              </a>
            </div>
          </div>

          {/* Card 3: Email Channels */}
          <div className="bg-white border border-[#EAE2D7] p-6 rounded-3xl space-y-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0EC] border border-[#D5E4DC] text-[#7B9B88] flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#7B9B88]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2D2A26]">Official Email</h3>
              <p className="text-xs text-[#7B9B88] mt-0.5">Direct Correspondence & B2B</p>
            </div>
            <div className="space-y-1 text-xs text-[#2D2A26] font-semibold">
              <div className="font-mono text-[#7B9B88]">export@arvikafashion.com</div>
            </div>
          </div>

          {/* Card 4: Operating Hours */}
          <div className="bg-white border border-[#EAE2D7] p-6 rounded-3xl space-y-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0EC] border border-[#D5E4DC] text-[#7B9B88] flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#7B9B88]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2D2A26]">Operating Hours</h3>
              <p className="text-xs text-[#7B9B88] mt-0.5">Global Shipping Dispatch</p>
            </div>
            <div className="text-xs text-[#2D2A26] space-y-1">
              <div className="font-semibold">Mon - Sat: 09:00 - 20:00</div>
              <div className="text-[#7B9B88]">Sunday: Closed (Atelier Rest)</div>
            </div>
          </div>

        </div>

        {/* Form & Location Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Message Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-[#EAE2D7] p-8 sm:p-10 rounded-3xl shadow-xs space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-montserrat uppercase tracking-wider text-[#7B9B88] font-bold flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#7B9B88]" />
                SEND DIRECT INQUIRY
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#2D2A26]">
                Send A Message To Our Team
              </h2>
              <p className="text-xs text-[#7B9B88]">
                Fill in the details below and our client coordinator will reach out directly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-montserrat font-bold text-[#2D2A26] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Astrid Lindgren"
                    className="w-full bg-[#FAF8F4] p-3 rounded-xl border border-[#D5E4DC] text-xs focus:outline-none focus:ring-2 focus:ring-[#7B9B88] text-[#2D2A26]"
                  />
                </div>

                <div>
                  <label className="block font-montserrat font-bold text-[#2D2A26] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. astrid@copenhagen.dk"
                    className="w-full bg-[#FAF8F4] p-3 rounded-xl border border-[#D5E4DC] text-xs focus:outline-none focus:ring-2 focus:ring-[#7B9B88] text-[#2D2A26]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-montserrat font-bold text-[#2D2A26] mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +45 20 12 34 56"
                    className="w-full bg-[#FAF8F4] p-3 rounded-xl border border-[#D5E4DC] text-xs focus:outline-none focus:ring-2 focus:ring-[#7B9B88] text-[#2D2A26]"
                  />
                </div>

                <div>
                  <label className="block font-montserrat font-bold text-[#2D2A26] mb-1">Inquiry Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#FAF8F4] p-3 rounded-xl border border-[#D5E4DC] text-xs focus:outline-none font-sans text-[#2D2A26]"
                  >
                    <option value="Export & Wholesale Inquiry">Export & Wholesale Inquiry</option>
                    <option value="Custom Sizing & Tailoring">Custom Sizing & Tailoring</option>
                    <option value="Active Order & Tracking Support">Active Order & Tracking Support</option>
                    <option value="B2B European Distribution">B2B European Distribution</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-montserrat font-bold text-[#2D2A26] mb-1">Message Details *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your inquiry, requested fabric samples, or custom sizing requirements..."
                  className="w-full bg-[#FAF8F4] p-3 rounded-xl border border-[#D5E4DC] text-xs focus:outline-none focus:ring-2 focus:ring-[#7B9B88] text-[#2D2A26]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#7B9B88] text-white hover:bg-[#688875] py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>

          {/* Right Column: Office Locations & Certification (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Atelier HQ 1: India Manufacturing */}
            <div className="bg-[#E8F0EC]/60 border border-[#D5E4DC] p-6 rounded-3xl space-y-3">
              <div className="flex items-center space-x-2 text-[#2D2A26]">
                <Building className="w-5 h-5 text-[#7B9B88]" />
                <h3 className="font-serif font-bold text-lg">Our Head Office (India)</h3>
              </div>
              <div className="text-xs text-[#2D2A26]/90 font-sans space-y-1 border-t border-[#D5E4DC] pt-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#7B9B88] shrink-0 mt-0.5" />
                  <span>H23, G4 Krishna Nagar Faridabad near Krishna Public School - 121003 India</span>
                </div>
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-[#2D2A26]">
                  <Phone className="w-3.5 h-3.5 text-[#7B9B88]" />
                  <span>+91 9891179374</span>
                  <span>+91 9716505898</span>
                </div>
              </div>
            </div>

            {/* Atelier HQ 2: Factory Location */}
            <div className="bg-white border border-[#EAE2D7] p-6 rounded-3xl space-y-3">
              <div className="flex items-center space-x-2 text-[#2D2A26]">
                <Globe className="w-5 h-5 text-[#7B9B88]" />
                <h3 className="font-serif font-bold text-lg">Factory :</h3>
              </div>
              <div className="text-xs text-[#2D2A26]/90 font-sans space-y-1 border-t border-[#EAE2D7] pt-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#7B9B88] shrink-0 mt-0.5" />
                  <span>H. No. 76, Sector 91, Surya Nagar Phase 2, near IT Computer Center Faridabad - 121003 India</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
