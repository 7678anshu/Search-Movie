import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AiOutlineSearch } from 'react-icons/ai';
import './MovieApp.css';

let debounceTimer;

const MovieRecommendations = () => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  const randomKeywords = ['love', 'hero', 'life', 'dark', 'day', 'moon', 'star', 'war', 'girl', 'boy'];

  const getRandomKeyword = () => {
    const randomIndex = Math.floor(Math.random() * randomKeywords.length);
    return randomKeywords[randomIndex];
  };

  const fetchMovies = async (query, page = 1, append = false) => {
    if (!query) return;
    setLoading(true);
    setError('');
    try {
      const params = {
        apikey: '1131a0e3',
        s: query,
        page,
      };
      if (typeFilter) params.type = typeFilter;
      if (yearFilter && /^\d{4}$/.test(yearFilter)) {
        params.y = yearFilter;
      }

      const response = await axios.get('https://www.omdbapi.com/', { params });

      if (response.data.Response === 'True') {
        setMovies((prev) => {
          if (append && page > 1) {
            return [...prev, ...response.data.Search];
          } else {
            return response.data.Search;
          }
        });
        setTotalPages(Math.ceil(response.data.totalResults / 10));
        setError('');
      } else {
        if (!append || page === 1) {
          setError(response.data.Error || 'No results found');
          setMovies([]);
          setTotalPages(1);
        }
      }
    } catch {
      setError('Failed to fetch movies');
      if (!append) setMovies([]);
    }
    setLoading(false);
  };

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.scrollHeight &&
      !loading &&
      pageNumber < totalPages
    ) {
      setPageNumber((prev) => prev + 1);
    }
  }, [loading, pageNumber, totalPages]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const query = isSearchMode && searchQuery.trim() ? searchQuery : getRandomKeyword();
    fetchMovies(query, pageNumber, pageNumber > 1);
  }, [pageNumber, typeFilter, yearFilter]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      setPageNumber(1);
      fetchMovies(getRandomKeyword(), 1, false);
      return;
    }

    setIsSearchMode(true);
    setPageNumber(1);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchMovies(searchQuery, 1, false);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, typeFilter, yearFilter]);

  const clearSearch = () => {
    setSearchQuery('');
    setTypeFilter('');
    setYearFilter('');
    setIsSearchMode(false);
    setPageNumber(1);
    setMovies([]);
    setError('');
    fetchMovies(getRandomKeyword(), 1, false);
  };

  return (
    <div>
      <div className="navbar">
        <div className="logo">
          <svg width="60" height="60" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" stroke="#000" strokeWidth="4" fill="#f5f5f5" />
            <circle cx="32" cy="32" r="8" fill="#000" />
            <circle cx="16" cy="32" r="4" fill="#000" />
            <circle cx="48" cy="32" r="4" fill="#000" />
            <circle cx="32" cy="16" r="4" fill="#000" />
            <circle cx="32" cy="48" r="4" fill="#000" />
            <line x1="45" y1="45" x2="60" y2="60" stroke="#000" strokeWidth="4" strokeLinecap="round" />
            <circle cx="44" cy="44" r="5" fill="#000" />
          </svg>
        </div>
        <div className="links">
          <ul>
            <li><a href="#" style={{ borderBottom: '2px solid white', paddingBottom: '4px' }}>Home</a></li>
            <li><a href="#">About</a></li>
          </ul>
        </div>
      </div>
      <h1><span>Movie</span>House</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button className="search-button" disabled>
          <AiOutlineSearch />
        </button>
      </div>

      <div className="filters">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="movie">Movie</option>
          <option value="series">Series</option>
          <option value="episode">Episode</option>
        </select>

        <input
          type="number"
          placeholder="Year (e.g., 2020)"
          title="Enter full 4-digit year"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          min="1900"
          max={new Date().getFullYear()}
        />

        <button className="clear-button" onClick={clearSearch}>
          Clear All
        </button>
      </div>

      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}
      {error && <div className="error-message">😢 {error}</div>}


      <div className="movie-wrapper">
        {movies.map((movie) => (
          <div key={movie.imdbID} className="movie">
            <img
              src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}
              alt={movie.Title}
              onError={(e) => {
                if (e.target.src !== 'https://via.placeholder.com/300x450?text=No+Image') {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                }
              }}
            />
            <h2>{movie.Title}</h2>
            <p>Year: {movie.Year}</p>
            <p>Type: {movie.Type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieRecommendations;
