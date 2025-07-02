import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';

const CreatePost = () => {
  const navigate = useNavigate();
  const handleSuccess = () => {
    navigate('/posts');
  };
  return (
    <div className="bg-white py-6 sm:py-8 lg:py-12">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <PostForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default CreatePost; 