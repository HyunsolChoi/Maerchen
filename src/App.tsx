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
    const [kakaoToken, setKakaoToken] = useState(false);
    //saveLogin 체크 시 로컬 스토리지에 인증 정보 저장
    const [localToken, setLocalToken] = useState(false);
    const [username, setUsername] = useState<string>('Guest');
    const [key, setKey] = useState(0);

    useEffect(() => {
        const localEmail = localStorage.getItem('localUserEmail');
        const sessionEmail = sessionStorage.getItem('sessionUserEmail');
        const isKakaoLogin = sessionStorage.getItem('isKakaoLogin');

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
        } else if(isKakaoLogin){
            setKakaoToken(true);
            // 카카오 로그인 관련 코드
            checkAccessTokenValidity();
        }
    }, []);

    const checkAccessTokenValidity = async () => {
        const token = sessionStorage.getItem('kakaoAccessToken');
        if (!token) {
            toast.error('Access Token이 없습니다.');
            return false;
        }

        try {
            const response = await fetch('https://kapi.kakao.com/v1/user/access_token_info', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`, // Access Token 추가
                },
            });

            if (response.ok) {
                return true; // 유효한 토큰
            } else {
                toast.error('Access Token이 유효하지 않습니다.');
                handleLogout();
                return false; // 유효하지 않은 토큰
            }
        } catch (error) {
            toast.error('Access Token 유효성 확인 중 오류 발생');
            return false;
        }
    };


    const handleLogout = () => {
        setSessionToken(false);
        setLocalToken(false);
        setKakaoToken(false);
        if(kakaoToken){
            sessionStorage.removeItem('kakaoAccessToken');
            sessionStorage.removeItem('kakaoPK');
            sessionStorage.removeItem('kakaoName');
            const kakaoPK =  sessionStorage.getItem('kakaoPK');
            sessionStorage.removeItem('kakaoPK');

            // 카카오 유저의 계정 로컬에서 삭제 ( 필터링 후 재저장 )
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const updatedUsers = users.filter((user: User) => user.email !== kakaoPK);
            localStorage.setItem('users', JSON.stringify(updatedUsers));

            window.Kakao.Auth.logout();
        }
        sessionStorage.removeItem('isKakaoLogin');
        sessionStorage.removeItem('sessionUserEmail');
        localStorage.removeItem('localUserEmail'); // 저장된 이메일 삭제, 토큰 삭제와 같음
        setUsername('Guest');
        window.location.reload();
    };

    const handleKakaoLogin = () => {
        const kakaoPK = sessionStorage.getItem('kakaoPK'); // 유저 이름 + 유저 프사
        if(kakaoPK){
            setUsername(kakaoPK);
            setKakaoToken(true);
        }
    }

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
                            sessionToken || localToken || kakaoToken ? (
                                <Home id={username} key={key}/>
                            ) : (
                                <Navigate to="/signin" replace/>
                            )
                        }
                    />
                    <Route
                        path="/popular"
                        element={
                            sessionToken || localToken || kakaoToken ? (
                                <Popular id={username} key={key}/>
                            ) : (
                                <Navigate to="/signin" replace/>
                            )
                        }
                    />
                    <Route
                        path="/wishlist"
                        element={
                            sessionToken || localToken || kakaoToken ? (
                                <Wishlist id={username} key={key}/>
                            ) : (
                                <Navigate to="/signin" replace/>
                            )
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            sessionToken || localToken || kakaoToken ? (
                                <Search id={username} key={key}/>
                            ) : (
                                <Navigate to="/signin" replace/>
                            )
                        }
                    />
                    <Route
                        path="/signin"
                        element={
                            sessionToken || localToken || kakaoToken ? (
                                <Navigate to="/" replace/>
                            ) : (
                                <SignIn onLogin={handleLogin} onKakaoLogin={handleKakaoLogin} />
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