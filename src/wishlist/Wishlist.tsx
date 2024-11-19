import React, { useState, useEffect } from "react";
import "./Wishlist.css";
import Navbar from "../config/Navbar";

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
}

interface HomeProps {
    onLogout: () => void;
}

const Wishlist: React.FC<HomeProps> = ({ onLogout }) => {
    const [username, setUsername] = useState<string>("");
    const [wishlistMovies, setWishlistMovies] = useState<Movie[]>([]); // 로컬에서 가져온 영화 저장
    const [currentPage, setCurrentPage] = useState<number>(1); // 현재 페이지
    const [moviesPerPage, setMoviesPerPage] = useState<number>(12); // 페이지당 영화 수

    useEffect(() => {
        const storedEmail = localStorage.getItem("userEmail");
        if (storedEmail) {
            setUsername(storedEmail); // 사용자 이메일 업데이트
            loadWishlistMovies(storedEmail); // 로컬 스토리지에서 영화 데이터 로드
        }

        // 화면 크기에 따라 한 페이지의 영화 개수 설정
        const updateMoviesPerPage = () => {
            const screenWidth = window.innerWidth;
            let cols = 6; // 기본 열 수

            if (screenWidth <= 1200) cols = 5;
            if (screenWidth <= 1000) cols = 4;
            if (screenWidth <= 800) {
                cols = 3; // 800px 이하일 때 3열
                setMoviesPerPage(cols * 3); // 3행 고정
            } else {
                setMoviesPerPage(cols * 2); // 기본 2행
            }
        };

        updateMoviesPerPage(); // 초기 설정
        window.addEventListener("resize", updateMoviesPerPage); // 화면 크기 변경 감지

        return () => {
            window.removeEventListener("resize", updateMoviesPerPage); // 이벤트 리스너 정리
        };
    }, []);

    // 로컬 스토리지에서 영화 데이터를 가져오기
    const loadWishlistMovies = (email: string) => {
        const storedWishlist = localStorage.getItem(`${email}_wish`);
        if (storedWishlist) {
            try {
                const movies: Movie[] = JSON.parse(storedWishlist);
                setWishlistMovies(movies); // 상태에 영화 데이터 저장
            } catch (error) {
                console.error("로컬 스토리지 데이터 파싱 오류:", error);
                setWishlistMovies([]); // 오류 발생 시 빈 목록으로 초기화
            }
        }
    };

    // 찜 목록에서 영화 삭제
    const removeFromWishlist = (movieId: number) => {
        const updatedWishlist = wishlistMovies.filter((movie) => movie.id !== movieId); // 상태에서 제거
        setWishlistMovies(updatedWishlist);

        // 로컬 스토리지 업데이트
        localStorage.setItem(`${username}_wish`, JSON.stringify(updatedWishlist));
    };

    // 현재 페이지의 영화 데이터 가져오기
    const indexOfLastMovie = currentPage * moviesPerPage;
    const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
    const currentMovies = wishlistMovies.slice(indexOfFirstMovie, indexOfLastMovie);

    // 페이지 변경 핸들러
    const handlePageChange = (direction: "prev" | "next") => {
        if (direction === "prev" && currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        } else if (direction === "next" && currentPage < Math.ceil(wishlistMovies.length / moviesPerPage)) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    return (
        <div>
            <Navbar username={username} onLogout={onLogout} />
            <div className="wishlist">
                {wishlistMovies.length > 0 ? (
                    <>
                        <div className="movies-container">
                            {currentMovies.map((movie) => (
                                <div key={movie.id} className="movie-card">
                                    {/* 좋아요 아이콘 추가 */}
                                    {wishlistMovies.some((m) => m.id === movie.id) && (
                                        <div className="like-icon">
                                            <i className="fa-solid fa-thumbs-up movie-liked-icon"></i>
                                        </div>
                                    )}
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="movie-poster"
                                        onClick={() => removeFromWishlist(movie.id)} // 포스터 클릭 시 삭제
                                    />
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
                                {currentPage} / {Math.ceil(wishlistMovies.length / moviesPerPage)}
                            </span>
                            <button
                                className="pagination-button"
                                onClick={() => handlePageChange("next")}
                                disabled={currentPage === Math.ceil(wishlistMovies.length / moviesPerPage)}
                            >
                                다음 &gt;
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty-message">찜한 영화가 없습니다</div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;