import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService } from '../services/api';
import PostForm from '../components/PostForm';
import { useToast } from '../context/ToastContext';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError('');
        const { data, error: fetchError } = await postService.getPostById(id);
        if (fetchError) throw new Error(fetchError);
        if (!data || !data.data) throw new Error('Post not found');
        setPost(data.data);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError(err.message || 'Failed to load post. It may have been deleted or you may not have permission to view it.');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchPost();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const handleSuccess = () => {
    navigate('/posts');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-2">
                <button
                  onClick={() => navigate('/posts')}
                  className="text-sm font-medium text-red-700 hover:text-red-600"
                >
                  &larr; Back to posts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-6 sm:py-8 lg:py-12">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        {post ? (
          <PostForm 
            isEdit={true} 
            initialData={post} 
            onSuccess={handleSuccess} 
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No post data available</p>
            <button
              onClick={() => navigate('/posts')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Back to posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPost; 