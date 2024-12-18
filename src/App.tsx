import {Route, Routes, Navigate, BrowserRouter} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // 기본 스타일
import SignIn from './components/signIn/SignIn';
import Home from './components/home/Home';
import Popular from './components/popular/Popular';
import Wishlist from './components/wishlist/Wishlist';
import React, { useEffect, useState } from 'react';
import './index.css'
import Navbar from './config/reusableComponents/Navbar'
import Search from "./components/search/Search";
import { validateApiKey } from './config/utils/validateApiKey';
import {User} from "./config/interfaces";

function App() {
    //세션에 저장된 정보로 인증
    const [sessionToken, setSessionToken] = useState(false);
    //saveLogin 체크 시 로컬 스토리지에 인증 정보 저장
    const [localToken, setLocalToken] = useState(false);
    const [username, setUsername] = useState<string>('Guest');
    const [key, setKey] = useState(0);

    useEffect(() => {
        const localEmail = localStorage.getItem('localUserEmail');
        const sessionEmail = sessionStorage.getItem('sessionUserEmail');

        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];

        if (localEmail) {
            setUsername(localEmail);
            setLocalToken(true);
            // email 동기화 안될까봐 각각 작성
            const foundUser = savedUsers.find(user => user.email === localEmail);
            if(!validateApiKey(foundUser?.password || "")){
                toast.error("API Key가 유효하지 않습니다.");
            }

        } else if (sessionEmail) {
            setUsername(sessionEmail);
            setSessionToken(true);
            const foundUser = savedUsers.find(user => user.email === localEmail);
            if(!validateApiKey(foundUser?.password || "")){
                toast.error("API Key가 유효하지 않습니다.");
            }
        }

    }, []);

    const handleLogout = () => {
        setSessionToken(false);
        setLocalToken(false);
        sessionStorage.removeItem('sessionUserEmail');
        localStorage.removeItem('localUserEmail'); // 저장된 이메일 삭제, 토큰 삭제와 같음
        setUsername('Guest');
        window.location.reload();
    };

    const handleLogin = (saveLogin: boolean) => {
        // 로그인 페이지에서 세션에 저장하므로 handleLogin 실행 시 세션에 이메일 저장되어있음.
        const tmp = sessionStorage.getItem('sessionUserEmail');
        if(tmp){
            setUsername(tmp);
            setSessionToken(true);

            if (saveLogin) {
                setLocalToken(true);
                localStorage.setItem('localUserEmail',tmp);
            }
        } else {
            console.error("Login Error");
            handleLogout();
        }
    };

    const forceRerender = () => {
        setKey((prevKey) => prevKey + 1);
    };

    return (
        <div>
            <BrowserRouter basename="/Maerchen">
                <Navbar username={username} onLogout={handleLogout} forceRerender={forceRerender}/>
                <Routes>
                    <Route
                        path="/"
                        element={
                            sessionToken || localToken ? (
                                <Home id={username} key={key}/>
                            ) : (
                                <Navigate to="/signin" replace/>
                            )
                        }
                    />
                    <Route
                        path="/popular"
                        element={
                            sessionToken || localToken ? (
                                <Popular id={username} key={key}/>
                            ) : (
                                <Navigate to="/signin" replace/>
                            )
                        }
                    />
                    <Route
                        path="/wishlist"
                        element={
                            sessionToken || localToken ? (
                                <Wishlist id={username} key={key}/>
                            ) : (
                                <Navigate to="/signin" replace/>
                            )
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            sessionToken || localToken ? (
                                <Search id={username} key={key}/>
                            ) : (
                                <Navigate to="/signin" replace/>
                            )
                        }
                    />
                    <Route
                        path="/signin"
                        element={
                            sessionToken || localToken ? (
                                <Navigate to="/" replace/>
                            ) : (
                                <SignIn onLogin={handleLogin}/>
                            )
                        }
                    />
                    <Route path="*" element={<Navigate to="/signin" replace/>}/>
                </Routes>
            </BrowserRouter>
            <ToastContainer className="toast-Container"
                            position="top-center" // 위치 설정
                            autoClose={1500}
                            hideProgressBar={true}
                            newestOnTop={true} // 최신 메시지를 위로
                            closeOnClick={true}
                            pauseOnHover={false}
                            theme = "dark"
            />
        </div>
    );
}

export default App;