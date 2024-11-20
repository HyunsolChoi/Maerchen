import {Route, Routes, Navigate, HashRouter} from 'react-router-dom';
import SignIn from './signIn/SignIn';
import Home from './home/Home';
import Popular from './popular/Popular';
import Wishlist from './wishlist/Wishlist';
import { useEffect, useState } from 'react';
import './index.css'

function App() {
    //세션에 저장된 정보로 인증
    const [sessionToken, setSessionToken] = useState(false);
    //saveLogin 체크 시 로컬 스토리지에 인증 정보 저장
    const [isSaveLogin, setIsSaveLogin] = useState(false);
    //const [isLandscape, setIsLandscape] = useState(false);
    const [username, setUsername] = useState<string>('Guest');

    const isAuthenticated = sessionToken || isSaveLogin;

    useEffect(() => {
        const localEmail = localStorage.getItem('localUserEmail');
        const sessionEmail = sessionStorage.getItem('sessionUserEmail');

        if (localEmail) {
            setUsername(localEmail);
            setIsSaveLogin(true);
        } else if (sessionEmail) {
            setUsername(sessionEmail);
            setSessionToken(true);
        }

        //모바일 가로 화면에서 비활성화시킴
        /*const detectOrientationAndDevice = () => {
            const isLandscapeMode = window.innerWidth > window.innerHeight;
            const isMobileDevice =
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent
                );

            setIsLandscape(isLandscapeMode && isMobileDevice);
        };

        detectOrientationAndDevice(); // 초기 실행
        window.addEventListener("resize", detectOrientationAndDevice);

        return () => {
            window.removeEventListener("resize", detectOrientationAndDevice);
        };*/
    }, []);

    const handleLogin = (saveLogin: boolean) => {
        //signin에서 세션에 저장하므로 handleLogin 실행 시 세션에 이메일 저장되어있음.
        setSessionToken(true);
        if (saveLogin) {
            setIsSaveLogin(true);
            localStorage.setItem('localUserEmail',username);
        }
    };

    const handleLogout = () => {
        setSessionToken(false);
        sessionStorage.removeItem('sessionUserEmail');
        localStorage.removeItem('localUserEmail'); // 저장된 이메일 삭제, 토큰 삭제와 같음
        window.location.replace('/#/signin');
    };

    return (
        <div>
           {/* {isLandscape ? (
                <div className="landscape-warning">
                    모바일에서는 세로 모드로만 사용 가능합니다.
                </div>
            ) : (*/}
                <HashRouter>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                isAuthenticated ? (
                                    <Home onLogout={handleLogout} id={username}/>
                            ) : (
                                    <Navigate to="/signin" replace />
                                )
                            }
                        />
                        <Route
                            path="/popular"
                            element={
                                isAuthenticated ? (
                                    <Popular onLogout={handleLogout} id={username}/>
                            ) : (
                                    <Navigate to="/signin" replace />
                                )
                            }
                        />
                        <Route
                            path="/wishlist"
                            element={
                                isAuthenticated ? (
                                    <Wishlist onLogout={handleLogout} id={username}/>
                            ) : (
                                    <Navigate to="/signin" replace />
                                )
                            }
                        />
                        <Route
                            path="/signin"
                            element={
                                isAuthenticated ? (
                                    <Navigate to="/" replace />
                                ) : (
                                    <SignIn onLogin={handleLogin} />
                                )
                            }
                        />
                        <Route path="*" element={<Navigate to="/signin" replace />} />
                    </Routes>
                </HashRouter>
           {/* )}*/}
        </div>

    );
}

export default App;