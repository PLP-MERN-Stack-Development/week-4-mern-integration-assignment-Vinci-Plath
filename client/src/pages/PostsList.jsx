import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { postService, categoryService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FiSearch, FiPlus, FiTrash2, FiEdit2, FiLoader, FiImage } from 'react-icons/fi';
import debounce from 'lodash.debounce';

const CATEGORY_COLORS = {
  Technology: 'bg-blue-500',
  Art: 'bg-pink-500',
  Music: 'bg-purple-500',
  Photography: 'bg-yellow-500',
  Travel: 'bg-cyan-500',
  Lifestyle: 'bg-green-500',
  Ideas: 'bg-indigo-500',
  Gaming: 'bg-orange-500',
  Books: 'bg-red-500',
  Default: 'bg-primary',
};

const PostCard = ({ post }) => {
  const categoryColor = CATEGORY_COLORS[post.category?.name] || CATEGORY_COLORS.Default;
  return (
    <div className="bg-card rounded-lg shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-105 flex flex-col overflow-hidden animate-fade-in">
      <div className="h-48 w-full bg-muted flex items-center justify-center overflow-hidden">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.title} className="object-cover w-full h-full" />
        ) : (
          <FiImage className="text-5xl text-muted" />
        )}
      </div>
      <div className="flex-1 flex flex-col p-5">
        <div className="flex items-center gap-2 mb-2">
          {post.category?.name && (
            <span className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${categoryColor} shadow`}>{post.category.name}</span>
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
        <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">{post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="text-xs text-gray-500">
            By {post.author?.name || 'Unknown'}<br />
            <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
          </div>
          <Link
            to={`/posts/${post._id}`}
            className="ml-2 px-4 py-2 bg-primary text-white rounded-full font-semibold shadow hover:bg-accent transition-colors duration-200"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

const PostsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });
  const [isSearching, setIsSearching] = useState(false);

  // Fetch posts with pagination and filters
  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter })
      };
      const { data, error } = await postService.getPosts(params);
      if (error) {
        toast(error, 'error');
        return;
      }
      setPosts(data.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 1) / pagination.limit),
        page: params.page || 1
      }));
    } catch (err) {
      console.error('Error fetching posts:', err);
      toast('Failed to load posts. Please try again.', 'error');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, categoryFilter, toast]);

  // Fetch categories
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

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchPosts();
    }, 500),
    [fetchPosts]
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
    setIsSearching(true);
    debouncedSearch();
  };

  const handleCategoryChange = (category) => {
    setCategoryFilter(category === categoryFilter ? '' : category);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    try {
      setIsDeleting(id);
      const { error } = await postService.deletePost(id);
      if (error) {
        toast(error, 'error');
        return;
      }
      toast('Post deleted successfully', 'success');
      await fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      toast('Failed to delete post. Please try again.', 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  const hasActiveFilters = searchTerm || categoryFilter;

  // Pagination controls
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    return (
      <div className="flex justify-center mt-8 gap-2">
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`px-3 py-1 rounded ${page === pagination.page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setPagination(prev => ({ ...prev, page }))}
            disabled={page === pagination.page}
          >
            {page}
          </button>
        ))}
      </div>
    );
  };

  if (isLoading && !posts.length) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Posts</h1>
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Filters applied
              </span>
              <button
                className="text-xs text-red-500 hover:underline"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchPosts()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <FiSearch className="mr-2 h-4 w-4" />
            Refresh
          </button>
          <Link
            to="/posts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search posts
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by title or content..."
            disabled={isSearching}
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by category</label>
        <div className="flex flex-wrap gap-2">
          {isCategoriesLoading ? (
            <span>Loading categories...</span>
          ) : (
            <>
              <button
                className={`category-tag ${!categoryFilter ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleCategoryChange('')}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  className={`category-tag ${categoryFilter === cat.name ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => handleCategoryChange(cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiSearch className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No posts found</h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilters 
              ? 'No posts match your current filters.' 
              : 'Get started by creating a new post.'}
          </p>
          <Link
            to="/posts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="-ml-1 mr-2 h-4 w-4" />
            New Post
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default PostsList; 