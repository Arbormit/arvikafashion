import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Search, 
  CheckCircle, 
  Clock, 
  Package, 
  Truck, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  QrCode, 
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  Users,
  Tag,
  Star,
  MessageSquare,
  Edit3,
  Save
} from 'lucide-react';
import { Order, OrderStatus, Currency, PaymentStatus, User, Review, Inquiry, Coupon } from '../types';
import { db, DEFAULT_ANNOUNCEMENTS } from '../services/db';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onViewInvoice: (order: Order) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currency,
  onViewInvoice
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'orders' | 'offers' | 'users' | 'announcements' | 'reviews' | 'inquiries'>('orders');
  const [orders, setOrders] = useState<Order[]>(() => db.getAllOrders());
  const [allUsers, setAllUsers] = useState<User[]>(() => db.getAllUsers());
  const [announcementsList, setAnnouncementsList] = useState<string[]>(() => db.getAnnouncements());
  const [reviewsList, setReviewsList] = useState<Review[]>(() => db.getReviews());
  const [inquiriesList, setInquiriesList] = useState<Inquiry[]>(() => db.getInquiries());
  const [offersList, setOffersList] = useState<Coupon[]>(() => db.getOffers());
  
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [editingAnnIndex, setEditingAnnIndex] = useState<number | null>(null);
  const [editingAnnText, setEditingAnnText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [utrInputMap, setUtrInputMap] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Offer Form State
  const [newOfferCode, setNewOfferCode] = useState('');
  const [newOfferDesc, setNewOfferDesc] = useState('');
  const [newOfferPercent, setNewOfferPercent] = useState('15');
  const [newOfferBadge, setNewOfferBadge] = useState('SPECIAL PROMO');
  const [newOfferMinINR, setNewOfferMinINR] = useState('5000');
  const [newOfferMinEUR, setNewOfferMinEUR] = useState('60');

  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<Coupon | null>(null);

  React.useEffect(() => {
    const handleInquiries = () => setInquiriesList(db.getInquiries());
    const handleOffers = () => setOffersList(db.getOffers());
    window.addEventListener('arvika_inquiries_updated', handleInquiries);
    window.addEventListener('arvika_offers_updated', handleOffers);
    return () => {
      window.removeEventListener('arvika_inquiries_updated', handleInquiries);
      window.removeEventListener('arvika_offers_updated', handleOffers);
    };
  }, []);

  const confirmDeleteInquiry = () => {
    if (!inquiryToDelete) return;
    const deleted = db.deleteInquiry(inquiryToDelete.id);
    if (deleted) {
      setInquiriesList(db.getInquiries());
      showToast(`Inquiry from "${inquiryToDelete.name}" permanently deleted from Neon DB.`);
    }
    setInquiryToDelete(null);
  };

  const confirmDeleteOffer = async () => {
    if (!offerToDelete) return;
    const res = await db.deleteOffer(offerToDelete.code);
    if (res.success) {
      setOffersList(db.getOffers());
      showToast(res.message || `Offer code ${offerToDelete.code} permanently deleted from database & site!`);
    }
    setOfferToDelete(null);
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferCode.trim() || !newOfferDesc.trim()) return;

    const offerObj: Coupon = {
      code: newOfferCode.trim().toUpperCase(),
      description: newOfferDesc.trim(),
      discountPercentage: Number(newOfferPercent) || 15,
      minOrderINR: Number(newOfferMinINR) || 5000,
      minOrderEUR: Number(newOfferMinEUR) || 60,
      expiresAt: '2026-12-31',
      badge: newOfferBadge.trim().toUpperCase() || 'PROMO OFFER'
    };

    const res = await db.addOffer(offerObj);
    if (res.success) {
      setOffersList(db.getOffers());
      showToast(`Promo code ${offerObj.code} successfully created & published!`);
      setNewOfferCode('');
      setNewOfferDesc('');
    }
  };

  const refreshOrders = () => {
    setOrders(db.getAllOrders());
    setAllUsers(db.getAllUsers());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    const deleted = db.deleteUser(userToDelete.id);
    if (deleted) {
      refreshOrders();
      showToast(`Account for ${userToDelete.name} (${userToDelete.email}) permanently deleted from Neon DB.`);
    }
    setUserToDelete(null);
  };

  const confirmDeleteReview = () => {
    if (!reviewToDelete) return;
    const deleted = db.deleteReview(reviewToDelete.id);
    if (deleted) {
      setReviewsList(db.getReviews());
      showToast(`Review "${reviewToDelete.title}" permanently deleted from Neon DB.`);
    }
    setReviewToDelete(null);
  };

  const confirmDeleteOrder = () => {
    if (!orderToDelete) return;
    const deleted = db.deleteOrder(orderToDelete.orderTrackingId);
    if (deleted) {
      refreshOrders();
      showToast(`Order #${orderToDelete.orderTrackingId} has been permanently deleted.`);
    }
    setOrderToDelete(null);
  };

  // Metrics
  const totalRevenueINR = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAYMENT_VERIFIED' ? o.totalINR : 0), 0);
  const totalRevenueEUR = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAYMENT_VERIFIED' ? o.totalEUR : 0), 0);
  const pendingUPIVerifications = orders.filter((o) => o.paymentStatus === 'PENDING_VERIFICATION').length;
  const processingCount = orders.filter((o) => o.status === 'Processing' || o.status === 'Payment Verified').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped' || o.status === 'Delivered').length;

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q ||
      order.orderTrackingId.toLowerCase().includes(q) ||
      order.invoiceNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q) ||
      (order.paymentDetails.utrNumber && order.paymentDetails.utrNumber.includes(q));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter || order.paymentStatus === statusFilter;

    return matchesQuery && matchesStatus;
  });

  // Verify UPI Payment Handler
  const handleVerifyUPI = (orderTrackingId: string) => {
    const customUtr = utrInputMap[orderTrackingId];
    const updated = db.verifyPayment(orderTrackingId, customUtr, 'admin@arvikafashion.com');
    if (updated) {
      refreshOrders();
      showToast(`Payment for Order #${updated.orderTrackingId} verified successfully!`);
    }
  };

  // Update Status Handler
  const handleStatusChange = (orderTrackingId: string, newStatus: OrderStatus) => {
    const updated = db.updateOrderStatus(orderTrackingId, newStatus, `Status changed by Admin to ${newStatus}`);
    if (updated) {
      refreshOrders();
      showToast(`Order #${updated.orderTrackingId} updated to ${newStatus}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F4] w-screen h-screen overflow-y-auto font-sans text-xs animate-fade-in flex flex-col">
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-1 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE6D8]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-[#214C3A] text-[#D8C6A5] flex items-center justify-center font-serif font-bold text-xl border-2 border-[#C5A059] shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl font-bold text-[#214C3A]">Arvika Atelier Admin Console</h2>
                <span className="bg-[#C5A059] text-white text-[10px] font-montserrat uppercase font-bold px-2 py-0.5 rounded-full">
                  HQ Admin Access
                </span>
              </div>
              <p className="text-xs text-[#8C7A6B]">Manage UPI Payment Verification, Order Fulfillment, & Export Freight</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={refreshOrders}
              className="p-2 text-[#214C3A] hover:bg-[#EFE6D8] rounded-xl transition-colors flex items-center gap-1 font-montserrat font-bold text-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
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
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Admin Navigation Sub-Bar */}
        <div className="flex border-b border-[#EFE6D8] space-x-6 text-xs font-montserrat uppercase tracking-wider font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 shrink-0 ${
              activeTab === 'orders' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent hover:text-[#214C3A]'
            }`}
          >
            <Package className="w-4 h-4 text-[#C5A059]" />
            <span>Orders & Dispatch ({orders.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('offers');
              setOffersList(db.getOffers());
            }}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 shrink-0 ${
              activeTab === 'offers' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent hover:text-[#214C3A]'
            }`}
          >
            <Tag className="w-4 h-4 text-[#C5A059]" />
            <span>Offers & Coupons ({offersList.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('users');
              setAllUsers(db.getAllUsers());
            }}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'users' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent hover:text-[#214C3A]'
            }`}
          >
            <Users className="w-4 h-4 text-[#C5A059]" />
            <span>User Role Privilege Control ({allUsers.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('announcements');
              setAnnouncementsList(db.getAnnouncements());
            }}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'announcements' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent hover:text-[#214C3A]'
            }`}
          >
            <Tag className="w-4 h-4 text-[#C5A059]" />
            <span>Live Announcement Manager ({announcementsList.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('reviews');
              setReviewsList(db.getReviews());
            }}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'reviews' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent hover:text-[#214C3A]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#C5A059]" />
            <span>Reviews Moderation ({reviewsList.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('inquiries');
              setInquiriesList(db.getInquiries());
            }}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'inquiries' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent hover:text-[#214C3A]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#C5A059]" />
            <span>Customer Inquiries ({inquiriesList.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDERS & DISPATCH LEDGER */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#EFE6D8] shadow-xs space-y-1">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#8C7A6B] font-bold">Total Store Revenue</span>
                <div className="font-serif font-bold text-xl text-[#214C3A]">
                  {currency === 'INR' ? `₹${totalRevenueINR.toLocaleString('en-IN')}` : `€${totalRevenueEUR.toFixed(2)}`}
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">Verified Bank Transactions</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#EFE6D8] shadow-xs space-y-1">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#8C7A6B] font-bold">Pending UPI Verifications</span>
                <div className="font-serif font-bold text-xl text-amber-700">{pendingUPIVerifications}</div>
                <span className="text-[10px] text-amber-800 font-semibold">Requires UTR Ledger Match</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#EFE6D8] shadow-xs space-y-1">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#8C7A6B] font-bold">Atelier Processing</span>
                <div className="font-serif font-bold text-xl text-[#214C3A]">{processingCount}</div>
                <span className="text-[10px] text-[#8C7A6B]">Inspection & Packaging</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#EFE6D8] shadow-xs space-y-1">
                <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#8C7A6B] font-bold">Shipped & Delivered</span>
                <div className="font-serif font-bold text-xl text-emerald-800">{shippedCount}</div>
                <span className="text-[10px] text-emerald-700">DHL Express / BlueDart</span>
              </div>
            </div>

            {/* Search & Filter Control Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#EFE6D8]">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Tracking ID, UTR, Name, Email..."
                  className="w-full bg-[#FAF8F4] pl-9 pr-3 py-2.5 rounded-xl border border-[#D8C6A5] text-xs focus:outline-none focus:ring-1 focus:ring-[#214C3A]"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-[#8C7A6B]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5] text-xs focus:outline-none font-montserrat font-bold text-[#214C3A]"
                >
                  <option value="ALL">All Order Statuses</option>
                  <option value="PENDING_VERIFICATION">Pending UPI Verification</option>
                  <option value="PAYMENT_VERIFIED">Payment Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            {/* Order Table */}
            <div className="bg-white border border-[#EFE6D8] rounded-2xl overflow-hidden shadow-xs">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3 bg-white">
                  <div className="w-12 h-12 rounded-full bg-[#FAF8F4] text-[#214C3A] flex items-center justify-center mx-auto border border-[#D8C6A5]">
                    <Package className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#214C3A]">No Orders Found</h3>
                  <p className="text-xs text-[#8C7A6B] max-w-sm mx-auto">
                    There are currently no orders placed or matching your filter criteria. New customer orders will appear here automatically in real-time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#214C3A] text-[#FAF8F4] font-montserrat text-[10px] uppercase tracking-wider">
                        <th className="p-3">Order Tracking ID</th>
                        <th className="p-3">Customer Info</th>
                        <th className="p-3">Payment Method / UTR</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Payment Status</th>
                        <th className="p-3">Order Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE6D8] font-sans">
                      {filteredOrders.map((ord) => {
                        const isPendingUPI = ord.paymentStatus === 'PENDING_VERIFICATION';
                        return (
                          <tr key={ord.id} className="hover:bg-[#FAF8F4] transition-colors">
                            {/* Tracking ID */}
                            <td className="p-3 font-mono font-bold text-[#214C3A]">
                              <div>{ord.orderTrackingId}</div>
                              <div className="text-[10px] text-[#8C7A6B] font-sans">{ord.date}</div>
                            </td>

                            {/* Customer Info */}
                            <td className="p-3">
                              <div className="font-serif font-bold text-[#214C3A]">{ord.customerName}</div>
                              <div className="text-[10px] text-[#8C7A6B]">{ord.customerEmail}</div>
                              <div className="text-[10px] text-[#8C7A6B]">{ord.customerPhone}</div>
                            </td>

                            {/* Payment Method / UTR */}
                            <td className="p-3">
                              <span className="font-montserrat font-bold text-[10px] bg-[#EFE6D8] px-2 py-0.5 rounded-full text-[#214C3A]">
                                {ord.paymentDetails.method}
                              </span>
                              {ord.paymentDetails.utrNumber ? (
                                <div className="text-[10px] font-mono text-emerald-800 mt-1 font-semibold">
                                  UTR: {ord.paymentDetails.utrNumber}
                                </div>
                              ) : isPendingUPI ? (
                                <div className="mt-1 space-y-1">
                                  <input
                                    type="text"
                                    placeholder="Enter UTR to verify"
                                    value={utrInputMap[ord.orderTrackingId] || ''}
                                    onChange={(e) => setUtrInputMap({ ...utrInputMap, [ord.orderTrackingId]: e.target.value })}
                                    className="bg-white border border-[#D8C6A5] p-1 rounded font-mono text-[10px] w-32"
                                  />
                                </div>
                              ) : null}
                            </td>

                            {/* Amount */}
                            <td className="p-3 font-serif font-bold text-sm text-[#214C3A]">
                              {currency === 'INR' ? `₹${ord.totalINR.toLocaleString('en-IN')}` : `€${ord.totalEUR.toFixed(2)}`}
                            </td>

                            {/* Payment Status */}
                            <td className="p-3">
                              {ord.paymentStatus === 'PAYMENT_VERIFIED' ? (
                                <span className="bg-emerald-100 text-emerald-800 font-montserrat font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleVerifyUPI(ord.orderTrackingId)}
                                  className="bg-amber-500 hover:bg-amber-600 text-white font-montserrat font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs transition-all flex items-center gap-1"
                                >
                                  <QrCode className="w-3 h-3" />
                                  <span>Verify Payment</span>
                                </button>
                              )}
                            </td>

                            {/* Order Status Select */}
                            <td className="p-3">
                              <select
                                value={ord.status}
                                onChange={(e) => handleStatusChange(ord.orderTrackingId, e.target.value as OrderStatus)}
                                className="bg-[#FAF8F4] border border-[#D8C6A5] p-1.5 rounded-lg text-[11px] font-montserrat font-bold text-[#214C3A] focus:outline-none"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Payment Verified">Payment Verified</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => onViewInvoice(ord)}
                                className="bg-[#EFE6D8] hover:bg-[#D8C6A5] text-[#214C3A] p-2 rounded-xl text-[10px] font-montserrat font-bold inline-flex items-center"
                                title="View Tax Invoice"
                              >
                                <FileText className="w-4 h-4 text-[#C5A059]" />
                              </button>
                              {/* Admin-Only Order Deletion Button */}
                              <button
                                onClick={() => setOrderToDelete(ord)}
                                className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-xl text-[10px] font-montserrat font-bold border border-red-200 transition-colors inline-flex items-center"
                                title="Delete Order (Admin Privilege Only)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: OFFERS & COUPONS MANAGEMENT */}
        {activeTab === 'offers' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Create Offer Form */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE6D8] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EFE6D8] pb-3">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-[#214C3A] flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#C5A059]" />
                    <span>Offers & Promo Coupon Control Panel</span>
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Create promo codes or permanently delete offers. Deleted offers are immediately purged from Neon DB and checkout validation.
                  </p>
                </div>
                <span className="bg-[#214C3A] text-[#FAF8F4] text-[10px] font-montserrat font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {offersList.length} Active Offers
                </span>
              </div>

              {/* Create New Promo Code Form */}
              <form onSubmit={handleCreateOffer} className="space-y-4 pt-2">
                <h4 className="font-serif font-bold text-sm text-[#214C3A]">Create New Promotional Offer</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-montserrat font-bold uppercase text-[#8C7A6B] mb-1">Coupon Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SUMMER2026"
                      value={newOfferCode}
                      onChange={(e) => setNewOfferCode(e.target.value.toUpperCase())}
                      className="w-full bg-[#FAF8F4] border border-[#D8C6A5] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#214C3A] uppercase focus:outline-none focus:ring-2 focus:ring-[#214C3A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-montserrat font-bold uppercase text-[#8C7A6B] mb-1">Badge Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. LIMITED EDITION"
                      value={newOfferBadge}
                      onChange={(e) => setNewOfferBadge(e.target.value)}
                      className="w-full bg-[#FAF8F4] border border-[#D8C6A5] rounded-xl px-3 py-2 text-xs font-sans text-[#214C3A] focus:outline-none focus:ring-2 focus:ring-[#214C3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-montserrat font-bold uppercase text-[#8C7A6B] mb-1">Discount (% Off)</label>
                    <input
                      type="number"
                      placeholder="15"
                      value={newOfferPercent}
                      onChange={(e) => setNewOfferPercent(e.target.value)}
                      className="w-full bg-[#FAF8F4] border border-[#D8C6A5] rounded-xl px-3 py-2 text-xs font-sans text-[#214C3A] focus:outline-none focus:ring-2 focus:ring-[#214C3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-montserrat font-bold uppercase text-[#8C7A6B] mb-1">Min Spend (INR / EUR)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="₹5000"
                        value={newOfferMinINR}
                        onChange={(e) => setNewOfferMinINR(e.target.value)}
                        className="w-1/2 bg-[#FAF8F4] border border-[#D8C6A5] rounded-xl px-2 py-2 text-xs font-sans text-[#214C3A]"
                      />
                      <input
                        type="number"
                        placeholder="€60"
                        value={newOfferMinEUR}
                        onChange={(e) => setNewOfferMinEUR(e.target.value)}
                        className="w-1/2 bg-[#FAF8F4] border border-[#D8C6A5] rounded-xl px-2 py-2 text-xs font-sans text-[#214C3A]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-montserrat font-bold uppercase text-[#8C7A6B] mb-1">Description / Terms</label>
                  <input
                    type="text"
                    placeholder="e.g. 20% OFF on all Scandinavian linen dresses over ₹6,000 / €75"
                    value={newOfferDesc}
                    onChange={(e) => setNewOfferDesc(e.target.value)}
                    className="w-full bg-[#FAF8F4] border border-[#D8C6A5] rounded-xl px-3 py-2 text-xs font-sans text-[#214C3A] focus:outline-none focus:ring-2 focus:ring-[#214C3A]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#214C3A] hover:bg-[#2D5A46] text-[#FAF8F4] px-6 py-2.5 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                >
                  Publish Promo Offer Code
                </button>
              </form>
            </div>

            {/* Active Offers Grid with Delete Button */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base text-[#214C3A]">Active Database Offers ({offersList.length})</h4>
              {offersList.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#D8C6A5] p-8 space-y-2">
                  <Tag className="w-10 h-10 text-[#C5A059] mx-auto opacity-50" />
                  <p className="font-serif font-bold text-[#214C3A]">No Active Offers in Database</p>
                  <p className="text-xs text-[#8C7A6B]">Use the form above to add a new coupon code.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offersList.map((offer) => (
                    <div
                      key={offer.code}
                      className="bg-white border border-[#EFE6D8] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 relative"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="bg-[#214C3A] text-[#FAF8F4] text-[9px] font-montserrat font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {offer.badge}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#C5A059] bg-[#FAF8F4] px-2.5 py-0.5 rounded-md border border-[#EFE6D8]">
                            {offer.code}
                          </span>
                        </div>
                        <p className="text-xs font-[#214C3A] leading-relaxed pt-1">
                          {offer.description}
                        </p>
                        <div className="text-[11px] text-[#8C7A6B] font-montserrat flex items-center justify-between border-t border-[#EFE6D8] pt-2">
                          <span>Min Spend: ₹{offer.minOrderINR.toLocaleString('en-IN')} / €{offer.minOrderEUR}</span>
                          <span className="font-bold text-[#214C3A]">{offer.discountPercentage ? `${offer.discountPercentage}% OFF` : `Flat Discount`}</span>
                        </div>
                      </div>

                      {/* Permanent Delete Button */}
                      <button
                        type="button"
                        onClick={() => setOfferToDelete(offer)}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-2 rounded-xl text-xs font-montserrat font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Offer Permanently</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USER ROLE PRIVILEGE MANAGEMENT (ADMIN ONLY) */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#214C3A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
                <span>User Role & Privilege Management Console</span>
              </h3>
              <p className="text-xs text-[#8C7A6B]">
                As a Store Administrator, you can view registered customer accounts and manage role privileges. Customers NEVER gain admin access automatically.
              </p>
            </div>

            <div className="bg-white border border-[#EFE6D8] rounded-2xl overflow-hidden shadow-xs">
              {allUsers.length === 0 ? (
                <div className="text-center py-16 bg-[#FAF8F4] border border-dashed border-[#D8C6A5] rounded-3xl space-y-3 my-4">
                  <Users className="w-12 h-12 text-[#D8C6A5] mx-auto" />
                  <h4 className="font-serif text-xl font-bold text-[#214C3A]">No Registered Accounts in Database Yet</h4>
                  <p className="text-xs text-[#8C7A6B] font-sans max-w-md mx-auto leading-relaxed">
                    All newly registered clients and store accounts will automatically reflect here in real-time. Admins can manage account roles & privileges securely.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#214C3A] text-[#FAF8F4] font-montserrat uppercase text-[10px] tracking-wider">
                        <th className="p-3">User ID</th>
                        <th className="p-3">Client Name & Contact</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Active DB Role</th>
                        <th className="p-3 text-right">Assign Role Privilege</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE6D8] font-sans">
                      {allUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-[#FAF8F4] transition-colors">
                          <td className="p-3 font-mono text-[#214C3A] text-[11px] font-bold">{u.id}</td>
                          <td className="p-3">
                            <div className="font-serif font-bold text-[#214C3A]">{u.name}</div>
                            <div className="text-[10px] text-[#8C7A6B]">{u.phone || 'No phone recorded'}</div>
                          </td>
                          <td className="p-3 text-[#214C3A] font-mono text-[11px]">{u.email}</td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-montserrat font-bold uppercase shadow-xs inline-flex items-center gap-1 ${
                              u.role === 'admin'
                                ? 'bg-[#C5A059] text-white'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {u.role === 'admin' ? 'HQ Admin' : 'Customer'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => {
                                const updated = db.updateUserRole(u.id, 'customer');
                                refreshOrders();
                                showToast(`Role updated: ${u.name} is now a Customer.`);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold transition-all ${
                                u.role === 'customer'
                                  ? 'bg-[#214C3A] text-[#FAF8F4] shadow-xs'
                                  : 'bg-white text-[#214C3A] border border-[#D8C6A5] hover:bg-[#EFE6D8]'
                              }`}
                            >
                              Set Customer
                            </button>
                            <button
                              onClick={() => {
                                const updated = db.updateUserRole(u.id, 'admin');
                                refreshOrders();
                                showToast(`Role updated: ${u.name} is now an Admin!`);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold transition-all ${
                                u.role === 'admin'
                                  ? 'bg-[#C5A059] text-white shadow-xs'
                                  : 'bg-white text-[#214C3A] border border-[#D8C6A5] hover:bg-[#EFE6D8]'
                              }`}
                            >
                              Set Admin
                            </button>
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-xl text-xs font-montserrat font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="Delete User Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LIVE ANNOUNCEMENT MANAGER */}
        {activeTab === 'announcements' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#EFE6D8]/50 p-4 rounded-2xl border border-[#D8C6A5] text-xs text-[#214C3A]">
              <h4 className="font-serif font-bold text-base text-[#214C3A] mb-1">
                Live Store Announcement Bar Manager (Admin Exclusive)
              </h4>
              <p className="text-[11px] text-[#8C7A6B] leading-relaxed">
                Publish real-time announcements directly to the header announcement bar. All changes broadcast seamlessly across desktop & mobile marquee loops instantly without page reload.
              </p>
            </div>

            {/* Add New Announcement Form */}
            <div className="bg-white border border-[#EFE6D8] p-4 sm:p-5 rounded-2xl space-y-3 shadow-xs">
              <label className="block text-xs font-montserrat font-bold text-[#214C3A] uppercase tracking-wider">
                Publish New Realtime Announcement Text
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAnnouncementText}
                  onChange={(e) => setNewAnnouncementText(e.target.value)}
                  placeholder="e.g. Special Offer: 20% OFF Luxury Organic Linen Sets! Use code LUXURY20"
                  className="flex-1 bg-[#FAF8F4] p-3 rounded-xl border border-[#D8C6A5] text-xs focus:outline-none focus:ring-1 focus:ring-[#214C3A]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newAnnouncementText.trim()) return;
                    const updated = [...announcementsList, newAnnouncementText.trim()];
                    const success = db.updateAnnouncements(updated);
                    if (success) {
                      setAnnouncementsList(db.getAnnouncements());
                      setNewAnnouncementText('');
                      showToast('Live announcement published across the website! 🚀');
                    }
                  }}
                  className="bg-[#214C3A] hover:bg-[#1A3D2F] text-[#FAF8F4] px-5 py-3 rounded-xl font-montserrat text-xs font-bold transition-all shadow-md shrink-0 flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Publish Realtime</span>
                </button>
              </div>
            </div>

            {/* Current Announcements List */}
            <div className="bg-white border border-[#EFE6D8] rounded-2xl overflow-hidden shadow-xs p-4 sm:p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#EFE6D8]">
                <span className="font-serif font-bold text-sm text-[#214C3A]">
                  Active Live Announcements ({announcementsList.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const success = db.updateAnnouncements(DEFAULT_ANNOUNCEMENTS);
                    if (success) {
                      setAnnouncementsList(db.getAnnouncements());
                      showToast('Announcements reset to default highlights.');
                    }
                  }}
                  className="text-[11px] font-montserrat font-semibold text-[#8C7A6B] hover:text-[#214C3A] underline cursor-pointer"
                >
                  Reset to Defaults
                </button>
              </div>

              <div className="space-y-2">
                {announcementsList.map((ann, idx) => {
                  const isEditing = editingAnnIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-[#FAF8F4] p-3 rounded-xl border border-[#EFE6D8] text-xs text-[#214C3A]"
                    >
                      <div className="flex items-center space-x-3 font-medium min-w-0 flex-1 pr-2">
                        <span className="w-6 h-6 rounded-full bg-[#EFE6D8] text-[#214C3A] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>

                        {isEditing ? (
                          <input
                            type="text"
                            value={editingAnnText}
                            onChange={(e) => setEditingAnnText(e.target.value)}
                            className="flex-1 bg-white border border-[#214C3A] rounded-lg px-2.5 py-1 text-xs text-[#214C3A] focus:outline-none"
                          />
                        ) : (
                          <span className="truncate">{ann}</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (!editingAnnText.trim()) return;
                                const updated = [...announcementsList];
                                updated[idx] = editingAnnText.trim();
                                const success = db.updateAnnouncements(updated);
                                if (success) {
                                  setAnnouncementsList(db.getAnnouncements());
                                  setEditingAnnIndex(null);
                                  showToast('Announcement updated live across site! ⚡');
                                }
                              }}
                              className="p-1.5 bg-[#214C3A] text-white rounded-lg hover:bg-[#1A3D2F] transition-colors cursor-pointer"
                              title="Save Changes"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAnnIndex(null)}
                              className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer text-[10px] font-bold px-2"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAnnIndex(idx);
                                setEditingAnnText(ann);
                              }}
                              className="p-1.5 text-[#214C3A] hover:bg-[#EFE6D8] rounded-lg transition-colors cursor-pointer"
                              title="Edit Announcement Text"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = announcementsList.filter((_, i) => i !== idx);
                                const success = db.updateAnnouncements(updated);
                                if (success) {
                                  setAnnouncementsList(db.getAnnouncements());
                                  showToast('Announcement item permanently deleted.');
                                }
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                              title="Delete Announcement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fade-in font-sans">
            <div className="bg-white p-6 rounded-2xl border border-[#EFE6D8] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE6D8] pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#214C3A]">
                    Client Reviews Moderation & Management
                  </h3>
                  <p className="text-xs text-[#8C7A6B] mt-0.5">
                    View, moderate, and delete client feedback saved in your Neon PostgreSQL database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewsList(db.getReviews())}
                  className="bg-[#FAF8F4] border border-[#D8C6A5] text-[#214C3A] hover:bg-[#EFE6D8] px-4 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh List
                </button>
              </div>

              {reviewsList.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#8C7A6B] bg-[#FAF8F4] rounded-2xl border border-dashed border-[#D8C6A5]">
                  No published client reviews found in database.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="bg-[#FAF8F4] border border-[#EFE6D8] p-4 rounded-2xl space-y-3 relative shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-serif font-bold text-sm text-[#214C3A]">{rev.userName}</div>
                          <div className="text-[11px] text-[#8C7A6B]">{rev.country} • {rev.date}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReviewToDelete(rev)}
                          className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-xl text-xs font-montserrat font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                          title="Delete Review Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>

                      <div className="flex items-center space-x-1 text-[#C5A059]">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059]" />
                        ))}
                      </div>

                      <div className="font-serif font-bold text-xs text-[#214C3A]">"{rev.title}"</div>
                      <p className="text-xs text-[#1C1C1C]/80 font-sans leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOMER INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#EFE6D8]/50 p-4 rounded-2xl border border-[#D8C6A5] text-xs text-[#214C3A] flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-base text-[#214C3A] mb-1">
                  Customer Contact & Wholesale Inquiries (Neon DB Live)
                </h4>
                <p className="text-[11px] text-[#8C7A6B] leading-relaxed">
                  Real-time customer messages submitted through the Contact Us form, stored 100% directly in your Neon PostgreSQL database.
                </p>
              </div>
              <button
                onClick={() => {
                  db.syncInquiriesFromNeonServer();
                  setInquiriesList(db.getInquiries());
                  showToast('Refreshed customer inquiries from Neon DB!');
                }}
                className="bg-white border border-[#D8C6A5] hover:bg-[#EFE6D8] text-[#214C3A] px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Data</span>
              </button>
            </div>

            {inquiriesList.length === 0 ? (
              <div className="bg-white border border-[#EFE6D8] p-12 rounded-3xl text-center space-y-3">
                <FileText className="w-12 h-12 text-[#C5A059] mx-auto opacity-50" />
                <h4 className="font-serif font-bold text-lg text-[#214C3A]">No Customer Inquiries Yet</h4>
                <p className="text-xs text-[#8C7A6B]">
                  When customers submit inquiries on your website, they will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {inquiriesList.map((inq) => (
                  <div key={inq.id} className="bg-white border border-[#EFE6D8] p-5 rounded-2xl space-y-3 shadow-xs hover:border-[#D8C6A5] transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE6D8] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-lg text-[#214C3A]">{inq.name}</h4>
                          <span className={`text-[10px] font-montserrat font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            inq.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inq.status === 'Replied'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inq.status || 'New'}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-[#8C7A6B] mt-0.5">
                          {inq.email} {inq.phone ? `• ${inq.phone}` : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={inq.status || 'New'}
                          onChange={(e) => {
                            const newStatus = e.target.value as 'New' | 'Replied' | 'Resolved';
                            db.updateInquiryStatus(inq.id, newStatus);
                            setInquiriesList(db.getInquiries());
                            showToast(`Inquiry status updated to ${newStatus}`);
                          }}
                          className="bg-[#FAF8F4] border border-[#D8C6A5] p-1.5 rounded-xl text-xs font-sans text-[#214C3A]"
                        >
                          <option value="New">Mark New</option>
                          <option value="Replied">Mark Replied</option>
                          <option value="Resolved">Mark Resolved</option>
                        </select>

                        <button
                          onClick={() => setInquiryToDelete(inq)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 p-2 rounded-xl text-xs font-montserrat font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-montserrat font-bold text-[#C5A059] uppercase tracking-wider block">
                        Subject: {inq.subject}
                      </span>
                      <p className="text-xs text-[#1C1C1C]/90 font-sans leading-relaxed bg-[#FAF8F4] p-3 rounded-xl border border-[#EFE6D8]">
                        "{inq.message}"
                      </p>
                    </div>

                    <div className="text-[10px] text-[#8C7A6B] font-mono text-right">
                      Received: {new Date(inq.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STUNNING DELETE CONFIRMATION POPUP MODAL */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-sans">
            <div className="bg-[#FAF8F4] border-2 border-red-200 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5">
              
              {/* Header Icon */}
              <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-red-300 text-red-700 flex items-center justify-center mx-auto shadow-md">
                <Trash2 className="w-7 h-7" />
              </div>

              <div className="text-center space-y-2">
                <span className="bg-red-100 text-red-800 text-[10px] font-montserrat font-bold uppercase px-3 py-0.5 rounded-full">
                  Admin Action Required
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#214C3A]">
                  Delete Order Record?
                </h3>
                <p className="text-xs text-[#8C7A6B] leading-relaxed">
                  Are you sure you want to permanently delete order record <strong className="font-mono text-[#214C3A] font-bold">#{orderToDelete.orderTrackingId}</strong> for customer <strong className="text-[#214C3A]">{orderToDelete.customerName}</strong>?
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-[11px] text-red-800 space-y-1">
                <div className="font-montserrat font-bold flex items-center gap-1.5 text-red-900">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Irreversible Admin Action</span>
                </div>
                <p className="text-[10px] text-red-700 leading-normal">
                  This order, invoice #{orderToDelete.invoiceNumber}, and shipment history log will be permanently purged from the database.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="w-full bg-white hover:bg-[#EFE6D8] border border-[#D8C6A5] text-[#214C3A] py-3 rounded-2xl text-xs font-montserrat font-bold transition-all shadow-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteOrder}
                  className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-2xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Record</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* DEDICATED DELETE REVIEW CONFIRMATION POPUP MODAL */}
        {reviewToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-sans">
            <div className="bg-[#FAF8F4] border-2 border-red-200 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5">
              
              <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-red-300 text-red-700 flex items-center justify-center mx-auto shadow-md">
                <Trash2 className="w-7 h-7" />
              </div>

              <div className="text-center space-y-2">
                <span className="bg-red-100 text-red-800 text-[10px] font-montserrat font-bold uppercase px-3 py-0.5 rounded-full">
                  Admin Action Required
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#214C3A]">
                  Delete Review Record?
                </h3>
                <p className="text-xs text-[#8C7A6B] leading-relaxed">
                  Are you sure you want to permanently delete the review <strong className="font-serif text-[#214C3A] font-bold">"{reviewToDelete.title}"</strong> submitted by <strong className="text-[#214C3A]">{reviewToDelete.userName}</strong>?
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-[11px] text-red-800 space-y-1">
                <div className="font-montserrat font-bold flex items-center gap-1.5 text-red-900">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Irreversible Database Action</span>
                </div>
                <p className="text-[10px] text-red-700 leading-normal">
                  This review will be permanently purged from your Neon PostgreSQL database and store metrics.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewToDelete(null)}
                  className="w-full bg-white hover:bg-[#EFE6D8] border border-[#D8C6A5] text-[#214C3A] py-3 rounded-2xl text-xs font-montserrat font-bold transition-all shadow-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteReview}
                  className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-2xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Review</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* DEDICATED DELETE INQUIRY CONFIRMATION POPUP MODAL */}
        {inquiryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-sans">
            <div className="bg-[#FAF8F4] border-2 border-red-200 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5">
              
              <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-red-300 text-red-700 flex items-center justify-center mx-auto shadow-md">
                <Trash2 className="w-7 h-7" />
              </div>

              <div className="text-center space-y-2">
                <span className="bg-red-100 text-red-800 text-[10px] font-montserrat font-bold uppercase px-3 py-0.5 rounded-full">
                  Admin Action Required
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#214C3A]">
                  Delete Customer Inquiry?
                </h3>
                <p className="text-xs text-[#8C7A6B] leading-relaxed">
                  Are you sure you want to permanently delete the inquiry from <strong className="text-[#214C3A] font-bold">{inquiryToDelete.name}</strong> (<span className="font-mono text-[#214C3A]">{inquiryToDelete.email}</span>)?
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-[11px] text-red-800 space-y-1">
                <div className="font-montserrat font-bold flex items-center gap-1.5 text-red-900">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Irreversible Database Action</span>
                </div>
                <p className="text-[10px] text-red-700 leading-normal">
                  This message and inquiry log will be permanently purged from your Neon PostgreSQL database.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInquiryToDelete(null)}
                  className="w-full bg-white hover:bg-[#EFE6D8] border border-[#D8C6A5] text-[#214C3A] py-3 rounded-2xl text-xs font-montserrat font-bold transition-all shadow-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteInquiry}
                  className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-2xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Inquiry</span>
                </button>
              </div>

            </div>
          </div>
        )}
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-sans">
            <div className="bg-[#FAF8F4] border-2 border-red-200 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5">
              
              <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-red-300 text-red-700 flex items-center justify-center mx-auto shadow-md">
                <Trash2 className="w-7 h-7" />
              </div>

              <div className="text-center space-y-2">
                <span className="bg-red-100 text-red-800 text-[10px] font-montserrat font-bold uppercase px-3 py-0.5 rounded-full">
                  Admin Action Required
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#214C3A]">
                  Delete User Account?
                </h3>
                <p className="text-xs text-[#8C7A6B] leading-relaxed">
                  Are you sure you want to permanently delete the user account for <strong className="text-[#214C3A] font-bold">{userToDelete.name}</strong> (<span className="font-mono text-[#214C3A]">{userToDelete.email}</span>)?
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-[11px] text-red-800 space-y-1">
                <div className="font-montserrat font-bold flex items-center gap-1.5 text-red-900">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Irreversible Account Purge</span>
                </div>
                <p className="text-[10px] text-red-700 leading-normal">
                  This user profile, active JWT tokens, and stored credentials will be permanently purged from your Neon PostgreSQL database.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="w-full bg-white hover:bg-[#EFE6D8] border border-[#D8C6A5] text-[#214C3A] py-3 rounded-2xl text-xs font-montserrat font-bold transition-all shadow-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteUser}
                  className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-2xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              </div>

            </div>
          </div>
        )}
        {offerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-sans">
            <div className="bg-[#FAF8F4] border-2 border-red-200 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5">
              
              <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-red-300 text-red-700 flex items-center justify-center mx-auto shadow-md">
                <Trash2 className="w-7 h-7" />
              </div>

              <div className="text-center space-y-2">
                <span className="bg-red-100 text-red-800 text-[10px] font-montserrat font-bold uppercase px-3 py-0.5 rounded-full">
                  Permanent Database Purge
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#214C3A]">
                  Delete Offer Permanently?
                </h3>
                <p className="text-xs text-[#8C7A6B] leading-relaxed">
                  Are you sure you want to permanently delete promo offer code <strong className="text-[#214C3A] font-bold font-mono">{offerToDelete.code}</strong>?
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-[11px] text-red-800 space-y-1">
                <div className="font-montserrat font-bold flex items-center gap-1.5 text-red-900">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Irreversible Website & Database Purge</span>
                </div>
                <p className="text-[10px] text-red-700 leading-normal">
                  This offer code will be permanently deleted from Neon DB, the public Offers page, and checkout validation across the entire website.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOfferToDelete(null)}
                  className="w-full bg-white hover:bg-[#EFE6D8] border border-[#D8C6A5] text-[#214C3A] py-3 rounded-2xl text-xs font-montserrat font-bold transition-all shadow-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteOffer}
                  className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-2xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Offer</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
