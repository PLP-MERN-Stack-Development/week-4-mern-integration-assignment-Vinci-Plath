import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { postService, commentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      const { data, error } = await postService.getPostById(id);
      if (error) toast(error, 'error');
      setPost(data?.data || null);
      setIsLoading(false);
    };
    fetchPost();
  }, [id, toast]);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await commentService.getComments(id);
      if (error) toast(error, 'error');
      setComments(data?.data || []);
    };
    fetchComments();
  }, [id, toast]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsCommenting(true);
    const { data, error } = await commentService.addComment(id, commentText);
    if (error) toast(error, 'error');
    else {
      setComments((prev) => [...prev, data.data]);
      setCommentText('');
      toast('Comment added!', 'success');
    }
    setIsCommenting(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    setIsDeleting(commentId);
    const { error } = await commentService.deleteComment(id, commentId);
    if (error) toast(error, 'error');
    else {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast('Comment deleted.', 'success');
    }
    setIsDeleting(null);
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!post) return <div className="p-8 text-center">Post not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <div className="text-gray-500 mb-4">Category: {post.category?.name}</div>
      {post.featuredImage && (
        <img src={post.featuredImage} alt="Featured" className="mb-4 rounded" />
      )}
      <div className="mb-6 whitespace-pre-line">{post.content}</div>
      <hr className="my-6" />
      <h2 className="text-xl font-semibold mb-2">Comments</h2>
      <form onSubmit={handleAddComment} className="mb-4 flex gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Add a comment..."
          disabled={isCommenting}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isCommenting || !commentText.trim()}
        >
          {isCommenting ? 'Posting...' : 'Post'}
        </button>
      </form>
      <ul className="space-y-4">
        {comments.length === 0 && <li className="text-gray-500">No comments yet.</li>}
        {comments.map((comment) => (
          <li key={comment._id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{comment.user?.username || 'User'}</div>
              <div className="text-gray-700">{comment.content}</div>
              <div className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</div>
            </div>
            {(user && (user._id === comment.user?._id || user._id === post.author)) && (
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="btn btn-sm btn-danger ml-4"
                disabled={isDeleting === comment._id}
              >
                {isDeleting === comment._id ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostDetail; 