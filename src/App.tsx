import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignIn from './signIn/SignIn';

function App() {

    return (
        <Router basename={process.env.PUBLIC_URL}>
            <Routes>
                <Route path="/" element={<Navigate to="/signin" />} />
                <Route path="/signin" element={<SignIn/>} />
            </Routes>
        </Router>
    );
}

export default App;