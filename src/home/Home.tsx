import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Home.css';
import Navbar from '../config/Navbar';
import { User, Movie } from '../config/interfaces';

interface BannerMovie{
    id: number;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
}

interface HomeProps {
    onLogout: () => void;
    id: string;
}

const Home: React.FC<HomeProps> = ({ onLogout, id }) => {
    const [movieData, setMovieData] = useState<{
        topMovie: BannerMovie | null;
        popularMovies: Movie[];
        latestMovies: Movie[];
        actionMovies: Movie[];
        animationMovies: Movie[];
    }>({
        topMovie: null,
        popularMovies: [],
        latestMovies: [],
        actionMovies: [],
        animationMovies: [],
    });


    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const foundUser = savedUsers.find(user => user.email === id);
    const API_KEY = foundUser?.password;

    // 찜 목록 상태 (wish)
    const [wish, setWish] = useState<Movie[]>(() => {
        const storedWish = localStorage.getItem(`${id}_wish`);
        try {
            return storedWish ? JSON.parse(storedWish) : []; // JSON 파싱
        } catch {
            return []; // 파싱 실패 시 빈 배열
        }
    });

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const [
                    top,
                    popular,
                    latestPage1,
                    latestPage2,
                    action,
                    animation,
                ] = await Promise.all([
                    fetchBannerMovie(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ko-KR`),
                    fetchMoviesByCategory(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ko-KR`),
                    fetchMoviesByCategory(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=ko-KR`),
                    fetchMoviesByCategory(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=ko-KR&page=2`),
                    fetchMoviesByCategory(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=28&language=ko-KR`),
                    fetchMoviesByCategory(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=16&language=ko-KR`),
                ]);

                const uniqueLatestMovies = [...latestPage1, ...latestPage2].filter(
                    (latestMovie) => !popular.some((popularMovie) => popularMovie.id === latestMovie.id)
                );

                setMovieData({
                    topMovie: top[0] || null,
                    popularMovies: popular.slice(0, 20),
                    latestMovies: uniqueLatestMovies.slice(0, 20),
                    actionMovies: action.slice(0, 20),
                    animationMovies: animation.slice(0, 20),
                });
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };
        fetchMovies();
    }, []);


    const fetchBannerMovie= async (url: string): Promise<BannerMovie[]> => {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    };

    const fetchMoviesByCategory = async (url: string): Promise<Movie[]> => {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    };

    // 찜 상태 토글: 영화 객체 추가/제거
    const toggleWish = (movie: Movie) => {
        const isMovieLiked = wish.some((likedMovie) => likedMovie.id === movie.id);
        const updatedWish = isMovieLiked
            ? wish.filter((likedMovie) => likedMovie.id !== movie.id) // 이미 찜한 경우 제거
            : [
                ...wish,
                {
                    id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                },
            ]; // 새로 추가

        setWish(updatedWish); // 상태 업데이트
        localStorage.setItem(`${id}_wish`, JSON.stringify(updatedWish)); // 로컬 스토리지에 저장
    };

    return (
        <div className="home">
            <Navbar username={id} onLogout={onLogout} />
            {movieData.topMovie && (
                <div
                    className="top-banner"
                    style={{
                        backgroundImage: `url(https://image.tmdb.org/t/p/original${movieData.topMovie?.backdrop_path})`,
                    }}
                >
                    <div className="top-banner-content">
                        <h1 className="top-banner-title">{movieData.topMovie?.title}</h1>
                        <p className="top-banner-overview">{movieData.topMovie?.overview}</p>
                    </div>
                </div>
            )}

            <MovieSection title="인기 영화" movies={movieData.popularMovies} wish={wish} toggleWish={toggleWish}/>
            <MovieSection title="최신 영화" movies={movieData.latestMovies} wish={wish} toggleWish={toggleWish}/>
            <MovieSection title="액션 영화" movies={movieData.actionMovies} wish={wish} toggleWish={toggleWish}/>
            <MovieSection title="애니메이션 영화" movies={movieData.animationMovies} wish={wish} toggleWish={toggleWish}/>
        </div>
    );
};

const MovieSection = ({
                          title,
                          movies,
                          wish,
                          toggleWish,
                      }: {
    title: string;
    movies: Movie[];
    wish: Movie[]; // 찜한 영화 객체 배열
    toggleWish: (movie: Movie) => void; // 영화 객체 전달
}) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const [scrolling, setScrolling] = useState(false);
    const [isLeftHidden, setIsLeftHidden] = useState(true);
    const [isRightHidden, setIsRightHidden] = useState(false);

    const checkScrollPosition = () => {
        if (rowRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
            setIsLeftHidden(scrollLeft === 0);
            setIsRightHidden(scrollLeft + clientWidth >= scrollWidth);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            setScrolling(true);
            const scrollAmount = direction === 'left' ? -rowRef.current.clientWidth : rowRef.current.clientWidth;
            rowRef.current.scrollBy({ left: scrollAmount });
            setTimeout(() => {
                setScrolling(false);
                checkScrollPosition();
            }, 600);
        }
    };

    useEffect(() => {
        const currentRow = rowRef.current;
        if (currentRow) {
            currentRow.addEventListener('scroll', checkScrollPosition);
        }
        return () => {
            if (currentRow) {
                currentRow.removeEventListener('scroll', checkScrollPosition);
            }
        };
    }, []);

    return (
        <div className="movies-section">
            <h2>{title}</h2>
            <div className="movies-row-container">
                <div
                    className="scroll-button left"
                    onClick={() => scroll('left')}
                    style={{ visibility: isLeftHidden ? 'hidden' : 'visible' }}
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </div>
                <div className={`movies-row ${scrolling ? 'no-hover' : ''}`} ref={rowRef}>
                    {movies.map((movie, index) => (
                        <div key={`${movie.id}-${index}`} className="movie-card" onClick={() => toggleWish(movie)}>
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="movie-poster"
                            />
                            {wish.some((likedMovie) => likedMovie.id === movie.id) && (
                                <i className="fa-solid fa-thumbs-up movie-liked-icon" />
                            )}
                        </div>
                    ))}
                </div>
                <div
                    className="scroll-button right"
                    onClick={() => scroll('right')}
                    style={{ visibility: isRightHidden ? 'hidden' : 'visible' }}
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </div>
            </div>
        </div>
    );
};

export default Home;
