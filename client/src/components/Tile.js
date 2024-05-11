import React from 'react';
import './Tile.css';

const Tile = ({ value, onClick, className }) => {
    return (
        <div className={"tile " + className} onClick={onClick}>
            {value?.toUpperCase()}
        </div>
    );
};

export default Tile;