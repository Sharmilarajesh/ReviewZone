import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md border-b border-[#e0e0e0]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-[#8B5CF6]">
            ReviewZone
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-800 hover:text-[#8B5CF6]">
              Products
            </Link>
            
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="text-gray-800 hover:text-[#8B5CF6]">
                    Admin
                  </Link>
                )}
                <Link to="/my-reviews" className="text-gray-800 hover:text-[#8B5CF6]">
                  My Reviews
                </Link>
                <span className="text-gray-600">Hi, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-800 hover:text-[#8B5CF6]">
                  Login
                </Link>
                <Link
                  to="/login"
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-2 rounded-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;