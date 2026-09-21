import { render, screen } from '@testing-library/react'
import MovieList from '../MovieList'

const movies = [
  { id: 1, title: 'A', overview: '', posterPath: null, releaseDate: '', rating: 5 },
  { id: 2, title: 'B', overview: '', posterPath: null, releaseDate: '', rating: 6 },
]

describe('MovieList', () => {
  it('shows empty message when no movies', () => {
    render(<MovieList movies={[]} />)
    expect(screen.getByText(/No movies found/)).toBeInTheDocument()
  })

  it('renders a list of movies', () => {
    render(<MovieList movies={movies} />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })
})
