import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { postService, categoryService } from '../services/api';
import { useToast } from '../context/ToastContext';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const PostForm = ({ isEdit = false, initialData = {}, onSuccess }) => {
  const { id } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    content: initialData.content || '',
    category: initialData.category?._id || '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  // Fetch available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const { data } = await categoryService.getAllCategories();
        setCategories(data?.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast('Failed to load categories', 'error');
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [toast]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast('Invalid image type. Allowed: jpg, png, gif, webp', 'error');
        return;
      }
      if (file && file.size > MAX_IMAGE_SIZE) {
        toast('Image is too large (max 5MB)', 'error');
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setIsSubmitting(true);
      let result;
      if (isEdit && id) {
        result = await postService.updatePost(id, formData);
      } else {
        result = await postService.createPost(formData);
      }
      if (result.error) throw new Error(result.error);
      toast(isEdit ? 'Post updated successfully!' : 'Post created successfully!', 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error saving post:', err);
      toast(err.message || `Failed to ${isEdit ? 'update' : 'create'} post. Please try again.`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Post' : 'Create New Post'}
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Enter post title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>
        {/* Content Field */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            rows={8}
            value={formData.content}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.content ? 'border-red-500' : ''}`}
            placeholder="Write your post content here..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>
        {/* Category Field */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.category ? 'border-red-500' : ''}`}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>
        {/* Image Field */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleInputChange}
            className="mt-1 block w-full text-sm text-gray-500"
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="h-32 object-cover rounded" />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, image: null }));
                  setImagePreview(null);
                }}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="btn btn-primary flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                Saving...
              </>
            ) : (
              <>
                {isEdit ? 'Update Post' : 'Create Post'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm; 