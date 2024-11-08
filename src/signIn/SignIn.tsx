import React, { useState,useEffect } from 'react';
import './SignIn.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClapperboard } from '@fortawesome/free-solid-svg-icons';

interface User {
    email: string;
    password: string;
}

function SignIn() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPw] = useState<string>('');
    const [check, setPw2] = useState<string>('');
    const [isSave, setIsSave] = useState<boolean>(false); // 로그인 정보 저장 체크 상태

    const toggleSignUp = () => {   // 회원가입, 로그인 창 전환 시 입력 필드 초기화
        setIsSignUp(!isSignUp);
        setEmail('');
        setPw('');
        setPw2('');
    };

    useEffect(() => {
        // 컴포넌트가 마운트될 때 로컬 스토리지에서 마지막 로그인된 사용자 불러옴
        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
        if (savedUsers.length > 0) {
            const lastUser = savedUsers[savedUsers.length - 1];
            setEmail(lastUser.email);
            setPw(lastUser.password);
        }
    }, []);

    // 폼 제출 시 호출되는 함수
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkSubmit()) return; // 이메일 형식과 비밀번호 확인 검증
        if (isSignUp) {
            handleSignUp();
        } else {
            handleLogin();
        }
    };

    // 회원가입 성공 시 사용자 목록에 추가 및 저장
    const handleSignUp = () => {
        const newUser: User = { email, password };
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];

        // 이메일 중복 확인
        if (existingUsers.some(user => user.email === email)) {
            alert("이미 등록된 이메일입니다.");
            return;
        }

        // 새 사용자 추가
        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers)); // 사용자 목록 저장
        alert("회원가입 성공!");
        toggleSignUp();
    };

    // 로그인 시 저장된 사용자 목록에서 확인
    const handleLogin = () => {
        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];

        // 이메일과 비밀번호가 일치하는 사용자 찾기
        const foundUser = savedUsers.find(user => user.email === email && user.password === password);

        if(!savedUsers.find(user => user.email === email)){
            alert("회원가입 되지 않은 이메일입니다.")
            return;
        }

        if (foundUser) {
            alert("로그인 성공!");
            if (isSave) {
                localStorage.setItem('users', JSON.stringify(savedUsers)); // 로그인 후에도 사용자 목록 유지
            }
        } else {
            alert("이메일 또는 비밀번호가 일치하지 않습니다.");
        }
    };

    // 이메일 형식과 비밀번호 확인 검증 함수
    const checkSubmit = (): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('유효한 이메일 형식을 입력하세요.');
            return false;
        }
        if (password !== check && isSignUp) {
            alert('비밀번호 확인에 실패하였습니다.');
            return false;
        }
        return true;
    };

    return (
        <div className="App">
            <div className="background"/>
            <div className="main-logo">
                <FontAwesomeIcon icon={faClapperboard} className="main-logo"/>
            </div>
            <div className={`auth-box ${isSignUp ? 'sign-up-mode' : ''}`}>
                <h2>{isSignUp ? '회원가입' : '로그인'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="이메일 주소"
                        className="input-field"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        className="input-field"
                        value={password}
                        onChange={(e) => setPw(e.target.value)}
                    />
                    {isSignUp && (
                        <input
                            type="password"
                            placeholder="비밀번호 확인"
                            className="input-field"
                            value={check}
                            onChange={(e) => setPw2(e.target.value)}
                        />
                    )}
                    <button type="submit" className="auth-button">
                        {isSignUp ? '회원가입' : '로그인'}
                    </button>
                </form >
                {!isSignUp && (
                    <label>
                        <input type="checkbox" checked={isSave} onChange={(e) => setIsSave(e.target.checked)}/>
                        <></> 로그인 정보 저장
                    </label>
                )}
                <div className="options">
                    <p>
                        <a onClick={toggleSignUp} className="link">
                            {isSignUp ? '이미 회원이신가요?' : '회원이 아니신가요?'}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
