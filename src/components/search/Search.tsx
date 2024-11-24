import React, {useState, useEffect} from 'react';
import {User, Movie} from "../../config/interfaces";
import {toggleWish} from "../../config/utils/toggleWish";
import './Search.css';
import debounce from "lodash/debounce";
import Loader from '../../config/reusableComponents/Loader';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronUp} from "@fortawesome/free-solid-svg-icons";

interface HomeProps {
    id: string;
}

const Search: React.FC<HomeProps> = ({id}) => {
    const getFormattedDate = (yearsAgo: number): string => {
        const today = new Date();
        today.setFullYear(today.getFullYear() - yearsAgo); // 현재 연도에서 10년 전으로 설정
        return today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    };

    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
    //options
    const [genres, setGenres] = useState<string>(""); //default 조건없음
    const [date, setDate] = useState<string>(getFormattedDate(0)); //default 현재
    const [vote, setVote] = useState<string>("0"); //default 평점 0
    const [language, setLanguage] = useState<string>(""); //default 제한없음

    //default 에서 reset 시에도 useEffect 호출을 위함
    const [reset, setReset] = useState<boolean>(false);

    const [noMoreMovies, setNoMoreMovies] = useState<boolean>(false); // 더 이상 영화가 안나옴
    const [isFetching, setIsFetching] = useState<boolean>(false); // 로딩 상태
    const [page, setPage] = useState(1); // API 요청할 page 값
    const [wish, setWish] = useState<Movie[]>([]); // 초기에는 빈 배열

    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const foundUser = savedUsers.find(user => user.email === id);
    const API_KEY = foundUser?.password;

    useEffect(() => {
        if (!API_KEY) {
            console.error("API Key is missing. Check your user data or localStorage.");
            return;
        }
        // 첫 페이지로딩, 경고없애기위해 코드 추가
        fetchMovies(1).then(() => {
            console.log("Initial movies loaded");
        });
        // eslint-disable-next-line
    }, [API_KEY]);

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

    // 무한 스크롤 이벤트 등록/해제
    useEffect(() => {
        window.addEventListener("scroll", debouncedHandleScroll);

        return () => {
            window.removeEventListener("scroll", debouncedHandleScroll); // 항상 이벤트 제거
        };
        // eslint-disable-next-line
    }, [ isFetching, page ]);

    useEffect(() => {
        setFilteredMovies([]);
        setNoMoreMovies(false);
        fetchMovies(1); // 새롭게 영화 불러오고 동시 page는 1로 초기화
        // eslint-disable-next-line
    }, [genres, date, vote, language, reset]);

    const handleToggleWish = (movie: Movie) => {
        toggleWish(movie, wish, setWish, id);
    };

    const handleScroll = async () => {
        const scrollPosition = window.innerHeight + window.scrollY; // 현재 스크롤 위치
        const documentHeight = document.body.scrollHeight; // 전체 문서 높이 (갱신 보장)

        if (
            Math.abs(scrollPosition - documentHeight) <= 5 && // 최하단인지 확인
            !isFetching && // 로딩 중이 아닐 때만
            filteredMovies.length > 0 // 초기 데이터가 로드된 상태에서만 실행
        ) {
            if(page<500)
                await fetchMovies(page + 1); // 다음 페이지 요청
        }
    };

    const debouncedHandleScroll = debounce(handleScroll, 200); // 200ms 디바운스

    const handleChange = (key: "genres" | "date" | "vote" | "language") =>
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            switch (key) {
                case "genres":
                    setGenres(e.target.value);
                    break;
                case "date":
                    setDate(e.target.value);
                    break;
                case "vote":
                    setVote(e.target.value);
                    break;
                case "language":
                    setLanguage(e.target.value);
                    break;
                default:
                    throw new Error(`Unknown key: ${key}`);
            }
        };

    const handleReset = () => {
        setGenres("");
        setDate(getFormattedDate(0));
        setVote("0");
        setLanguage("");
        setFilteredMovies([]);
        setNoMoreMovies(false);

        //비동기로 인한 에러 방지, useEffect 를 유도하여 fetchMovies 하도록 함 (default 에서 호출안되는걸 방지)
        setReset(!reset);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const fetchMovies = async (page: number) => {
        //useEffect 에서 noMoreMovies 를 false 로 전환 후 반영되지않는 오류 해결을 위해 추가
        //모든 옵션의 첫 페이지는 영화가 최소 한개는 있어서 문제없음
        if (page !== 1 && (!API_KEY || isFetching || noMoreMovies)) return;

        try {
            setIsFetching(true);

            const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=ko-KR&page=${page}
                                &with_genres=${genres}
                                &release_date.lte=${date}
                                &vote_average.gte=${vote}
                                &with_original_language=${language}`;
            const response = await fetch(url);
            const data: { results: Movie[] } = await response.json(); // 결과 타입 명시

            if (data.results && data.results.length > 0) {
                setFilteredMovies((prevMovies) => [
                    ...prevMovies,
                    ...data.results.filter(
                        (movie: Movie) => !prevMovies.some((prevMovie) => prevMovie.id === movie.id)
                    ),
                ]);
                setPage(page);
            }else if(data.results.length === 0){
                setNoMoreMovies(true);
            }

        } catch (error) {
            console.error("Error fetching movies:", error);
        } finally {
            setIsFetching(false);
        }
    };

    return(
        <div>
            {isFetching && <Loader/>}
            <div className="Search">

                <div className="filter-container">
                    {/* 장르 선택 */}
                    <div>
                        {/* 장르 선택 */}
                        <select value={genres} onChange={handleChange("genres")}>
                            <option value="">장르</option>
                            <option value="28">액션</option>
                            <option value="16">애니메이션</option>
                            <option value="35">코미디</option>
                            <option value="99">다큐멘터리</option>
                            <option value="27">공포</option>
                            <option value="53">스릴러</option>
                        </select>
                    </div>

                    <div>
                        {/* 출시일 선택 */}
                        <select value={date} onChange={handleChange("date")}>
                            <option value={getFormattedDate(0)}>개봉일</option>
                            <option value={getFormattedDate(3)}>3년 이전</option>
                            <option value={getFormattedDate(5)}>5년 이전</option>
                            <option value={getFormattedDate(10)}>10년 이전</option>
                            <option value={getFormattedDate(20)}>20년 이전</option>
                        </select>
                    </div>

                    <div>
                        {/* 평점 선택 */}
                        <select value={vote} onChange={handleChange("vote")}>
                            <option value="">평점</option>
                            <option value="3">3점 이상</option>
                            <option value="5">5점 이상</option>
                            <option value="7">7점 이상</option>
                            <option value="9">9점 이상</option>
                        </select>
                    </div>

                    <div>
                        {/* 언어 선택 */}
                        <select value={language} onChange={handleChange("language")}>
                            <option value="">언어</option>
                            <option value="en">영어</option>
                            <option value="ko">한국어</option>
                            <option value="ja">일본어</option>
                        </select>
                    </div>
                </div>

                <div>
                    {/* 초기화 버튼 */}
                    <button className="reset-button" onClick={handleReset}>
                        <i className="fa-solid fa-rotate-right"></i>
                    </button>
                    <div className="top-button" onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}>
                        <FontAwesomeIcon icon={faChevronUp}/>
                    </div>
                </div>

                <div className="movies-container">
                    {filteredMovies.map((movie, index) => (
                        <div key={`${movie.id}-${index}`} className="movie-card"
                             onClick={() => handleToggleWish(movie)}>
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
            </div>
        </div>
    );
};

export default Search;