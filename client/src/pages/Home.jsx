import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section className="relative overflow-hidden min-h-[60vh] flex flex-col justify-center items-center py-16 px-4 bg-gradient-to-br from-primary/80 via-accent/60 to-secondary/80 animate-fade-in rounded-2xl shadow-glow">
      <div className="relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow mb-4 animate-slide-in">Welcome to Postly.</h1>
        <p className="text-lg md:text-2xl text-white/90 mb-8 animate-fade-in">
          Postly is your playground for ideas.<br />
          Write something daring, something brilliant, something beautifully you.
        </p>
        <Link
          to="/posts/new"
          className="inline-block px-8 py-3 bg-white text-primary font-bold rounded-full shadow-lg hover:bg-primary hover:text-white transition-all duration-200 animate-fade-in hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/30"
        >
          + Create New Post
        </Link>
      </div>
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl z-0" />
    </section>
  );
};

export default Home;
