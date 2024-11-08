import React, { useState } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClapperboard } from '@fortawesome/free-solid-svg-icons';

function App() {
    const [isSignUp, setIsSignUp] = useState(false);

    const toggleSignUp = () => {
        setIsSignUp(!isSignUp);
    };

    return (
        <div className="App">
            <div className="background"/>
            <div className="main-logo">
                <FontAwesomeIcon icon={faClapperboard} className="main-logo"/>
            </div>
            <div className={`auth-box ${isSignUp ? 'sign-up-mode' : ''}`}>
                <h2>{isSignUp ? '회원가입' : '로그인'}</h2>
                <form>
                    <input type="text" placeholder="이메일 주소" className="input-field" />
                    <input type="password" placeholder="비밀번호" className="input-field" />
                    {isSignUp && (
                        <input type="password" placeholder="비밀번호 확인" className="input-field" />
                    )}
                    <button type="submit" className="auth-button">
                        {isSignUp ? '회원가입' : '로그인'}
                    </button>
                </form>
                {!isSignUp && (
                    <label>
                        <input type="checkbox" /> 로그인 정보 저장
                    </label>
                )}
                <div className="options">
                    <p>
                        <a href="#" onClick={toggleSignUp} className="link">
                            {isSignUp ? '이미 회원이신가요?' : '회원이 아니신가요?'}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
