import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import FavoritesPage from './pages/FavoritesPage';
import Home from './pages/Home';
import MovieDetailPage from './pages/MovieDetailPage';
import { useFavorites } from './hooks/useFavorites';

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return isActive ? 'active' : undefined;
}

export default function App() {
  const { favorites } = useFavorites();
  const location = useLocation();

  return (
    <main className="container">
      <header className="site-header">
        <Link to="/" className="brand">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <circle cx="14" cy="14" r="12" style={{ stroke: 'var(--accent)' }} strokeWidth="2" />
            <path d="M11 9.5L19 14L11 18.5V9.5Z" style={{ fill: 'var(--accent)' }} />
          </svg>
          <span>Movie Explorer</span>
        </Link>
        <nav className="site-nav">
          <NavLink to="/" end className={navLinkClassName}>
            Search
          </NavLink>
          <NavLink to="/favorites" className={navLinkClassName}>
            Favorites <span className="count">({favorites.length})</span>
          </NavLink>
        </nav>
      </header>

      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </ErrorBoundary>

      <footer>TMDB API</footer>
    </main>
  );
}
