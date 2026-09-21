import { render, screen } from '@testing-library/react'
import MovieCard from '../MovieCard'

const movie = {
  id: 1,
  title: 'Test Movie',
  overview: 'An overview',
  posterPath: null,
  releaseDate: '2020-01-01',
  rating: 7.25,
}

describe('MovieCard', () => {
  it('renders title, rating and fallback poster', () => {
    render(<MovieCard movie={movie} />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Movie')
    expect(screen.getByText(/Release date unknown|2020-01-01/)).toBeInTheDocument()
    expect(screen.getByText('No poster')).toBeInTheDocument()
    expect(screen.getByText(/7.3/)).toBeInTheDocument()
  })
})
