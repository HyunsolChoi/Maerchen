import { Route, Routes, Navigate, BrowserRouter, useNavigate, HashRouter } from 'react-router-dom';
import SignIn from './signIn/SignIn';
import Home from './home/Home';
import { useEffect, useState } from 'react';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        <HashRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <HomeWrapper />
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
    );
}
function HomeWrapper() {
    const navigate = useNavigate();
    const handleLogoClick = () => {
        navigate('Maerchen/'); // 로고 클릭 시 "/"로 이동
    };

    return <Home onLogoClick={handleLogoClick} />;
}
export default App;