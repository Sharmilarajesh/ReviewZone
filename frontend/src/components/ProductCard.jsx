import { Link } from 'react-router-dom';
import getImageUrl from '../utils/imageHelper';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white border border-[#e0e0e0] rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="h-40 mb-4 flex items-center justify-center bg-gray-50 rounded">
        {product.image ? (
          <img 
            src={getImageUrl(product.image)}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-gray-400">No Image</span>
        )}
      </div>
      
      <h3 className="text-gray-800 text-xl font-bold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-2">₹{product.price}</p>
      
      <div className="flex items-center mb-4">
        <span className="text-yellow-400 text-xl mr-2">★</span>
        <span className="text-gray-800">{product.avgRating?.toFixed(1) || 0}</span>
        <span className="text-gray-500 text-sm ml-2">({product.totalReviews || 0} reviews)</span>
      </div>
      
      <Link 
        to={`/product/${product._id}`}
        className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-2 rounded-lg inline-block w-full text-center"
      >
        View Details
      </Link>
    </div>
  );
};

export default ProductCard;