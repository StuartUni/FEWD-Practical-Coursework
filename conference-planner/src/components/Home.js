import React from "react";
import { Link } from "react-router-dom";

const Home = () => (
    <div className="hero">
        <h1>Welcome to the Conference Planner</h1>
        <p>Explore talks, rate your favorites, and plan your itinerary!</p>
        <Link to="/talks" className="btn btn-primary">
            Explore Talks
        </Link>
    </div>
);

export default Home;