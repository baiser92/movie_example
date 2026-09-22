import { Link, Route, Routes } from 'react-router-dom';
import FavoritesPage from './pages/FavoritesPage';
import Home from './pages/Home';
import MovieDetailPage from './pages/MovieDetailPage';
import { useFavorites } from './hooks/useFavorites';

export default function App() {
  const { favorites } = useFavorites();

  return (
    <main className="container">
      <header>
        <p className="eyebrow">React · TypeScript · TMDB API</p>
        <h1>Movie Explorer</h1>
        <p>Search movies and explore basic metadata from TMDB.</p>
        <nav className="site-nav">
          <Link to="/">Search</Link>
          <Link to="/favorites">Favorites ({favorites.length})</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>

      <footer>TMDB API</footer>
    </main>
  );
}
