import React from 'react';
import './App.css';
import logo from './logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClapperboard } from '@fortawesome/free-solid-svg-icons'

function App() {
  return (
      <div className="App">
        <div className="background"/>
        <div className="main-logo">
          <FontAwesomeIcon icon={faClapperboard} className="main-logo"/>
        </div>
        <div className="login-screen">
          <div className="login-box">
            <h2>로그인</h2>
            <form>
              <input type="text" placeholder="이메일 주소" className="input-field"/>
              <input type="password" placeholder="비밀번호" className="input-field"/>
              <button type="submit" className="login-button">로그인</button>
            </form>
            <label>
              <input type="checkbox"/> 로그인 정보 저장
            </label>
            <div className="options">
              <p>
                <a href="#" className="link">비밀번호를 잊으셨나요?</a>
              </p>
            </div>
            <div className="extra">
              <p>
                <a href="#" className="link">회원이 아니신가요?</a>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;
