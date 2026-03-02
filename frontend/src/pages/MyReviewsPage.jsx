import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyReviews, deleteReview } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const { data } = await getMyReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId);
        setMessage('Review deleted successfully!');
        fetchMyReviews();
      } catch (error) {
        setMessage('Failed to delete review');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Reviews</h1>

      {message && (
        <div className="text-green-600 p-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white border border-[#e0e0e0] rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't written any reviews yet.</p>
          <Link 
            to="/" 
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6 py-2 rounded-lg inline-block"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white border border-[#e0e0e0] rounded-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <Link 
                  to={`/product/${review.productId._id}`}
                  className="text-xl font-semibold text-[#8B5CF6] hover:underline"
                >
                  {review.productId.name}
                </Link>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              <StarRating rating={review.rating} readonly size="text-xl" />
              
              <p className="text-gray-600 mt-3">{review.comment}</p>
              
              {review.image && (
                <div className="mt-4">
                  <img 
                    src={review.image} 
                    alt="Review"
                    className="max-h-32 rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Link
                  to={`/product/${review.productId._id}`}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-1 rounded-lg text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(review._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;