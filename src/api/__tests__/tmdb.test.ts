import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { searchMovies } from '../tmdb'

beforeEach(() => {
  vi.stubEnv('VITE_TMDB_ACCESS_TOKEN', 'fake-token')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('tmdb api', () => {
  it('sends the auth token and returns mapped movies', async () => {
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

    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse) })
    ) as unknown as typeof fetch
    vi.stubGlobal('fetch', fetchMock)

    const movies = await searchMovies('x')

    expect(movies).toHaveLength(1)
    expect(movies[0].id).toBe(100)
    expect(movies[0].posterPath).toBe('https://image.tmdb.org/t/p/w500/abc.jpg')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        headers: { Authorization: 'Bearer fake-token' },
      })
    )
  })

  it('throws a descriptive error when the token is missing', async () => {
    vi.stubEnv('VITE_TMDB_ACCESS_TOKEN', '')

    await expect(searchMovies('x')).rejects.toThrow(/VITE_TMDB_ACCESS_TOKEN/)
  })

  it('throws when the response is not ok', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: false, status: 401 })
    ) as unknown as typeof fetch
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchMovies('x')).rejects.toThrow('TMDB request failed: 401')
  })
})
