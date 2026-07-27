import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck, FileText, Globe } from 'lucide-react';
import { Order, Currency } from '../types';
import { SHOP_NAME, SHOP_UPI_ID, SHOP_EMAIL, SHOP_PHONE } from '../services/db';

interface TaxInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
  currency
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isINR = currency === 'INR';
  const totalAmount = isINR ? order.totalINR : order.totalEUR;
  const symbol = isINR ? '₹' : '€';

  // Tax breakdown (12% GST on luxury textiles)
  const gstRate = 0.12;
  const taxableValue = isINR ? order.subtotalINR / 1.12 : order.subtotalEUR / 1.12;
  const taxAmount = totalAmount - taxableValue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[#FAF8F4] border border-[#D8C6A5] rounded-3xl max-w-3xl w-full p-6 sm:p-10 relative shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between border-b border-[#EFE6D8] pb-4 print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#214C3A]" />
            <span className="font-serif font-bold text-[#214C3A] text-lg">Official Tax Invoice</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="bg-[#214C3A] hover:bg-[#4A5D4E] text-[#FAF8F4] px-4 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center space-x-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#1C1C1C]/70 hover:text-[#214C3A] rounded-full hover:bg-[#EFE6D8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Content */}
        <div id="tax-invoice-content" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EFE6D8] text-xs font-sans space-y-6 shadow-sm">
          
          {/* Header & Seller/Buyer Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-[#EFE6D8] pb-6 gap-4">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#214C3A] text-[#D8C6A5] font-serif font-bold text-lg flex items-center justify-center mb-2">
                AR
              </div>
              <h1 className="font-serif font-bold text-2xl text-[#214C3A]">{SHOP_NAME}</h1>
              <p className="text-[11px] text-[#8C7A6B] mt-0.5">Luxury Organic European Linen & Atelier Garments</p>
              <p className="text-[10px] text-[#1C1C1C]/70 mt-1">
                Plot 42, Export Promotion Industrial Park, Faridabad, Haryana - 121003, India<br />
                <strong>GSTIN:</strong> 06AABCA1234F1Z8 | <strong>Export Code (IEC):</strong> 0509012345<br />
                Email: {SHOP_EMAIL} | Phone: {SHOP_PHONE}
              </p>
            </div>

            <div className="text-left sm:text-right bg-[#EFE6D8]/40 p-4 rounded-2xl border border-[#D8C6A5] sm:min-w-[220px]">
              <span className="font-montserrat uppercase font-bold text-[10px] bg-[#214C3A] text-[#D8C6A5] px-2.5 py-0.5 rounded-full block w-max sm:ml-auto mb-2">
                ORIGINAL TAX INVOICE
              </span>
              <div className="font-serif font-bold text-base text-[#214C3A]">{order.invoiceNumber}</div>
              <div className="text-[11px] text-[#8C7A6B]">Date: {order.date}</div>
              <div className="mt-2 text-[10px] font-mono text-[#214C3A] bg-white p-1.5 rounded-lg border border-[#D8C6A5]">
                <strong>Tracking ID:</strong> {order.orderTrackingId}
              </div>
            </div>
          </div>

          {/* Billing & Shipping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="bg-[#FAF8F4] p-4 rounded-xl border border-[#EFE6D8] space-y-1">
              <strong className="font-montserrat uppercase text-[10px] text-[#8C7A6B] block mb-1">Billed To (Customer):</strong>
              <div className="font-serif font-bold text-[#214C3A] text-sm">{order.customerName}</div>
              <p className="text-[#1C1C1C]/80">{order.customerEmail} | {order.customerPhone}</p>
              <p className="text-[#1C1C1C]/80 pt-1">
                {order.billingAddress.street}, {order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.zipCode}, {order.billingAddress.country}
              </p>
            </div>

            <div className="bg-[#FAF8F4] p-4 rounded-xl border border-[#EFE6D8] space-y-1">
              <strong className="font-montserrat uppercase text-[10px] text-[#8C7A6B] block mb-1">Shipped To & Carrier:</strong>
              <div className="font-serif font-bold text-[#214C3A] text-sm">{order.shippingAddress.fullName}</div>
              <p className="text-[#1C1C1C]/80">
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.country}
              </p>
              <div className="pt-2 text-[10px] text-[#214C3A] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Carrier: {order.carrier} (AWB #{order.trackingNumber})</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#214C3A] text-[#FAF8F4] font-montserrat text-[10px] uppercase tracking-wider">
                  <th className="p-3 rounded-l-xl">Item / Garment</th>
                  <th className="p-3">HSN Code</th>
                  <th className="p-3">Spec</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right rounded-r-xl">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D8] font-sans text-[#1C1C1C]">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F4]">
                    <td className="p-3">
                      <div className="font-serif font-bold text-[#214C3A]">{item.product.name}</div>
                      <div className="text-[10px] text-[#8C7A6B]">SKU: {item.product.sku}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">6204.39</td>
                    <td className="p-3 text-[11px] text-[#8C7A6B]">Color: {item.color} | Size: {item.size}</td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-right">
                      {symbol}{isINR ? item.product.priceINR.toLocaleString('en-IN') : item.product.priceEUR}
                    </td>
                    <td className="p-3 text-right font-bold font-serif">
                      {symbol}{isINR ? (item.product.priceINR * item.quantity).toLocaleString('en-IN') : (item.product.priceEUR * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Payment Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#EFE6D8]">
            <div className="bg-[#EFE6D8]/40 p-4 rounded-2xl border border-[#D8C6A5] space-y-2 text-[11px]">
              <strong className="font-montserrat uppercase text-[10px] text-[#214C3A] block">Payment Verification & Transaction Details:</strong>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-bold">{order.paymentDetails.method}</span>
              </div>
              <div className="flex justify-between">
                <span>Shop UPI ID:</span>
                <span className="font-mono">{order.paymentDetails.upiId || SHOP_UPI_ID}</span>
              </div>
              {order.paymentDetails.utrNumber && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Bank UTR / Ref Code:</span>
                  <span className="font-mono underline">{order.paymentDetails.utrNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between text-[#8C7A6B]">
                <span>Subtotal (Garments)</span>
                <span>{symbol}{isINR ? order.subtotalINR.toLocaleString('en-IN') : order.subtotalEUR.toFixed(2)}</span>
              </div>
              {order.discountINR > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promotional Discount</span>
                  <span>-{symbol}{isINR ? order.discountINR.toLocaleString('en-IN') : order.discountEUR.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#8C7A6B]">
                <span>GST (12% Included)</span>
                <span>{symbol}{isINR ? taxAmount.toLocaleString('en-IN') : taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8C7A6B]">
                <span>Global Express Air Freight</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>
              <div className="flex justify-between font-serif font-bold text-lg text-[#214C3A] border-t border-[#EFE6D8] pt-2">
                <span>Total Paid Amount</span>
                <span>{symbol}{isINR ? order.totalINR.toLocaleString('en-IN') : order.totalEUR.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="text-[10px] text-[#8C7A6B] border-t border-[#EFE6D8] pt-4 text-center leading-relaxed">
            This is a computer-generated tax invoice issued by ARVIKA FASHION PVT LTD under European & Indian e-commerce trade directives.<br />
            For any billing queries or return authorizations, contact export@arvikafashion.com or call +91 9891179374.
          </div>

        </div>

      </div>
    </div>
  );
};
