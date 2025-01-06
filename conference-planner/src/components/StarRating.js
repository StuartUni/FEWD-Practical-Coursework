import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

// Star component
const Star = ({ selected, onSelect, onHover, size = 24 }) => (
    <FaStar
        size={size}
        color={selected ? "gold" : "gray"} 
        style={{ cursor: "pointer", transition: "color 0.3s ease" }} 
        onClick={onSelect} 
        onMouseEnter={onHover} 
        onMouseLeave={onHover} 
    />
);

// StarRating component
const StarRating = ({ totalStars = 5, onRate }) => {
    const [selectedStars, setSelectedStars] = useState(0); 
    const [hoveredStars, setHoveredStars] = useState(0); 

    const handleRate = (rating) => {
        setSelectedStars(rating); 
        if (onRate) {
            onRate(rating); 
        }
    };
    // Display the stars
    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            {[...Array(totalStars)].map((_, index) => (
                <Star
                    key={index}
                    size={24}
                    selected={index < (hoveredStars || selectedStars)} 
                    onSelect={() => handleRate(index + 1)} 
                    onHover={() => setHoveredStars(index + 1)} 
                />
            ))}
            <span style={{ marginLeft: "8px" }}>{selectedStars} / {totalStars}</span>
        </div>
    );
};

export default StarRating;