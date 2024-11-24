import React, { useState } from 'react';
import './SignIn.css';
import '../../config/views/toast.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { validateApiKey } from '../../config/utils/validateApiKey';
import { faClapperboard } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../config/interfaces';
import { toast } from 'react-toastify';

interface SignInProps {
    onLogin: (saveLogin: boolean) => void; // 저장 상태를 전달
}

function SignIn({ onLogin }: SignInProps) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPw] = useState<string>('');
    const [check, setPw2] = useState<string>('');
    const [isSave, setIsSave] = useState<boolean>(false); // 로그인 정보 저장 체크 상태
    const [showModal, setShowModal] = useState(false); // 모달 상태
    const [signUpcheck, setSignUpCheck] = useState<boolean>(false);

    const toggleSignUp = () => {   // 회원가입, 로그인 창 전환 시 입력 필드 초기화
        setIsSignUp(!isSignUp);
        setEmail('');
        setPw('');
        setPw2('');
    };

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

    const handleSignUp = async () => {
        const newUser: User = { email, password };
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];

        // 이메일 중복 확인
        if (existingUsers.some(user => user.email === email)) {
            toast.error("이미 등록된 이메일입니다.");
            return;
        }

        // 회원가입 체크란 확인
        if (!signUpcheck) {
            toast.warn("기본 사항을 확인해주세요.");
            return;
        }

        // TMDB API Key 검증
        const isValidApiKey = await validateApiKey(password);
        if (!isValidApiKey) {
            toast.error("입력한 TMDB API Key가 유효하지 않습니다.");
            return;
        }

        // 새 사용자 추가
        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers)); // 사용자 목록 저장
        toast.success("회원가입 성공!");
        toggleSignUp();
    };

    const handleLogin = async () => {
        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];

        const foundUser = savedUsers.find(user => user.email === email && user.password === password);

        if (!savedUsers.find(user => user.email === email)) {
            toast.error("회원가입 되지 않은 이메일입니다.");
            return;
        }

        const isValidApiKey = await validateApiKey(password);
        if (!isValidApiKey) {
            toast.error("API Key가 유효하지 않습니다.");
            return;
        }

        if (foundUser) {
            toast.success("로그인 성공!");
            localStorage.setItem('users', JSON.stringify(savedUsers)); // 로그인 후에도 사용자 목록 유지
            sessionStorage.setItem('sessionUserEmail', email);
            onLogin(isSave); // 로그인 성공 시 App.tsx의 상태 업데이트
        } else {
            toast.error("이메일 또는 비밀번호가 일치하지 않습니다.");
        }
    };

    const checkSubmit = (): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.warn("유효한 이메일 형식을 입력하세요.");
            return false;
        }
        if (password !== check && isSignUp) {
            toast.error("비밀번호 확인에 실패하였습니다.");
            return false;
        }
        return true;
    };

    return (
        <div className="App">
            <div className="background" />
            <div className="main-logo">
                <FontAwesomeIcon icon={faClapperboard} className="main-logo" />
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
                        <>
                            <input
                                type="password"
                                placeholder="비밀번호 확인"
                                className="input-field"
                                value={check}
                                onChange={(e) => setPw2(e.target.value)}
                            />
                            <div className="agreement">
                                <label>
                                    <input type="checkbox" checked={signUpcheck}
                                           className="signupCheck" onChange={(e) => setSignUpCheck(e.target.checked)}
                                    />
                                    <span className="link" onClick={() => setShowModal(true)}>기본 사항</span>을 충분히 인지하였습니다.
                                </label>
                            </div>
                        </>
                    )}
                    <button type="submit" className="auth-button">
                        {isSignUp ? '회원가입' : '로그인'}
                    </button>
                </form>
                {!isSignUp && (
                    <label>
                        <input type="checkbox" checked={isSave} onChange={(e) => setIsSave(e.target.checked)} />
                        로그인 정보 저장
                    </label>
                )}
                <div className="options">
                    <p>
                        <span onClick={toggleSignUp} className="link">
                            {isSignUp ? '이미 회원이신가요?' : '회원이 아니신가요?'}
                        </span>
                    </p>
                </div>
            </div>

            {/* 설명 모달 */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content">
                        <h3>기본 사항</h3>
                        <textarea
                            className="modal-textarea"
                            defaultValue={`- 비밀번호는 TMDB의 API KEY로 설정해야합니다.\n- 입력된 정보는 로컬 스토리지에 저장됩니다.`}
                            readOnly
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default SignIn;
