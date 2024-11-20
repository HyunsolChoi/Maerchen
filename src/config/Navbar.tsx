import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClapperboard, faUser, faBars } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
    username: string;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ username, onLogout }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleHomeNavigate = () => {
        if (location.pathname === '/') {
            navigate('dsds');
        } else {
            navigate('/');
        }
    };
    const handlePopularNavigate = () => {
        if (location.pathname === '/popular') {
            window.location.reload();
        } else {
            navigate('/popular');
        }
    };
    const handleWishlistNavigate = () => {
        if (location.pathname === '/wishlist') {
            window.location.reload();
        } else {
            navigate('/wishlist');
        }
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

    return (
        <nav className="navbar">
            <FontAwesomeIcon
                icon={faClapperboard}
                className="navbar-logo"
                onClick={handleHomeNavigate}
            />
            <ul className="navbar-menu">
                <li className="navbar-item" onClick={handleHomeNavigate}>홈</li>
                <li className="navbar-item" onClick={handlePopularNavigate}>대세 콘텐츠</li>
                <li className="navbar-item">찾아보기</li>
                <li className="navbar-item" onClick={handleWishlistNavigate}>찜</li>
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
                        <p className="dropdown-item" onClick={handleHomeNavigate}>홈</p>
                        <p className="dropdown-item" onClick={handlePopularNavigate}>대세 콘텐츠</p>
                        <p className="dropdown-item">찾아보기</p>
                        <p className="dropdown-item" onClick={handleWishlistNavigate}>찜</p>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
