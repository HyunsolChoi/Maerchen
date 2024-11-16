import { Route, Routes, Navigate, BrowserRouter } from 'react-router-dom';
import SignIn from './signIn/SignIn';
import Home from './home/Home';
import { useEffect, useState } from 'react';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLogoClicked, setIsLogoClicked] = useState(false); // 로고 클릭 상태 관리

    // 로그인 상태 초기화
    useEffect(() => {
        const savedAuth = localStorage.getItem('isAuthenticated');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (saveLogin: boolean) => {
        setIsAuthenticated(true);
        if (saveLogin) {
            localStorage.setItem('isAuthenticated', 'true');
        }
    };

    return (
        <BrowserRouter basename={process.env.PUBLIC_URL}>
            {isLogoClicked ? ( // 로고 클릭 시 강제적으로 "/"로 이동
                <Home onLogoClick={() => setIsLogoClicked(false)} />
            ) : (
                <Routes>
                    <Route
                        path="/"
                        element={
                            isAuthenticated ? (
                                <Home onLogoClick={() => setIsLogoClicked(true)} />
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
            )}
        </BrowserRouter>
    );
}

export default App;
