import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClapperboard, faChevronLeft, faChevronRight, faUser } from '@fortawesome/free-solid-svg-icons';
import './Home.css';
import { useNavigate, useLocation } from 'react-router-dom';

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    overview: string;
}
interface Movie {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path: string; // backdrop 이미지 경로 추가
    overview: string;
}
interface HomeProps {
    onLogoClick: () => void;
}

const Home: React.FC<HomeProps> = ({ onLogoClick }) => {
    const [topMovie, setTopMovie] = useState<Movie | null>(null);
    const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
    const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
    const [actionMovies, setActionMovies] = useState<Movie[]>([]);
    const [animationMovies, setAnimationMovies] = useState<Movie[]>([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [username, setUsername] = useState<string>('');

    const apiKey = localStorage.getItem('tmdbApiKey');

    const handleLogoClick = () => {
        onLogoClick(); // 로고 클릭 상태 업데이트
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail'); // 저장된 이메일 삭제
        window.location.reload();
    };

    const toggleMenu = () => {
        setMenuVisible((prev) => !prev);
    };

    useEffect(() => {
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
            setUsername(storedEmail); // 이메일 상태 업데이트
        }
        const fetchMovies = async () => {
            try {
                const top = await fetchMoviesByCategory(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ko-KR`);
                if (top.length > 0) {
                    setTopMovie(top[0]);
                }

                const popular = await fetchMoviesByCategory(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ko-KR`);
                setPopularMovies(popular.slice(0, 20));

                const latest = await fetchMoviesByCategory(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=ko-KR`);
                setLatestMovies(latest.slice(0, 20));

                const action = await fetchMoviesByCategory(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=28&language=ko-KR`);
                setActionMovies(action.slice(0, 20));

                const animation = await fetchMoviesByCategory(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=16&language=ko-KR`);
                setAnimationMovies(animation.slice(0, 20));
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        };

        fetchMovies();
    }, [apiKey]);

    const fetchMoviesByCategory = async (url: string): Promise<Movie[]> => {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    };

    return (
        <div className="home">
            <nav className="navbar">
                <FontAwesomeIcon
                    icon={faClapperboard}
                    className="navbar-logo"
                    onClick={handleLogoClick} // 핸들러 적용
                />
                <ul className="navbar-menu">
                    <li className="navbar-item" onClick={handleLogoClick}>홈</li>
                    <li className="navbar-item">대세 콘텐츠</li>
                    <li className="navbar-item">찾아보기</li>
                    <li className="navbar-item">찜</li>
                </ul>
                <div
                    className="user-icon"
                    onMouseEnter={toggleMenu}
                    onMouseLeave={toggleMenu}
                >
                    <FontAwesomeIcon icon={faUser}/>
                    {menuVisible && (
                        <div className="dropdown-menu">
                            <p className="dropdown-item">{username}</p>
                            <p className="dropdown-item" onClick={handleLogout}>
                                로그아웃
                            </p>
                        </div>
                    )}
                </div>
            </nav>
            {topMovie && (
                <div
                    className="top-banner"
                    style={{
                        backgroundImage: `url(https://image.tmdb.org/t/p/original${topMovie.backdrop_path})`,
                    }}
                >
                    <div className="top-banner-content">
                        <h1 className="top-banner-title">{topMovie.title}</h1>
                        <p className="top-banner-overview">{topMovie.overview}</p>
                    </div>
                </div>
            )}

            <MovieSection title="인기 영화" movies={popularMovies} />
            <MovieSection title="최신 영화" movies={latestMovies} />
            <MovieSection title="액션 영화" movies={actionMovies} />
            <MovieSection title="애니메이션 영화" movies={animationMovies} />
        </div>
    );
};

const MovieSection = ({ title, movies }: { title: string; movies: Movie[] }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const [scrolling, setScrolling] = useState(false);
    const [isLeftHidden, setIsLeftHidden] = useState(true); // 초기: 좌 버튼 숨김
    const [isRightHidden, setIsRightHidden] = useState(false); // 초기: 우 버튼 보임

    const checkScrollPosition = () => {
        if (rowRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
            const roundedScrollLeft = Math.ceil(scrollLeft);
            const roundedClientWidth = Math.floor(clientWidth);
            const roundedScrollWidth = Math.floor(scrollWidth);

            setIsLeftHidden(roundedScrollLeft === 0); // 스크롤이 가장 왼쪽인지 확인
            setIsRightHidden(roundedScrollLeft + roundedClientWidth >= roundedScrollWidth); // 스크롤이 가장 오른쪽인지 확인
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {

            // 스크롤 시작 시 호버 비활성화
            setScrolling(true);
            const scrollAmount = direction === 'left' ? -rowRef.current.clientWidth : rowRef.current.clientWidth;

            rowRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });

            // 스크롤이 완료된 후 호버 활성화
            setTimeout(() => {
                setScrolling(false);
                checkScrollPosition(); // 위치 확인 후 버튼 상태 업데이트
            }, 600); // 스크롤 완료까지 대기 시간 설정 (필요에 따라 조정 가능)
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
                    style={{visibility: isLeftHidden ? 'hidden' : 'visible'}}>
                    <FontAwesomeIcon icon={faChevronLeft}/>
                </div>
                <div className={`movies-row ${scrolling ? 'no-hover' : ''}`} ref={rowRef}>
                    {movies.map((movie) => (
                        <div key={movie.id} className="movie-card">
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="movie-poster"
                            />
                        </div>
                    ))}
                </div>
                <div
                    className="scroll-button right"
                    onClick={() => scroll('right')}
                    style={{visibility: isRightHidden ? 'hidden' : 'visible'}}
                >
                    <FontAwesomeIcon icon={faChevronRight}/>
                </div>
            </div>
        </div>

    );
};

export default Home;
