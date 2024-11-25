export interface User {
    email: string;
    password: string;
}

export interface Movie {
    id: number;
    title: string;
    poster_path: string;
    genre_ids: number[];
}