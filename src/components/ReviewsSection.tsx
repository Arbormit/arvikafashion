import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, ThumbsUp, Plus, Filter, MessageSquare, Sparkles, Check, X, Trash2, AlertCircle } from 'lucide-react';
import { Review } from '../types';
import { db } from '../services/db';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(() => db.getReviews());
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with real-time review updates across components
  useEffect(() => {
    const handleUpdate = () => {
      setReviews(db.getReviews());
    };
    window.addEventListener('arvika_reviews_updated', handleUpdate);
    return () => window.removeEventListener('arvika_reviews_updated', handleUpdate);
  }, []);

  // New review form state
  const [newName, setNewName] = useState('');
  const [newCountry, setNewCountry] = useState('🇩🇰 Denmark');
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleHelpful = (id: string) => {
    db.voteHelpfulReview(id);
    setReviews(db.getReviews());
  };

  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const confirmDeleteReview = () => {
    if (!reviewToDelete) return;
    db.deleteReview(reviewToDelete.id);
    setReviews(db.getReviews());
    showToast('Review permanently deleted from store & Neon DB. 🗑️');
    setReviewToDelete(null);
  };

  const openReviewModal = () => {
    const user = db.getCurrentUser();
    if (user && user.isLoggedIn && user.name && !newName) {
      setNewName(user.name);
    }
    setIsSubmitModalOpen(true);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTitle.trim() || !newComment.trim()) return;

    const currentUser = db.getCurrentUser();

    db.addReview({
      userName: newName.trim(),
      userAvatar: currentUser?.isLoggedIn && currentUser.avatar ? currentUser.avatar : undefined,
      country: newCountry,
      rating: newRating,
      title: newTitle.trim(),
      comment: newComment.trim(),
      isVerifiedBuyer: true
    });

    setReviews(db.getReviews());
    setIsSubmitModalOpen(false);
    setNewTitle('');
    setNewComment('');
    showToast('Thank you! Your client review has been published live across the store! 🌟');
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating && r.rating !== filterRating) return false;
    if (isVerifiedOnly && !r.isVerifiedBuyer) return false;
    return true;
  });

  const totalReviewsCount = reviews.length;
  const avgRating = totalReviewsCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : '0.0';

  const starBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const pctNum = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
    return { stars, pct: `${pctNum}%`, count };
  });

  return (
    <section className="py-20 bg-[#FAF8F4] border-t border-[#EFE6D8] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#214C3A] text-[#D8C6A5] px-6 py-3 rounded-full text-xs font-montserrat font-bold shadow-2xl border border-[#C5A059] flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-montserrat uppercase tracking-[0.25em] text-[#8C7A6B] font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            CLIENT FEEDBACK & EXPORT REPUTATION
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#214C3A] mt-2">
            European & Global Reviews
          </h2>
        </div>

        <button
          onClick={openReviewModal}
          className="bg-[#214C3A] text-[#FAF8F4] hover:bg-[#4A5D4E] px-6 py-3.5 rounded-full font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center space-x-2 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 text-[#D8C6A5]" />
          <span>Write a Client Review</span>
        </button>
      </div>

      {/* Overview & Rating Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-[#EFE6D8]/40 border border-[#D8C6A5] p-8 rounded-3xl">
        
        {/* Rating Score */}
        <div className="text-center lg:border-r border-[#D8C6A5] lg:pr-8 space-y-2">
          <div className="font-serif text-6xl font-bold text-[#214C3A]">{avgRating}</div>
          <div className="flex justify-center space-x-1 text-[#C5A059]">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-5 h-5 ${s <= Math.round(Number(avgRating)) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#D8C6A5]'}`} />
            ))}
          </div>
          <p className="text-xs font-montserrat font-bold text-[#8C7A6B] uppercase tracking-wider">
            {totalReviewsCount === 0 ? 'No Client Reviews Submitted Yet' : `Based on ${totalReviewsCount} Verified Client ${totalReviewsCount === 1 ? 'Review' : 'Reviews'}`}
          </p>
        </div>

        {/* Progress Breakdown */}
        <div className="space-y-2 text-xs font-sans text-[#1C1C1C]/80 lg:col-span-2">
          {starBreakdown.map((item) => (
            <div key={item.stars} className="flex items-center gap-3">
              <span className="w-12 font-montserrat font-bold text-[#214C3A]">{item.stars} Stars</span>
              <div className="flex-1 h-2 bg-[#EFE6D8] rounded-full overflow-hidden">
                <div className="h-full bg-[#214C3A] rounded-full transition-all duration-500" style={{ width: item.pct }} />
              </div>
              <span className="w-10 text-right text-[#8C7A6B] font-mono">{item.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EFE6D8]">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#8C7A6B]" />
          <span className="text-xs font-montserrat font-bold text-[#214C3A] uppercase tracking-wider">Filter Reviews:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterRating(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-montserrat font-bold transition-all ${
              filterRating === null ? 'bg-[#214C3A] text-[#FAF8F4]' : 'bg-[#EFE6D8]/60 text-[#1C1C1C]'
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3].map((star) => (
            <button
              key={star}
              onClick={() => setFilterRating(star)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-montserrat font-bold transition-all ${
                filterRating === star ? 'bg-[#214C3A] text-[#FAF8F4]' : 'bg-[#EFE6D8]/60 text-[#1C1C1C]'
              }`}
            >
              {star} Stars
            </button>
          ))}

          <button
            onClick={() => setIsVerifiedOnly(!isVerifiedOnly)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-montserrat font-bold transition-all flex items-center gap-1 ${
              isVerifiedOnly ? 'bg-[#214C3A] text-[#FAF8F4]' : 'bg-[#EFE6D8]/60 text-[#1C1C1C]'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-[#C5A059]" /> Verified Buyers Only
          </button>
        </div>
      </div>

      {/* Reviews Cards List or Empty State */}
      {filteredReviews.length === 0 ? (
        <div className="bg-[#EFE6D8]/30 border border-[#D8C6A5] rounded-3xl p-10 sm:p-14 text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#EFE6D8] text-[#214C3A] flex items-center justify-center mx-auto shadow-xs">
            <MessageSquare className="w-8 h-8 text-[#C5A059]" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#214C3A]">
            No Client Reviews Yet
          </h3>
          <p className="text-xs text-[#8C7A6B] max-w-md mx-auto leading-relaxed font-sans">
            Be the very first client to share your experience with Arvika Fashion's European organic linen and hand-loom collections!
          </p>
          <button
            onClick={openReviewModal}
            className="bg-[#214C3A] text-[#FAF8F4] hover:bg-[#1A3D2F] px-6 py-3.5 rounded-full font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center space-x-2 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#D8C6A5]" />
            <span>Be the First to Write a Review</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white border border-[#EFE6D8] p-6 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {rev.userAvatar ? (
                  <img
                    src={rev.userAvatar}
                    alt={rev.userName}
                    className="w-10 h-10 rounded-full object-cover border border-[#D8C6A5]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#214C3A] text-[#D8C6A5] flex items-center justify-center font-bold font-serif">
                    {rev.userName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-serif font-bold text-base text-[#214C3A]">
                    {rev.userName}
                  </div>
                  <div className="text-[11px] font-sans text-[#8C7A6B]">
                    {rev.country}
                  </div>
                </div>
              </div>

              {rev.isVerifiedBuyer && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-montserrat font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Verified Buyer
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1 text-[#C5A059]">
              {Array.from({ length: rev.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#C5A059]" />
              ))}
            </div>

            <h4 className="font-serif text-lg font-bold text-[#214C3A]">
              "{rev.title}"
            </h4>

            <p className="text-xs text-[#1C1C1C]/80 font-sans leading-relaxed">
              {rev.comment}
            </p>

            <div className="pt-2 flex items-center justify-between text-[11px] font-sans text-[#8C7A6B] border-t border-[#EFE6D8]">
              <span>{rev.date}</span>
              <div className="flex items-center space-x-3">
                {db.getCurrentUser()?.role === 'admin' && (
                  <button
                    onClick={() => setReviewToDelete(rev)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1 font-montserrat font-bold cursor-pointer"
                    title="Delete Review (Admin Moderation)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
                <button
                  onClick={() => handleHelpful(rev.id)}
                  className="flex items-center space-x-1 text-[#214C3A] hover:underline font-montserrat font-semibold"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

      {/* New Review Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <h3 className="font-serif text-2xl font-bold text-[#214C3A]">
              Submit Your Client Feedback
            </h3>
            <p className="text-xs text-[#8C7A6B] font-sans">
              Share your experience with Arvika Fashion's organic fabrics and European export service.
            </p>

            <form onSubmit={handleAddReview} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ebba Lindgren"
                  className="w-full bg-white p-2.5 rounded-xl border border-[#D8C6A5] focus:outline-none focus:ring-2 focus:ring-[#214C3A]"
                />
              </div>

              <div>
                <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Country / Region</label>
                <select
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-xl border border-[#D8C6A5] focus:outline-none"
                >
                  <option value="🇩🇰 Denmark">🇩🇰 Denmark (Copenhagen)</option>
                  <option value="🇸🇪 Sweden">🇸🇪 Sweden (Stockholm)</option>
                  <option value="🇩🇪 Germany">🇩🇪 Germany (Munich/Berlin)</option>
                  <option value="🇫🇷 France">🇫🇷 France (Paris)</option>
                  <option value="🇬🇧 United Kingdom">🇬🇧 United Kingdom (London)</option>
                  <option value="🇮🇳 India">🇮🇳 India (Delhi / Mumbai / Bengaluru)</option>
                </select>
              </div>

              <div>
                <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Star Rating</label>
                <div className="flex gap-2 text-[#C5A059]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= newRating ? 'fill-[#C5A059]' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Stunning linen drape & fast DHL shipping!"
                  className="w-full bg-white p-2.5 rounded-xl border border-[#D8C6A5] focus:outline-none focus:ring-2 focus:ring-[#214C3A]"
                />
              </div>

              <div>
                <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Your Detailed Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Describe fit, fabric handfeel, stitching quality..."
                  className="w-full bg-white p-2.5 rounded-xl border border-[#D8C6A5] focus:outline-none focus:ring-2 focus:ring-[#214C3A]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 bg-[#EFE6D8] text-[#214C3A] py-3 rounded-xl font-montserrat font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#214C3A] text-[#FAF8F4] py-3 rounded-xl font-montserrat font-bold"
                >
                  Post Review
                </button>
              </div>
            </form>
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
                Delete Client Review?
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

    </section>
  );
};
