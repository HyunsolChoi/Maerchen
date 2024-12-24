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
    const [iskakaoToken, setIsKakaoToken] = useState(false);
    //saveLogin 체크 시 로컬 스토리지에 인증 정보 저장
    const [localToken, setLocalToken] = useState(false);
    const [username, setUsername] = useState<string>('Guest');
    const [key, setKey] = useState(0);

    useEffect(() => {
        const initializeUser = async () => {
            const localEmail = localStorage.getItem('localUserEmail');
            const sessionEmail = sessionStorage.getItem('sessionUserEmail');
            const isKakaoLogin = sessionStorage.getItem('kakaoAccessToken');

            const savedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];

            if (localEmail) {
                setUsername(localEmail);
                setLocalToken(true);
                // email 동기화 안될까봐 각각 작성
                const foundUser = savedUsers.find(user => user.email === localEmail);
                if (! await validateApiKey(foundUser?.password || "")) {
                    toast.error("API Key가 유효하지 않습니다.");
                }
            } else if (sessionEmail) {
                setUsername(sessionEmail);
                setSessionToken(true);
                const foundUser = savedUsers.find(user => user.email === sessionEmail);
                if (! await validateApiKey(foundUser?.password || "")) {
                    toast.error("API Key가 유효하지 않습니다.");
                }

                // 카카오 로그인 처리
                if(isKakaoLogin){
                    if (await checkAccessTokenValidity()) {
                        setIsKakaoToken(true);
                        setSessionToken(false);

                        if (!savedUsers.find(user => user.email === sessionEmail)) {
                            toast.error("카카오 사용자 로그인 오류");
                            handleLogout();
                        }
                    }
                }
            }
        };

        initializeUser(); // 비동기 함수 호출
        // eslint-disable-next-line
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

    const handleLogout = async () => {
        setSessionToken(false);
        setLocalToken(false);

        // 직접 Access Token 가져오기, 동기화 위해서 직접 가져옴.
        const token = sessionStorage.getItem('kakaoAccessToken');

        if(token){
            try {
                const response = await fetch('https://kapi.kakao.com/v1/user/logout', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok){
                    toast.error('Access Token 만료 실패' + response.status);
                } else{
                    console.log("만료 성공!");
                }
            } catch (error) {
                console.error('Access Token 만료 중 오류 발생', error);
            }

            sessionStorage.removeItem('kakaoAccessToken');
            sessionStorage.removeItem('kakaoName');
            sessionStorage.removeItem('kakaoProfile');
            setIsKakaoToken(false);
        } else{
            localStorage.removeItem('localUserEmail'); // 저장된 이메일 삭제, 토큰 삭제와 같음
        }
        sessionStorage.removeItem('sessionUserEmail'); // 카카오 로그인 시에도 여기에 값 저장
        setUsername('Guest');
    };

    // 카카오 로그인 핸들러
    const handleKakaoLogin = (kakaoUser: string, kakaoProfile: string) => {
        const tmp = sessionStorage.getItem('sessionUserEmail');
        sessionStorage.setItem('kakaoName', kakaoUser);
        sessionStorage.setItem('kakaoProfile', kakaoProfile);
        setIsKakaoToken(true);

        if(tmp){
            setUsername(tmp);
        } else {
            toast.error("세션 스토리지 데이터 참조 실패 오류");
            handleLogout();
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
            toast.error("세션 스토리지 데이터 참조 실패 오류");
            handleLogout();
        }
    };

    const forceRerender = () => {
        setKey((prevKey) => prevKey + 1);
    };

    return (
        <div>
            <BrowserRouter basename="/Maerchen">
                <Navbar username={username} onLogout={handleLogout} forceRerender={forceRerender} isKakao={iskakaoToken} key={key}/>
                <Routes>
                    <Route
                        path="/"
                        element={
                            sessionToken || localToken || iskakaoToken ? (
                                <Home id={username} key={key}/>
                            ) : (
                                <Navigate to="/signin" replace/>
                            )
                        }
                    />
                    <Route
                        path="/popular"
                        element={
                            sessionToken || localToken || iskakaoToken ? (
                                <Popular id={username} key={key}/>
                            ) : (
                                <Navigate to="/signin" replace/>
                            )
                        }
                    />
                    <Route
                        path="/wishlist"
                        element={
                            sessionToken || localToken || iskakaoToken ? (
                                <Wishlist id={username} key={key}/>
                            ) : (
                                <Navigate to="/signin" replace/>
                            )
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            sessionToken || localToken || iskakaoToken ? (
                                <Search id={username} key={key}/>
                            ) : (
                                <Navigate to="/signin" replace/>
                            )
                        }
                    />
                    <Route
                        path="/signin"
                        element={
                            sessionToken || localToken || iskakaoToken ? (
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