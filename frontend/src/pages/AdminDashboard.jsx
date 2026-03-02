import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get("edit");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (editId && products.length > 0) {
      const product = products.find((p) => p._id === editId);
      if (product) {
        handleEditProduct(product);
      }
    }
  }, [editId, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    setEditingProduct(null);
    setFormData({ name: "", price: "", description: "" });
    setImage(null);
    setShowForm(false);
    setError("");
    navigate("/admin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("description", formData.description);
    if (image) {
      formDataToSend.append("image", image);
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formDataToSend);
        setSuccess("Product updated successfully!");
      } else {
        await addProduct(formDataToSend);
        setSuccess("Product added successfully!");
      }

      setEditingProduct(null);
      setFormData({ name: "", price: "", description: "" });
      setImage(null);
      setShowForm(false);

      fetchProducts();
      navigate("/admin");
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? All reviews will also be deleted.",
      )
    )
      return;

    try {
      await deleteProduct(productId);
      setSuccess("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      setError("Failed to delete product");
    }
  };

  // Helper function to get image URL
  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/50x50?text=No+Img";
    return `http://localhost:5000${path}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6 py-2 rounded-lg"
          >
            + Add New Product
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-600 p-3 rounded-lg mb-4">{success}</div>
      )}

      {/* Add/Edit Product Form */}
      {showForm && (
        <div className="bg-white border border-[#e0e0e0] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg"
              />
              {editingProduct?.image && !image && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm text-gray-500">Current image:</p>
                  <img
                    src={getImageUrl(editingProduct.image)}
                    alt="Current"
                    className="h-10 w-10 object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/40x40?text=Error";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6 py-2 rounded-lg"
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
              <button
                type="button"
                onClick={handleCancelForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white border border-[#e0e0e0] rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">All Products</h2>

        {products.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No products found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e0e0e0]">
                  <th className="text-left py-3 px-2">Image</th>
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2">Price</th>
                  <th className="text-left py-3 px-2">Rating</th>
                  <th className="text-left py-3 px-2">Reviews</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-[#e0e0e0] hover:bg-gray-50"
                  >
                    <td className="py-3 px-2">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <img
                          src={
                            product.image ||
                            "https://via.placeholder.com/50x50?text=No+Img"
                          }
                          alt={product.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/50x50?text=No+Img";
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-2">{product.totalReviews || 0}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-[#8B5CF6] hover:text-[#7C3AED] text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white border border-[#e0e0e0] rounded-lg p-6">
          <h3 className="text-gray-600 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-[#8B5CF6]">{products.length}</p>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-lg p-6">
          <h3 className="text-gray-600 mb-2">Total Reviews</h3>
          <p className="text-3xl font-bold text-[#8B5CF6]">
            {products.reduce((sum, p) => sum + (p.totalReviews || 0), 0)}
          </p>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-lg p-6">
          <h3 className="text-gray-600 mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-[#8B5CF6]">
            {products.length > 0
              ? (
                  products.reduce((sum, p) => sum + (p.avgRating || 0), 0) /
                  products.length
                ).toFixed(1)
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
