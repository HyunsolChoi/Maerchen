import React, { useState, useEffect } from 'react';
import './Popular.css';
import Navbar from "../config/Navbar";
import {User, Movie} from "../config/interfaces";

interface HomeProps {
    onLogout: () => void;
    id: string;
}

const Popular: React.FC<HomeProps> = ({ onLogout, id }) => {
    const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1); // 현재 페이지
    const [moviesPerPage, setMoviesPerPage] = useState<number>(12); // 페이지당 영화 수

    // 찜 목록 상태 (wish)
    const [wish, setWish] = useState<Movie[]>([]); // 초기에는 빈 배열

    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const foundUser = savedUsers.find(user => user.email === id);
    const API_KEY = foundUser?.password;

    // username 설정 후 wish 상태 동기화
    useEffect(() => {
        // 화면 크기에 따라 한 페이지의 영화 개수 설정
        const updateMoviesPerPage = () => {
            const screenWidth = window.innerWidth;
            let cols = 6; // 기본 열 수

            if (screenWidth <= 1200) cols = 5;
            if (screenWidth <= 1000) cols = 4;

            if(screenWidth <= 520) {
                cols = 2;
                setMoviesPerPage(cols *2);
            }
            else if (screenWidth <= 800) {
                cols = 3; // 800px 이하일 때 3열
                setMoviesPerPage(cols * 3); // 3행 고정
            }
            else {
                setMoviesPerPage(cols * 2); // 기본 2행
            }

            setCurrentPage(1);
        };

        updateMoviesPerPage(); // 초기 설정
        window.addEventListener("resize", updateMoviesPerPage); // 화면 크기 변경 감지

        return () => {
            window.removeEventListener("resize", updateMoviesPerPage); // 이벤트 리스너 정리
        };
    }, []);

    useEffect(() => {
        if (id) {
            const storedWish = localStorage.getItem(`${id}_wish`);
            try {
                setWish(storedWish ? JSON.parse(storedWish) : []); // wish 동기화
            } catch {
                setWish([]); // 파싱 실패 시 빈 배열
            }
        }
    }, [id]);

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

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const requests = [];
                for (let page = 1; page <= 6; page++) {
                    requests.push(
                        fetchMoviesByCategory(
                            `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ko-KR&page=${page}`
                        )
                    );
                }
                const results = await Promise.all(requests);
                const movies = results.flat(); // 각 페이지 결과를 합침
                setPopularMovies(movies); // 인기 영화 상태 업데이트
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };

        fetchMovies();
    }, [API_KEY]);

    const fetchMoviesByCategory = async (url: string): Promise<Movie[]> => {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    };

    const indexOfLastMovie = currentPage * moviesPerPage;
    const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
    const currentMovies = popularMovies.slice(indexOfFirstMovie, indexOfLastMovie);

    const handlePageChange = (direction: "prev" | "next") => {
        if (direction === "prev" && currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        } else if (direction === "next" && currentPage < Math.ceil(popularMovies.length / moviesPerPage)) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    return (
        <div>
            <Navbar username={id} onLogout={onLogout}/>
            <div className="popular">
                <div className="movies-container">
                    {currentMovies.map((movie, index) => (
                        <div key={`${movie.id}-${index}`} className="movie-card" onClick={() => toggleWish(movie)}>
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="movie-poster"
                            />
                            {wish.some((likedMovie) => likedMovie.id === movie.id) && (
                                <i className="fa-solid fa-thumbs-up movie-liked-icon" />
                            )}
                            <h3 className="movie-title">{movie.title}</h3>
                        </div>
                    ))}
                </div>
                <div className="pagination">
                    <button
                        className="pagination-button"
                        onClick={() => handlePageChange("prev")}
                        disabled={currentPage === 1}
                    >
                        &lt; 이전
                    </button>
                    <span className="pagination-info">
                        {currentPage} / {Math.ceil(popularMovies.length / moviesPerPage)}
                    </span>
                    <button
                        className="pagination-button"
                        onClick={() => handlePageChange("next")}
                        disabled={currentPage === Math.ceil(popularMovies.length / moviesPerPage)}
                    >
                        다음 &gt;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popular;
