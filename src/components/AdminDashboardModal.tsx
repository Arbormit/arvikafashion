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
  Eye
} from 'lucide-react';
import { Order, OrderStatus, Currency, PaymentStatus } from '../types';
import { db } from '../services/db';

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

  const [orders, setOrders] = useState<Order[]>(() => db.getAllOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [utrInputMap, setUtrInputMap] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshOrders = () => {
    setOrders(db.getAllOrders());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fade-in overflow-y-auto font-sans text-xs">
      <div className="bg-[#FAF8F4] border border-[#D8C6A5] rounded-3xl max-w-6xl w-full p-6 sm:p-8 relative shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
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
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => onViewInvoice(ord)}
                          className="bg-[#EFE6D8] hover:bg-[#D8C6A5] text-[#214C3A] p-2 rounded-xl text-[10px] font-montserrat font-bold"
                          title="View Tax Invoice"
                        >
                          <FileText className="w-4 h-4 text-[#C5A059]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
