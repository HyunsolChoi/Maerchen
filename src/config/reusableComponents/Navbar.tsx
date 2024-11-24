import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClapperboard, faUser, faBars } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
    username: string;
    onLogout: () => void;
    forceRerender: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ username, onLogout, forceRerender }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [opacity, setOpacity] = useState(1); // Navbar 투명도 관리
    const [isVisible, setIsVisible] = useState(true); // Navbar의 표시 여부 관리
    const [lastScrollY, setLastScrollY] = useState(0); // 마지막 스크롤 위치 저장

    const navigate = useNavigate();
    const location = useLocation();

    const dropdownRef = useRef<HTMLDivElement>(null); // 드롭다운 메뉴 참조
    const menuRef = useRef<HTMLDivElement>(null); // 모바일 메뉴 참조

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const newOpacity = scrollY > 80 ? Math.max(1 - (scrollY - 80) / 200, 0) : 1;
            setOpacity(newOpacity); // 투명도 업데이트
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 80 || currentScrollY < lastScrollY) {
                setIsVisible(true); // 위로 스크롤 시 표시
                setOpacity(1); // 다시 보일 때 불투명 상태로 초기화
            } else if (currentScrollY > lastScrollY) {
                setIsVisible(false); // 아래로 스크롤 시 숨김
            } else if (currentScrollY > 80) {
                const newOpacity = Math.max(1 - (currentScrollY - 80) / 200, 0);
                setOpacity(newOpacity); // 스크롤 위치에 따라 투명도 업데이트
            }

            setLastScrollY(currentScrollY); // 현재 스크롤 위치 저장
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    const handleNavigate = (path: string) => {
        if (location.pathname === path) {
            forceRerender();
        } else {
            navigate(path);
        }
        window.scrollTo(0, 0);
    };

    const toggleMenu = () => {
        setMenuVisible((prev) => {
            if (!prev) setDropdownVisible(false);
            return !prev;
        });
    };

    const toggleDropdown = () => {
        setDropdownVisible((prev) => {
            if (!prev) setMenuVisible(false);
            return !prev;
        });
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && // 드롭다운 외부 클릭
            menuRef.current && !menuRef.current.contains(event.target as Node) // 모바일 메뉴 외부 클릭
        ) {
            setDropdownVisible(false);
            setMenuVisible(false);
        }
    };

    if (location.pathname === "/signin") {
        return null;
    }

    return (
        <nav
            className={`navbar ${isVisible ? 'visible' : 'hidden'}`}
            style={{backgroundColor: `rgba(31, 31, 31, ${opacity})`}}
        >
            <FontAwesomeIcon
                icon={faClapperboard}
                className="navbar-logo"
                onClick={() => handleNavigate("/")}
            />
            <ul className="navbar-menu">
                <li
                    className={`navbar-item ${location.pathname === "/" ? "active" : ""}`}
                    onClick={() => handleNavigate("/")}
                >
                    홈
                </li>
                <li
                    className={`navbar-item ${location.pathname === "/popular" ? "active" : ""}`}
                    onClick={() => handleNavigate("/popular")}
                >
                    대세 콘텐츠
                </li>
                <li
                    className={`navbar-item ${location.pathname === "/search" ? "active" : ""}`}
                    onClick={() => handleNavigate("/search")}
                >
                    찾아보기
                </li>
                <li
                    className={`navbar-item ${location.pathname === "/wishlist" ? "active" : ""}`}
                    onClick={() => handleNavigate("/wishlist")}
                >
                    찜
                </li>
            </ul>

            <div className="user-icon" onClick={toggleDropdown} ref={dropdownRef}>
                <FontAwesomeIcon icon={faUser}/>
                {dropdownVisible && (
                    <div className="dropdown-menu">
                        <p className="dropdown-item">{username}</p>
                        <p className="dropdown-item logout" onClick={onLogout}>로그아웃</p>
                    </div>
                )}
            </div>
            <div className="menu-icon" onClick={toggleMenu} ref={menuRef}>
                <FontAwesomeIcon icon={faBars}/>
                {menuVisible && (
                    <div className="dropdown-menu">
                        <p
                            className={`dropdown-item mobile ${location.pathname === "/" ? "active" : ""}`}
                            onClick={() => handleNavigate("/")}
                        >
                            홈
                        </p>
                        <p
                            className={`dropdown-item mobile ${location.pathname === "/popular" ? "active" : ""}`}
                            onClick={() => handleNavigate("/popular")}
                        >
                            대세 콘텐츠
                        </p>
                        <p
                            className={`dropdown-item mobile ${location.pathname === "/search" ? "active" : ""}`}
                            onClick={() => handleNavigate("/search")}
                        >
                            찾아보기
                        </p>
                        <p
                            className={`dropdown-item mobile ${location.pathname === "/wishlist" ? "active" : ""}`}
                            onClick={() => handleNavigate("/wishlist")}
                        >
                            찜
                        </p>
                    </div>
                )}

            </div>
        </nav>
    );
};

export default Navbar;
