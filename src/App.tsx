import { Route, Routes, Navigate, HashRouter } from 'react-router-dom';
import SignIn from './signIn/SignIn';
import Home from './home/Home';
import Popular from './popular/Popular';
import Wishlist from './wishlist/Wishlist';
import { useEffect, useState } from 'react';
import './index.css'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);

    useEffect(() => {
        const detectOrientationAndDevice = () => {
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
        };
    }, []);

    const handleLogin = (saveLogin: boolean) => {
        setIsAuthenticated(true);
        if (saveLogin) {
            localStorage.setItem('isAuthenticated', 'true');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail'); // 저장된 이메일 삭제
        localStorage.removeItem('tmdbApiKey'); // 저장 비밀번호 삭제
        window.location.reload();
    };

    return (
        <div>
            {isLandscape ? (
                <div className="landscape-warning">
                    모바일에서는 세로 모드로만 사용 가능합니다.
                </div>
            ) : (
                <HashRouter>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                isAuthenticated ? (
                                    <Home onLogout={handleLogout}/>
                                ) : (
                                    <Navigate to="/signin" replace />
                                )
                            }
                        />
                        <Route
                            path="/popular"
                            element={
                                isAuthenticated ? (
                                    <Popular onLogout={handleLogout}/>
                                ) : (
                                    <Navigate to="/signin" replace />
                                )
                            }
                        />
                        <Route
                            path="/wishlist"
                            element={
                                isAuthenticated ? (
                                    <Wishlist onLogout={handleLogout}/>
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
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </HashRouter>
            )}
        </div>

    );
}

export default App;