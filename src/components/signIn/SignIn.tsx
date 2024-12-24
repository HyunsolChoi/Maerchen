import React, {useEffect, useState} from 'react';
import './SignIn.css';
import '../../config/views/toast.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {validateApiKey} from '../../config/utils/validateApiKey';
import {faClapperboard} from '@fortawesome/free-solid-svg-icons';
import {User} from '../../config/interfaces';
import {toast} from 'react-toastify';

declare global {
    interface Window {
        Kakao: any; // 전역 Kakao 객체 선언
    }
}

interface SignInProps {
    onLogin: (saveLogin: boolean) => void; // 저장 상태를 전달
    onKakaoLogin: (kakaoUser: string, kakaoProfile: string) => void; // 카카오 로그인 후 호출되는 함수
}

function SignIn({ onLogin, onKakaoLogin }: SignInProps) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPw] = useState<string>('');
    const [check, setPw2] = useState<string>('');
    const [isSave, setIsSave] = useState<boolean>(false); // 로그인 정보 저장 체크 상태
    const [showModal, setShowModal] = useState(false); // 모달 상태
    const [signUpcheck, setSignUpCheck] = useState<boolean>(false);

    const code = new URL(document.location.toString()).searchParams.get('code');

    useEffect(() => {
        const loadKakaoSDK = () => {
            if (!window.Kakao) {
                const script = document.createElement("script");
                script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
                script.integrity = process.env.REACT_APP_KAKAO_SDK_INTEGRITY || '';
                script.crossOrigin = "anonymous";
                script.onload = () => {
                    if (window.Kakao && !window.Kakao.isInitialized()) {
                        window.Kakao.init(process.env.REACT_APP_KAKAO_JS_KEY || "");
                        console.log("Kakao SDK initialized");
                    }
                };
                document.head.appendChild(script);
            } else if (!window.Kakao.isInitialized()) {
                window.Kakao.init(process.env.REACT_APP_KAKAO_JS_KEY || "");
                console.log("Kakao SDK initialized");
            }
        };
        loadKakaoSDK();
    }, []);


    useEffect(() => {
        if (code) {
            getAccessToken(code); // Access Token 요청
        }
        // eslint-disable-next-line
    }, [code]);

    // Access Token 발급
    const getAccessToken = async (authCode: string) => {
        try {
            const response = await fetch('https://kauth.kakao.com/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: process.env.REACT_APP_REST_API_KEY || '', // REST API 키
                    redirect_uri: process.env.REACT_APP_REDIRECT_URI || '', // 리다이렉트 URI
                    code: authCode,
                }).toString(),
            });

            if (!response.ok) {
                console.error(`Access Token 요청 실패: ${response.status}`, await response.text());
                toast.error('Kakao Access Token 요청 실패');
            }

            const data = await response.json();

            if (data.access_token) {
                // 디버깅
                console.log('Access Token:', data.access_token);
                await getUserInfo(data.access_token); // 사용자 정보 요청
            } else {
                toast.error('Access Token 발급 실패:', data);
            }
        } catch (error) {
            toast.error('access token fetching 에러 발생');
        }
    };

    // 사용자 정보 요청
    const getUserInfo = async (accessToken: string) => {
        let newUser: User = { email, password };
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];

        try {
            const response = await fetch('https://kapi.kakao.com/v2/user/me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`, // 액세스 토큰을 헤더에 추가
                },
            });

            const data = await response.json();

            // 기본 TMDB 키의 유효성 검사
            if (await validateApiKey(process.env.REACT_APP_TMDB_API_KEY || '')){
                newUser.email = data.properties.nickname + data.properties.profile_image
                newUser.password = process.env.REACT_APP_TMDB_API_KEY || '';
            } else{
                toast.error("기본 TMDB API KEY가 유효하지 않습니다.")
                return;
            }

            // 임시 카카오 로그인 시, 사용자의 이름과 프로필 이미지를 사용해 고유의 아이디를 만들어 유저 항목에 삽입 / 기존 존재하면 중복 처리, 없으면 새로 생성
            // 사용자가 이름 혹은 프로필 사진을 변경하거나, 프로필 이미지의 경로가 변경되면 별개의 계정으로 취급할수있음. ( 카카오 아이디를 가져오지 못하므로 대체 )
            existingUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(existingUsers)); // 사용자 목록 저장

            // 사용자의 이름과 프로필 이미지 합을 이메일에 저장, 이를 키로 지정함.
            sessionStorage.setItem('sessionUserEmail', newUser.email);

            // 세션에 새 토큰 저장
            sessionStorage.setItem('kakaoAccessToken', accessToken)

            // App.tsx 의 함수 호출 및 데이터 전달
            // 디버깅
            console.log("fking kakao Login ##########################################");
            onKakaoLogin(data.properties.nickname, data.properties.profile_image);
        } catch (error) {
            toast.error('Error fetching user info:' + error);
        }
    };

    const loginWithKakao = () => {
        const client_id = process.env.REACT_APP_REST_API_KEY || ""; // 카카오 REST API 키
        const redirect_uri = process.env.REACT_APP_REDIRECT_URI || ""; // 리다이렉트 URI
        const scope = "profile_nickname,profile_image"; // 요청할 권한 스코프

        if(client_id===""||redirect_uri===""){
            toast.error("secret 에러");
            return;
        }

        // 카카오 인증 페이지로 리다이렉트
        window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}`;
      /*  if (window.Kakao) {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init(process.env.REACT_APP_KAKAO_JS_KEY || "");
            }

            try {
                window.Kakao.Auth.authorize({
                    redirectUri: process.env.REACT_APP_REDIRECT_URI,
                });
            } catch (error) {
                console.error("Kakao authorize error:", error);
                toast.error("카카오 인증 요청 중 오류 발생");
            }
        } else {
            toast.error("Kakao SDK가 초기화되지 않았습니다.");
        }*/
    };


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
        // 혹시나 세션에 남아있을 카카오 로그인 데이터 방지
        sessionStorage.removeItem('kakaoAccessToken');
        sessionStorage.removeItem('kakaoName');
        sessionStorage.removeItem('kakaoProfile');

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
                                    <span className="link" onClick={() => setShowModal(true)}>세부 사항</span>을 충분히 인지하였습니다.
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
                        <input type="checkbox" checked={isSave} onChange={(e) => setIsSave(e.target.checked)}/>
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

                {!isSignUp && (
                    <div className="kakao-login-section">
                        <p className="kakao-login-text">카카오로 임시 로그인 하기</p>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a className="kakao-login-btn" onClick={loginWithKakao}>
                            <img
                                src="https://k.kakaocdn.net/14/dn/btroDszwNrM/I6efHub1SN5KCJqLm1Ovx1/o.jpg"
                                width="200"
                                alt="카카오 로그인 버튼"
                            />
                        </a>
                    </div>
                )}
            </div>

            {/* 설명 모달 */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content">
                    <h3>세부 사항</h3>
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
