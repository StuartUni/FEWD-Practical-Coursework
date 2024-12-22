import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

// Individual Star Component
const Star = ({ selected, onSelect, onHover, size = 24 }) => (
    <FaStar
        size={size}
        color={selected ? "gold" : "gray"} // Gold for selected, gray for unselected
        style={{ cursor: "pointer", transition: "color 0.3s ease" }} // Smooth transition
        onClick={onSelect} // Click event to select rating
        onMouseEnter={onHover} // Hover effect
        onMouseLeave={onHover} // Reset on hover out
    />
);

// StarRating Component
const StarRating = ({ totalStars = 5, onRate }) => {
    const [selectedStars, setSelectedStars] = useState(0); // For selected stars
    const [hoveredStars, setHoveredStars] = useState(0); // For hover effect

    const handleRate = (rating) => {
        setSelectedStars(rating); // Set the selected rating
        if (onRate) {
            onRate(rating); // Trigger callback for rating submission
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            {[...Array(totalStars)].map((_, index) => (
                <Star
                    key={index}
                    size={24}
                    selected={index < (hoveredStars || selectedStars)} // Highlight on hover or selection
                    onSelect={() => handleRate(index + 1)} // Handle click
                    onHover={() => setHoveredStars(index + 1)} // Handle hover
                />
            ))}
            <span style={{ marginLeft: "8px" }}>{selectedStars} / {totalStars}</span>
        </div>
    );
};

export default StarRating;