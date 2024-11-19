import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClapperboard, faUser, faBars } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
    username: string;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ username, onLogout }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const navigate = useNavigate();

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
                onClick={() => navigate('/home')}
            />
            <ul className="navbar-menu">
                <li className="navbar-item" onClick={() => navigate('/home')}>홈</li>
                <li className="navbar-item" onClick={() => navigate('/popular')}>대세 콘텐츠</li>
                <li className="navbar-item">찾아보기</li>
                <li className="navbar-item" onClick={() => navigate('/wishlist')}>찜</li>
            </ul>
            <div className="user-icon" onClick={toggleDropdown}>
                <FontAwesomeIcon icon={faUser} />
                {dropdownVisible && (
                    <div className="dropdown-menu">
                        <p className="dropdown-item">{username}</p>
                        <p className="dropdown-item" onClick={onLogout}>로그아웃</p>
                    </div>
                )}
            </div>
            <div className="menu-icon" onClick={toggleMenu}>
                <FontAwesomeIcon icon={faBars} />
                {menuVisible && (
                    <div className="dropdown-menu">
                        <p className="dropdown-item" onClick={() => navigate('/home')}>홈</p>
                        <p className="dropdown-item" onClick={() => navigate('/popular')}>대세 콘텐츠</p>
                        <p className="dropdown-item">찾아보기</p>
                        <p className="dropdown-item" onClick={() => navigate('/wishlist')}>찜</p>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
