import {BrowserRouter as Router, Route, Routes, Navigate, BrowserRouter} from 'react-router-dom';
import SignIn from './signIn/SignIn';

function App() {

    return (
        <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Routes>
                <Route path="/" element={<Navigate to="/signin" />} />
                <Route path="/signin" element={<SignIn/>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;