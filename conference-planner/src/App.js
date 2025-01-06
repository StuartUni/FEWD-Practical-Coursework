import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home"; 
import Talks from "./components/Talks";
import TalkDetails from "./components/TalkDetails";
import Login from "./components/Login";
import Register from "./components/Register";
import Itinerary from "./components/Itinerary";
// App component
function App() {
    const [token, setToken] = useState(sessionStorage.getItem("token") || null);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        setToken(null);
    };
    // Render the app
    return (
        <BrowserRouter>
            
            <header>
                <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                    <div className="container-fluid">
                        <Link to="/" className="navbar-brand">Conference Planner</Link>
                        <div className="navbar-nav">
                            <Link to="/talks" className="nav-link">Talks</Link>
                            <Link to="/itinerary" className="nav-link">Itinerary</Link>
                            {!token ? (
                                <>
                                    <Link to="/login" className="nav-link">Login</Link>
                                    <Link to="/register" className="nav-link">Register</Link>
                                </>
                            ) : (
                                <button onClick={handleLogout} className="btn btn-outline-light ms-2">Logout</button>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            
            <main className="container my-4">
                <Routes>
                    {/* Home Page */}
                    <Route path="/" element={<Home isAuthenticated={!!token} />} />

                    {/* Talks Page */}
                    <Route path="/talks" element={<Talks isAuthenticated={!!token} />} />

                    {/* Talk Details Page */}
                    <Route path="/talks/:id" element={<TalkDetails isAuthenticated={!!token} />} />

                    {/* Itinerary Page */}
                    <Route path="/itinerary" element={<Itinerary />} />

                    {/* Login Page */}
                    <Route path="/login" element={<Login setToken={setToken} />} />

                    {/* Register Page */}
                    <Route path="/register" element={<Register />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;