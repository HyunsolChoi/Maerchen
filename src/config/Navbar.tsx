import React, { useState } from 'react';
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
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (path: string) => {
        if (location.pathname === path) {
            forceRerender(); // 동일 경로일 때 리렌더링 강제
        } else {
            navigate(path); // 경로 변경
        }
        window.scrollTo(0, 0); // 스크롤 위치를 상단으로 초기화
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

    if (location.pathname === "/signin") {
        return null; // Navbar 비활성화
    }

    return (
        <nav className="navbar">
            <FontAwesomeIcon
                icon={faClapperboard}
                className="navbar-logo"
                onClick={() => handleNavigate("/")}
            />
            <ul className="navbar-menu">
                <li className="navbar-item" onClick={() => handleNavigate("/")}>홈</li>
                <li className="navbar-item" onClick={() => handleNavigate("/popular")}>대세 콘텐츠</li>
                <li className="navbar-item">찾아보기</li>
                <li className="navbar-item" onClick={() => handleNavigate("/wishlist")}>찜</li>
            </ul>
            <div className="user-icon" onClick={toggleDropdown}>
                <FontAwesomeIcon icon={faUser} />
                {dropdownVisible && (
                    <div className="dropdown-menu">
                        <p className="dropdown-item">{username}</p>
                        <p className="dropdown-item logout" onClick={onLogout}>로그아웃</p>
                    </div>
                )}
            </div>
            <div className="menu-icon" onClick={toggleMenu}>
                <FontAwesomeIcon icon={faBars} />
                {menuVisible && (
                    <div className="dropdown-menu">
                        <p className="dropdown-item" onClick={() => handleNavigate("/")}>홈</p>
                        <p className="dropdown-item" onClick={() => handleNavigate("/popular")}>대세 콘텐츠</p>
                        <p className="dropdown-item">찾아보기</p>
                        <p className="dropdown-item" onClick={() => handleNavigate("/wishlist")}>찜</p>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
