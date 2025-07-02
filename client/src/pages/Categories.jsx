import { FaLaptopCode, FaPaintBrush, FaMusic, FaCamera, FaPlane, FaLeaf, FaLightbulb, FaGamepad, FaBook } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  {
    name: 'Technology',
    icon: <FaLaptopCode size={32} />, 
    gradient: 'from-indigo-500 to-blue-500',
    slug: 'technology',
  },
  {
    name: 'Art',
    icon: <FaPaintBrush size={32} />, 
    gradient: 'from-pink-500 to-rose-400',
    slug: 'art',
  },
  {
    name: 'Music',
    icon: <FaMusic size={32} />, 
    gradient: 'from-purple-500 to-indigo-400',
    slug: 'music',
  },
  {
    name: 'Photography',
    icon: <FaCamera size={32} />, 
    gradient: 'from-yellow-400 to-orange-400',
    slug: 'photography',
  },
  {
    name: 'Travel',
    icon: <FaPlane size={32} />, 
    gradient: 'from-cyan-500 to-blue-300',
    slug: 'travel',
  },
  {
    name: 'Lifestyle',
    icon: <FaLeaf size={32} />, 
    gradient: 'from-green-400 to-lime-400',
    slug: 'lifestyle',
  },
  {
    name: 'Ideas',
    icon: <FaLightbulb size={32} />, 
    gradient: 'from-yellow-300 to-yellow-500',
    slug: 'ideas',
  },
  {
    name: 'Gaming',
    icon: <FaGamepad size={32} />, 
    gradient: 'from-orange-500 to-pink-500',
    slug: 'gaming',
  },
  {
    name: 'Books',
    icon: <FaBook size={32} />, 
    gradient: 'from-red-500 to-pink-400',
    slug: 'books',
  },
];

const Categories = () => {
  return (
    <div className="w-full animate-fade-in">
      {/* Hero/Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">Explore by Category</h1>
        <p className="text-lg text-gray-600 text-center mb-8">Dive into your favorite topics and find posts that speak to you.</p>
      </div>
      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {CATEGORIES.map((cat, idx) => (
          <Link
            to={`/category/${cat.slug}`}
            key={cat.name}
            className={`flex flex-col items-center justify-center rounded-xl shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-105 bg-gradient-to-r ${cat.gradient} text-white font-semibold tracking-wide py-8 px-4 cursor-pointer animate-fade-in`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="mb-3 drop-shadow-lg">{cat.icon}</div>
            <span className="text-xl font-bold mb-1 drop-shadow">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories; 