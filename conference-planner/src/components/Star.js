import React from "react";
import { FaStar } from "react-icons/fa";

const Star = ({ selected, onSelect }) => (
    <FaStar
        color={selected ? "gold" : "gray"}
        onClick={onSelect}
        style={{ cursor: "pointer" }}
    />
);

export default Star;