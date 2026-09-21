import { vi, describe, it, expect, beforeEach } from 'vitest'
import { searchMovies } from '../tmdb'

beforeEach(() => {
  // clear localStorage and reset fetch mock
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear()
  }
  // @ts-ignore
  global.fetch = undefined
})

describe('tmdb api', () => {
  it('uses token from localStorage and returns mapped movies', async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('VITE_TMDB_ACCESS_TOKEN', 'fake-token')
    }

    const mockResponse = {
      results: [
        {
          id: 100,
          title: 'Mocked',
          overview: '...',
          poster_path: '/abc.jpg',
          release_date: '2020-01-01',
          vote_average: 8.5,
        },
      ],
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse) })
    ) as any

    const movies = await searchMovies('x')
    expect(movies).toHaveLength(1)
    expect(movies[0].id).toBe(100)
    expect(global.fetch).toHaveBeenCalled()
  })
})
