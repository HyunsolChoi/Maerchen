import React, { useState, useEffect } from 'react';
import './Popular.css';
import Navbar from "../config/Navbar";


interface HomeProps {
    onLogout: () => void;
}

const Popular: React.FC<HomeProps> = ({ onLogout }) => {

    const [username, setUsername] = useState<string>('');

    const apiKey = localStorage.getItem('tmdbApiKey');

    useEffect(() => {
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
            setUsername(storedEmail); // 이메일 상태 업데이트
        }

    }, [apiKey]);

   /* const fetchMoviesByCategory = async (url: string): Promise<Movie[]> => {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    };*/
    //please

    return (
        <div className="home">
            <Navbar username={username} onLogout={onLogout}/>
        </div>
    );

};
export default Popular;