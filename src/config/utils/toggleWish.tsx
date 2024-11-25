// utils/wishUtils.ts
import {Movie} from "../interfaces"; // Movie 타입 경로에 맞게 수정

export const toggleWish = (
    movie: Movie,
    wish: Movie[],
    setWish: React.Dispatch<React.SetStateAction<Movie[]>>,
    userId: string
) => {
    const isMovieLiked = wish.some((likedMovie) => likedMovie.id === movie.id);
    const updatedWish = isMovieLiked
        ? wish.filter((likedMovie) => likedMovie.id !== movie.id) // 이미 찜한 경우 제거
        : [
            ...wish,
            {
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
                genre_ids: movie.genre_ids || [], // genres가 없으면 빈 배열로 처리
            },
        ]; // 새로 추가

    setWish(updatedWish); // 상태 업데이트
    localStorage.setItem(`${userId}_wish`, JSON.stringify(updatedWish)); // 로컬 스토리지에 저장
};
