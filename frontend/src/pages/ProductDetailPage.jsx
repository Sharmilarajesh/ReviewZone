import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProduct, getProductReviews, addReview, updateReview, deleteReview } from '../services/api';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      fetchProductAndReviews();
    }
  }, [id]);

  const fetchProductAndReviews = async () => {
    try {
      const [productRes, reviewsRes] = await Promise.all([
        getProduct(id),
        getProductReviews(id)
      ]);
      setProduct(productRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('productId', id);
    formData.append('rating', rating.toString());
    formData.append('comment', comment);
    
    if (image) {
      formData.append('image', image);
    }

    try {
      if (editingReview) {
        await updateReview(editingReview._id, formData);
        setSuccess('Review updated successfully!');
      } else {
        await addReview(formData);
        setSuccess('Review added successfully!');
      }
      
      setRating(5);
      setComment('');
      setImage(null);
      setShowReviewForm(false);
      setEditingReview(null);
      
      fetchProductAndReviews();
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setShowReviewForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await deleteReview(reviewId);
      setSuccess('Review deleted successfully!');
      fetchProductAndReviews();
    } catch (error) {
      setError('Failed to delete review');
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setRating(5);
    setComment('');
    setImage(null);
    setShowReviewForm(false);
  };

  const userReview = reviews.find(r => r.userId?._id === user?.id);

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-8">Product not found</div>;

  // Image URL helper
  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/300x300?text=No+Image';
    return `http://localhost:5000${path}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Product Details */}
      <div className="bg-white border border-[#e0e0e0] rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
              <img 
                src={getImageUrl(product.image)}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                }}
              />
            </div>
          </div>

          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-2xl text-[#8B5CF6] font-bold mb-4">₹{product.price}</p>
            
            <div className="flex items-center mb-4">
              <span className="text-yellow-400 text-2xl mr-2">★</span>
              <span className="text-gray-800 text-xl">{product.avgRating?.toFixed(1) || 0}</span>
              <span className="text-gray-500 ml-2">({product.totalReviews || 0} reviews)</span>
            </div>

            <p className="text-gray-600 mb-4">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-600 p-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* Review Button */}
      {user && !showReviewForm && (
        <div className="mb-8">
          {userReview ? (
            <button
              onClick={() => handleEditClick(userReview)}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6 py-3 rounded-lg"
            >
              Edit Your Review
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingReview(null);
                setRating(5);
                setComment('');
                setImage(null);
                setShowReviewForm(true);
              }}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6 py-3 rounded-lg"
            >
              Write a Review
            </button>
          )}
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && user && (
        <div className="bg-white border border-[#e0e0e0] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </h2>
          
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rating</label>
              <StarRating rating={rating} onRate={setRating} />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows="4"
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#8B5CF6]"
                placeholder="Share your experience with this product..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg"
              />
              {editingReview?.image && !image && (
                <p className="text-sm text-gray-500 mt-1">
                  Current image: {editingReview.image.split('/').pop()}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6 py-2 rounded-lg"
              >
                {editingReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Login prompt */}
      {!user && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-8">
          Please <button onClick={() => navigate('/login')} className="text-[#8B5CF6] underline">login</button> to write a review.
        </div>
      )}

      {/* All Reviews */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
        </h2>
        
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="bg-white border border-[#e0e0e0] rounded-lg p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-gray-800">
                      {review.userId?.name || 'Anonymous'}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {review.userId?._id === user?.id && (
                      <button
                        onClick={() => handleEditClick(review)}
                        className="text-[#8B5CF6] hover:text-[#7C3AED] text-sm font-medium"
                      >
                        Edit
                      </button>
                    )}
                    
                    {(isAdmin || review.userId?._id === user?.id) && (
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-500 hover:text-red-600 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                
                <StarRating rating={review.rating} readonly size="text-xl" />
                <p className="text-gray-600 mt-2">{review.comment}</p>
                
                {review.image && (
                  <img 
                    src={getImageUrl(review.image)}
                    alt="Review"
                    className="mt-4 max-h-40 rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;