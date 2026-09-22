import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import MovieDetailPage from './pages/MovieDetailPage';

export default function App() {
  return (
    <main className="container">
      <header>
        <p className="eyebrow">React · TypeScript · TMDB API</p>
        <h1>Movie Explorer</h1>
        <p>Search movies and explore basic metadata from TMDB.</p>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
      </Routes>

      <footer>TMDB API</footer>
    </main>
  );
}
