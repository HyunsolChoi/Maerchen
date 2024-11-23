import React from "react";
import './Loader.css';

const Loader: React.FC = () => {

    return (
        <div className="loader-container">
            <div className="spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <p className="loading-text">Loading Movies...</p>
        </div>
    );
};

export default Loader; // 다른 파일에서 사용 가능
