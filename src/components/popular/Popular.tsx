import React, {useState, useEffect, useRef} from 'react';
import './Popular.css';
import '../../config/views/infiniteView.css'
import '../../config/views/tableView.css'
import {User, Movie} from "../../config/interfaces";
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {toggleWish} from "../../config/utils/toggleWish";
import debounce from "lodash/debounce";
import Loader from "../../config/reusableComponents/Loader";

interface HomeProps {
    id: string;
}

const Popular: React.FC<HomeProps> = ({id}) => {
    const [tableViewMovies, setTableViewMovies] = useState<Movie[]>([]); // Table View Movies
    const [popularMovies, setPopularMovies] = useState<Movie[]>([]); // 모든 영화 리스트

    const [currentPage, setCurrentPage] = useState<number>(1); // 현재 페이지
    const [moviesPerPage, setMoviesPerPage] = useState<number>(12); // 페이지당 영화 수
    const [viewMode, setViewMode] = useState<"table" | "infinite">("table"); // Table View / Infinite Scroll 상태
    const [isFetching, setIsFetching] = useState<boolean>(false); // 로딩 상태 (무한 스크롤)
    const [noMoreMovies, setNoMoreMovies] = useState<boolean>(false); // 더 이상 영화가 안나옴

    const previousWidth = useRef<number>(window.innerWidth);

    // 찜 목록 상태 (wish)
    const [wish, setWish] = useState<Movie[]>([]); // 초기에는 빈 배열

    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const foundUser = savedUsers.find(user => user.email === id);
    const API_KEY = foundUser?.password;

    //현재 viewMode 값 추적
    const viewModeRef = useRef(viewMode);

    useEffect(() => {
        const loadInitialMovies = async () => {
            if (viewMode === "infinite") {
                await fetchMovies(1); // 첫 페이지만 요청
            }
        };
        viewModeRef.current = viewMode; // 최신 상태 값 추적

        if (viewMode === "table") {
            updateMoviesPerPage();
            setCurrentPage(1);
        } else if (viewMode === "infinite") {
            setPopularMovies([]); // 이전 데이터를 초기화
            setCurrentPage(1); // 페이지를 1로 초기화
            loadInitialMovies();
        }
        // eslint-disable-next-line
    }, [viewMode]);

    // 무한 스크롤 이벤트 등록/해제
    useEffect(() => {
        if (viewMode === "infinite") {
            window.addEventListener("scroll", debouncedHandleScroll);
        } else {
            window.removeEventListener("scroll", debouncedHandleScroll);
        }

        return () => {
            window.removeEventListener("scroll", debouncedHandleScroll); // 항상 이벤트 제거
        };
        // eslint-disable-next-line
    }, [viewMode, isFetching, currentPage]);

    useEffect(() => {
        updateMoviesPerPage();
        window.addEventListener("resize", updateMoviesPerPage); // 화면 크기 변경 감지

        return () => {
            window.removeEventListener("resize", updateMoviesPerPage); // 이벤트 리스너 정리
        };
    }, []);

    useEffect(() => {
        updateMoviesPerPage(); // 초기 설정

        if (id) {
            const storedWish = localStorage.getItem(`${id}_wish`);
            try {
                setWish(storedWish ? JSON.parse(storedWish) : []); // wish 동기화
            } catch {
                setWish([]); // 파싱 실패 시 빈 배열
            }
        }
    }, [id]);

    const handleScroll = async () => {
        const scrollPosition = window.innerHeight + window.scrollY; // 현재 스크롤 위치
        const documentHeight = document.body.scrollHeight; // 전체 문서 높이 (갱신 보장)

        if (
            Math.abs(scrollPosition - documentHeight) <= 5 && // 최하단인지 확인
            !isFetching && // 로딩 중이 아닐 때만
            popularMovies.length > 0 // 초기 데이터가 로드된 상태에서만 실행
        ) {
            if(currentPage<500)
                await fetchMovies(currentPage + 1); // 다음 페이지 요청
        }
    };

    const debouncedHandleScroll = debounce(handleScroll, 200); // 200ms 디바운스

    const fetchMovies = async (page: number) => {
        if (!API_KEY || isFetching || noMoreMovies) return;

        try {
            setIsFetching(true);
            const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ko-KR&page=${page}`;
            const response = await fetch(url);
            const data: { results: Movie[] } = await response.json(); // 결과 타입 명시

            if (data.results && data.results.length > 0) {
                setPopularMovies((prevMovies) => [
                    ...prevMovies,
                    ...data.results.filter(
                        (movie: Movie) => !prevMovies.some((prevMovie) => prevMovie.id === movie.id) // 매개변수 타입 명시
                    ),
                ]);
                setCurrentPage(page);
            } else if(data.results.length === 0){
                setNoMoreMovies(true);
            }

        } catch (error) {
            console.error("Error fetching movies:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const updateMoviesPerPage = () => {
        const currentWidth = window.innerWidth;

        const breakpoints = [480, 768, 1000, 1200];
        if (
            breakpoints.some(
                (bp) =>
                    (previousWidth.current < bp && currentWidth >= bp) ||
                    (previousWidth.current >= bp && currentWidth < bp) ||
                    currentWidth === bp
            )
        ) {
            if (viewModeRef.current === "table") {
                setCurrentPage(1); // 테이블 뷰일 때만 currentPage 초기화
            }
        }

        let cols = 6; // 기본 열 수

        if (currentWidth <= 480) {
            cols = 3;
            setMoviesPerPage(cols * 4);
        } else if (currentWidth <= 768) {
            cols = 4;
            setMoviesPerPage(cols * 4);
        } else if (currentWidth <= 1000) {
            cols = 4;
            setMoviesPerPage(cols * 3);
        } else if (currentWidth <= 1200) {
            cols = 5;
            setMoviesPerPage(cols * 2);
        } else {
            cols = 6;
            setMoviesPerPage(cols * 2);
        }
        previousWidth.current = currentWidth;
    };

    useEffect(() => {
        if (API_KEY) {
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
                    setTableViewMovies(movies); // 인기 영화 상태 업데이트
                } catch (error) {
                    console.error('Error fetching movies:', error);
                }
            };
            fetchMovies().then(() => {
                console.log("Initial movies loaded");
            });

        }
    }, [API_KEY]);

    const handleToggleWish = (movie: Movie) => {
        toggleWish(movie, wish, setWish, id);
    };

    const fetchMoviesByCategory = async (url: string): Promise<Movie[]> => {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    };

    const indexOfLastMovie = currentPage * moviesPerPage;
    const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
    const currentMovies = tableViewMovies.slice(indexOfFirstMovie, indexOfLastMovie);

    const handlePageChange = (direction: "prev" | "next") => {
        if (direction === "prev" && currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        } else if (direction === "next" && currentPage < Math.ceil(tableViewMovies.length / moviesPerPage)) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    return (
        <div>
            {isFetching && <Loader />}
            <div className="view-switcher">
                <button
                    className={`view-button ${viewMode === "table" ? "active" : ""}`}
                    onClick={() => {
                        window.scrollTo({top: 0, behavior: "smooth"});
                        setViewMode("table");
                    }}
                >
                    <i className="fa-solid fa-table-cells-large"></i>
                </button>
                <button
                    className={`view-button ${viewMode === "infinite" ? "active" : ""}`}
                    onClick={() => {
                        window.scrollTo({top: 0, behavior: "smooth"});
                        setViewMode("infinite");
                    }}
                >
                    <i className="fa-solid fa-scroll"></i>
                </button>
            </div>
            <div className="popular">
                    {viewMode === "table" ? (
                        <div className="table-movies-container">
                            {currentMovies.map((movie, index) => (
                                <div key={`${movie.id}-${index}`} className="table-movie-card" onClick={() => handleToggleWish(movie)}>
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="table-movie-poster"
                                    />
                                    {wish.some((likedMovie) => likedMovie.id === movie.id) && (
                                        <i className="fa-solid fa-thumbs-up table-movie-liked-icon"/>
                                    )}
                                    <h3 className="table-movie-title">{movie.title}</h3>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="movies-container">
                            {popularMovies.map((movie, index) => (
                                <div key={`${movie.id}-${index}`} className="movie-card" onClick={() => handleToggleWish(movie)}>
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="movie-poster"
                                    />
                                    {wish.some((likedMovie) => likedMovie.id === movie.id) && (
                                        <i className="fa-solid fa-thumbs-up movie-liked-icon"/>
                                    )}
                                    <h3 className="movie-title">{movie.title}</h3>
                                </div>
                            ))}
                        </div>
                    )}
                {viewMode === "infinite" && (
                    <div className="top-button" onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}>
                        <FontAwesomeIcon icon={faChevronUp} />
                    </div>
                )}

                {viewMode === "table" && (
                    <div className="pagination">
                        <button
                            className="pagination-button"
                            onClick={() => handlePageChange("prev")}
                            disabled={currentPage === 1}
                        >
                            &lt; 이전
                        </button>
                        <span className="pagination-info">
                            {currentPage} / {Math.ceil(tableViewMovies.length / moviesPerPage)}
                        </span>
                        <button
                            className="pagination-button"
                            onClick={() => handlePageChange("next")}
                            disabled={currentPage === Math.ceil(tableViewMovies.length / moviesPerPage)}
                        >
                            다음 &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Popular;