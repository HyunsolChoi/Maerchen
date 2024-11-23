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
    const navigate = useNavigate();
    const location = useLocation();

    const dropdownRef = useRef<HTMLDivElement>(null); // 드롭다운 메뉴 참조
    const menuRef = useRef<HTMLDivElement>(null); // 모바일 메뉴 참조

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

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (location.pathname === "/signin") {
        return null;
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
                <li className="navbar-item" onClick={() => handleNavigate("/search")}>찾아보기</li>
                <li className="navbar-item" onClick={() => handleNavigate("/wishlist")}>찜</li>
            </ul>
            <div className="user-icon" onClick={toggleDropdown} ref={dropdownRef}>
                <FontAwesomeIcon icon={faUser} />
                {dropdownVisible && (
                    <div className="dropdown-menu">
                        <p className="dropdown-item">{username}</p>
                        <p className="dropdown-item logout" onClick={onLogout}>로그아웃</p>
                    </div>
                )}
            </div>
            <div className="menu-icon" onClick={toggleMenu} ref={menuRef}>
                <FontAwesomeIcon icon={faBars} />
                {menuVisible && (
                    <div className="dropdown-menu">
                        <p className="dropdown-item mobile" onClick={() => handleNavigate("/")}>홈</p>
                        <p className="dropdown-item mobile" onClick={() => handleNavigate("/popular")}>대세 콘텐츠</p>
                        <p className="dropdown-item mobile" onClick={() => handleNavigate("/search")}>찾아보기</p>
                        <p className="dropdown-item mobile" onClick={() => handleNavigate("/wishlist")}>찜</p>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
