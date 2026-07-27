import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  LogOut, 
  PackageCheck, 
  MapPin, 
  ShieldCheck, 
  Mail, 
  Phone, 
  FileText,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Lock,
  Camera,
  Settings,
  Globe,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  SlidersHorizontal
} from 'lucide-react';
import { User, Order, Currency, Address, UserPreferences } from '../types';
import { db, SHOP_PHONE } from '../services/db';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  currency: Currency;
  onViewInvoice: (order: Order) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  setUser,
  currency,
  onViewInvoice
}) => {
  if (!isOpen || !user.isLoggedIn) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [userOrders, setUserOrders] = useState<Order[]>(() => db.getOrdersByUserId(user.id, user.email));

  // Profile Form States
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  
  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Preferences State
  const [preferences, setPreferences] = useState<UserPreferences>(user.preferences || {
    currency: 'EUR',
    emailNotifications: true,
    whatsappAlerts: true,
    marketingOptIn: true
  });

  // Address Modal / Form State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [addrFullName, setAddrFullName] = useState(user.name || '');
  const [addrPhone, setAddrPhone] = useState(user.phone || '');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrCountry, setAddrCountry] = useState('Denmark');
  const [isDefaultShipping, setIsDefaultShipping] = useState(false);
  const [isDefaultBilling, setIsDefaultBilling] = useState(false);

  // UI Toast & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    db.logout();
    setUser(db.getCurrentUser());
    onClose();
  };

  // Avatar Upload Handler (File -> Base64)
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile Form Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match!');
        return;
      }
      if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters.');
        return;
      }
    }

    const updated = db.updateUserProfile(user.id, {
      name,
      email,
      phone,
      avatar: avatarUrl,
      preferences
    });

    setUser(updated);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Profile & account preferences updated successfully!');
  };

  // Address Save
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();

    const addressObj: Address = {
      id: editingAddressId || `addr_${Date.now()}`,
      label: addressLabel,
      fullName: addrFullName,
      phone: addrPhone,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      zipCode: addrZip,
      country: addrCountry,
      isDefaultShipping,
      isDefaultBilling
    };

    const updatedUser = db.saveAddress(user.id, addressObj);
    setUser(updatedUser);
    setIsEditingAddress(false);
    showToast('Address saved to address book!');
  };

  // Delete Address
  const handleDeleteAddress = (addressId: string) => {
    const updatedUser = db.deleteAddress(user.id, addressId);
    setUser(updatedUser);
    showToast('Address removed.');
  };

  // Open Edit Address Form
  const startEditAddress = (addr?: Address) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressLabel(addr.label);
      setAddrFullName(addr.fullName);
      setAddrPhone(addr.phone);
      setAddrStreet(addr.street);
      setAddrCity(addr.city);
      setAddrState(addr.state);
      setAddrZip(addr.zipCode);
      setAddrCountry(addr.country);
      setIsDefaultShipping(!!addr.isDefaultShipping);
      setIsDefaultBilling(!!addr.isDefaultBilling);
    } else {
      setEditingAddressId(null);
      setAddressLabel('Home');
      setAddrFullName(user.name);
      setAddrPhone(user.phone || '');
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrZip('');
      setAddrCountry('Denmark');
      setIsDefaultShipping((user.addresses || []).length === 0);
      setIsDefaultBilling((user.addresses || []).length === 0);
    }
    setIsEditingAddress(true);
  };

  const copyTrackingId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedTrackingId(id);
    setTimeout(() => setCopiedTrackingId(null), 2000);
  };

  const handleWhatsAppOrderInquiry = (order: Order) => {
    let msg = `Hello Arvika Concierge! 👋 I am checking on my order:\n`;
    msg += `📦 *Order Tracking ID:* ${order.orderTrackingId}\n`;
    msg += `🗓️ *Date:* ${order.date}\n`;
    msg += `🚚 *Status:* ${order.status}\n`;
    msg += `📍 *Carrier:* ${order.carrier} (${order.trackingNumber})\n`;
    msg += `Please give me a live status update!`;

    const phoneClean = SHOP_PHONE.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 animate-fade-in overflow-y-auto font-sans text-xs">
      <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-3xl max-w-4xl w-full p-6 sm:p-8 relative shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE6D8]">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#C5A059] shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#214C3A] text-[#D8C6A5] flex items-center justify-center font-serif font-bold text-2xl border-2 border-[#C5A059]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl font-bold text-[#214C3A]">{user.name}</h2>
                <span className="bg-[#214C3A] text-[#D8C6A5] text-[10px] font-montserrat font-bold uppercase px-2.5 py-0.5 rounded-full">
                  {user.role === 'admin' ? 'HQ Admin' : 'VIP European Client'}
                </span>
              </div>
              <p className="text-xs text-[#8C7A6B]">{user.email} • Member since 2026</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition-all flex items-center space-x-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            <button 
              onClick={onClose}
              className="p-2 text-[#1C1C1C]/70 hover:text-[#214C3A] rounded-full hover:bg-[#EFE6D8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-[#214C3A] text-[#D8C6A5] p-3 rounded-2xl text-xs font-montserrat font-bold shadow-lg border border-[#C5A059] flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#EFE6D8] space-x-6 text-xs font-montserrat uppercase tracking-wider font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'profile' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent hover:text-[#214C3A]'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Personal Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'addresses' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent hover:text-[#214C3A]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Address Book ({(user.addresses || []).length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('orders');
              setUserOrders(db.getOrdersByUserId(user.id, user.email));
            }}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'orders' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent hover:text-[#214C3A]'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>My Orders & Tracking ({userOrders.length})</span>
          </button>
        </div>

        {/* TAB 1: PERSONAL PROFILE & PREFERENCES */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Personal Information & Avatar */}
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-[#EFE6D8]">
                <h3 className="font-serif text-lg font-bold text-[#214C3A] flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#C5A059]" />
                  <span>Personal Details & Avatar</span>
                </h3>

                {/* Avatar Uploader */}
                <div className="flex items-center space-x-4 pt-1">
                  <img
                    src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt="Profile Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#214C3A]"
                  />
                  <div>
                    <label className="bg-[#EFE6D8] hover:bg-[#D8C6A5] text-[#214C3A] px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Profile Photo</span>
                      <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
                    </label>
                    <p className="text-[10px] text-[#8C7A6B] mt-1">PNG, JPG, or WEBP up to 5MB</p>
                  </div>
                </div>

                <div>
                  <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF8F4] p-3 rounded-xl border border-[#D8C6A5] focus:outline-none focus:ring-1 focus:ring-[#214C3A]"
                  />
                </div>

                <div>
                  <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF8F4] p-3 rounded-xl border border-[#D8C6A5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+45 20 12 34 56"
                    className="w-full bg-[#FAF8F4] p-3 rounded-xl border border-[#D8C6A5] focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column: Password & Account Preferences */}
              <div className="space-y-4">
                
                {/* Change Password Box */}
                <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-3">
                  <h3 className="font-serif text-lg font-bold text-[#214C3A] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#C5A059]" />
                    <span>Security & Password</span>
                  </h3>

                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep unchanged"
                      className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Account Preferences Box */}
                <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-3">
                  <h3 className="font-serif text-lg font-bold text-[#214C3A] flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#C5A059]" />
                    <span>Account Preferences</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                        className="rounded accent-[#214C3A]"
                      />
                      <span>Receive Email Order Receipts & Air Waybill Updates</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.whatsappAlerts}
                        onChange={(e) => setPreferences({ ...preferences, whatsappAlerts: e.target.checked })}
                        className="rounded accent-[#214C3A]"
                      />
                      <span>Receive Direct WhatsApp Dispatch Notifications</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketingOptIn}
                        onChange={(e) => setPreferences({ ...preferences, marketingOptIn: e.target.checked })}
                        className="rounded accent-[#214C3A]"
                      />
                      <span>VIP Access to Seasonal Linen Drops & Private Offers</span>
                    </label>
                  </div>
                </div>

                {/* HQ Admin Console Shortcut: Only shown if user is ALREADY an admin */}
                {user.role === 'admin' && (
                  <div className="bg-[#FAF8F4] p-4 rounded-2xl border border-[#C5A059] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-montserrat font-bold text-xs text-[#214C3A]">HQ Administrator Privilege Active</span>
                      <span className="bg-[#C5A059] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        Admin
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        window.location.hash = 'admin';
                      }}
                      className="w-full bg-[#214C3A] hover:bg-[#4A5D4E] text-[#FAF8F4] p-3 rounded-xl font-montserrat font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#D8C6A5]" />
                      <span>Open HQ Admin Control Console</span>
                    </button>
                  </div>
                )}

              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-[#214C3A] hover:bg-[#4A5D4E] text-[#FAF8F4] px-8 py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                Save All Profile Changes
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: ADDRESS BOOK */}
        {activeTab === 'addresses' && (
          <div className="space-y-6 animate-fade-in">
            
            {!isEditingAddress ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#214C3A]">Saved European & Global Destinations</h3>
                    <p className="text-xs text-[#8C7A6B]">Manage your default shipping and billing addresses for 1-click checkout.</p>
                  </div>

                  <button
                    onClick={() => startEditAddress()}
                    className="bg-[#214C3A] hover:bg-[#4A5D4E] text-[#FAF8F4] px-4 py-2.5 rounded-xl text-xs font-montserrat font-bold flex items-center space-x-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(user.addresses || []).map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-white border border-[#EFE6D8] p-5 rounded-2xl space-y-3 relative shadow-xs hover:border-[#214C3A] transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-serif font-bold text-base text-[#214C3A]">{addr.label}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            {addr.isDefaultShipping && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-montserrat font-bold px-2 py-0.5 rounded-full">
                                Default Shipping
                              </span>
                            )}
                            {addr.isDefaultBilling && (
                              <span className="bg-blue-100 text-blue-800 text-[9px] font-montserrat font-bold px-2 py-0.5 rounded-full">
                                Default Billing
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => startEditAddress(addr)}
                            className="p-1.5 text-[#8C7A6B] hover:text-[#214C3A] hover:bg-[#EFE6D8] rounded-lg"
                            title="Edit Address"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-[#8C7A6B] hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="Delete Address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-[#1C1C1C]/80 space-y-1">
                        <p className="font-bold">{addr.fullName} ({addr.phone})</p>
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                        <p className="font-semibold text-[#214C3A]">{addr.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Add / Edit Address Form */
              <form onSubmit={handleSaveAddress} className="bg-white p-6 rounded-2xl border border-[#D8C6A5] space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-[#EFE6D8] pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#214C3A]">
                    {editingAddressId ? 'Edit Address' : 'Add New Shipping / Billing Address'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="text-xs text-[#8C7A6B] hover:underline font-montserrat font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Address Label *</label>
                    <input
                      type="text"
                      required
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value)}
                      placeholder="e.g. Home, Office, Copenhagen Apartment"
                      className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5]"
                    />
                  </div>

                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={addrFullName}
                      onChange={(e) => setAddrFullName(e.target.value)}
                      className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5]"
                    />
                  </div>

                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5]"
                    />
                  </div>

                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Country *</label>
                    <select
                      value={addrCountry}
                      onChange={(e) => setAddrCountry(e.target.value)}
                      className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5]"
                    >
                      <option value="Denmark">Denmark 🇩🇰</option>
                      <option value="Sweden">Sweden 🇸🇪</option>
                      <option value="Germany">Germany 🇩🇪</option>
                      <option value="France">France 🇫🇷</option>
                      <option value="India">India 🇮🇳</option>
                      <option value="United Kingdom">United Kingdom 🇬🇧</option>
                      <option value="United States">United States 🇺🇸</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Street Address & Suite *</label>
                    <input
                      type="text"
                      required
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      placeholder="Grønnegade 14, Apt 3B"
                      className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5]"
                    />
                  </div>

                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      placeholder="Copenhagen"
                      className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5]"
                    />
                  </div>

                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">State / Province / PIN Code *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        placeholder="State"
                        className="bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5]"
                      />
                      <input
                        type="text"
                        required
                        value={addrZip}
                        onChange={(e) => setAddrZip(e.target.value)}
                        placeholder="ZIP/PIN"
                        className="bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-[#214C3A]">
                    <input
                      type="checkbox"
                      checked={isDefaultShipping}
                      onChange={(e) => setIsDefaultShipping(e.target.checked)}
                      className="rounded accent-[#214C3A]"
                    />
                    <span>Set as Default Shipping</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-[#214C3A]">
                    <input
                      type="checkbox"
                      checked={isDefaultBilling}
                      onChange={(e) => setIsDefaultBilling(e.target.checked)}
                      className="rounded accent-[#214C3A]"
                    />
                    <span>Set as Default Billing</span>
                  </label>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="px-5 py-2.5 rounded-xl border border-[#D8C6A5] text-[#214C3A] font-montserrat font-bold hover:bg-[#EFE6D8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#214C3A] hover:bg-[#4A5D4E] text-[#FAF8F4] px-6 py-2.5 rounded-xl font-montserrat font-bold uppercase shadow-md"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* TAB 3: ORDER HISTORY & REAL-TIME TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif text-lg font-bold text-[#214C3A]">Your Order History & Permanent Tracking Records</h3>
            
            {userOrders.length > 0 ? (
              <div className="space-y-4">
                {userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white border border-[#EFE6D8] p-5 rounded-2xl space-y-4 shadow-xs hover:border-[#D8C6A5] transition-all"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE6D8] pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-serif font-bold text-base text-[#214C3A]">
                            Tracking ID: <strong className="font-mono text-[#214C3A]">{ord.orderTrackingId}</strong>
                          </span>
                          <button
                            onClick={() => copyTrackingId(ord.orderTrackingId)}
                            className="text-[#8C7A6B] hover:text-[#214C3A] p-1"
                            title="Copy Tracking ID"
                          >
                            {copiedTrackingId === ord.orderTrackingId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-[#8C7A6B]">Placed on {ord.date} • Tax Invoice #{ord.invoiceNumber}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="bg-[#214C3A] text-[#D8C6A5] text-[10px] font-montserrat font-bold px-3 py-1 rounded-full uppercase">
                          {ord.status}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-montserrat font-bold px-2.5 py-1 rounded-full">
                          {ord.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Purchased Items List */}
                    <div className="divide-y divide-[#EFE6D8]">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="py-2 first:pt-0 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-12 h-14 object-cover rounded-lg border border-[#EFE6D8]"
                            />
                            <div>
                              <div className="font-serif font-bold text-[#214C3A]">{item.product.name}</div>
                              <div className="text-[10px] text-[#8C7A6B]">
                                Shade: {item.color} | Size: {item.size} | Qty: {item.quantity}
                              </div>
                            </div>
                          </div>
                          <span className="font-serif font-bold text-[#214C3A]">
                            {currency === 'INR' ? `₹${(item.product.priceINR * item.quantity).toLocaleString('en-IN')}` : `€${(item.product.priceEUR * item.quantity).toFixed(2)}`}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Summary & CTAs */}
                    <div className="pt-3 border-t border-[#EFE6D8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="font-serif font-bold text-base text-[#214C3A]">
                          Total Paid: {currency === 'INR' ? `₹${ord.totalINR.toLocaleString('en-IN')}` : `€${ord.totalEUR.toFixed(2)}`}
                        </div>
                        <p className="text-[10px] text-[#8C7A6B]">
                          Air Waybill: <strong className="font-mono">{ord.trackingNumber}</strong> ({ord.carrier})
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onViewInvoice(ord)}
                          className="bg-[#EFE6D8] hover:bg-[#D8C6A5] text-[#214C3A] px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center space-x-1"
                        >
                          <FileText className="w-4 h-4 text-[#C5A059]" />
                          <span>View Tax Invoice</span>
                        </button>

                        <button
                          onClick={() => handleWhatsAppOrderInquiry(ord)}
                          className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center space-x-1 shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4 fill-current" />
                          <span>Order Support</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-[#EFE6D8] text-center space-y-3 shadow-xs animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F4] text-[#214C3A] flex items-center justify-center mx-auto border border-[#D8C6A5]">
                  <PackageCheck className="w-6 h-6 text-[#C5A059]" />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#214C3A]">No Orders Placed Yet</h4>
                <p className="text-xs text-[#8C7A6B] max-w-sm mx-auto">
                  You haven't placed any orders yet. When you complete a purchase, your tracking ID and tax invoices will appear here in real-time.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
