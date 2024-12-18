import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Talks from "./components/Talks";
import TalkDetails from "./components/TalkDetails";
import Login from "./components/Login";

// Example components for demonstration
const Home = () => <h1>Welcome to the Conference Planner!</h1>;

const Itinerary = () => <h1>Your Itinerary</h1>;

function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token") || null);

  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/talks">Talks</Link> |{" "}
        <Link to="/itinerary">Itinerary</Link> |{" "}
        {!token ? <Link to="/login">Login</Link> : <button onClick={() => {
          sessionStorage.removeItem("token");
          setToken(null);
        }}>Logout</button>}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/talks" element={<Talks isAuthenticated={!!token} />} />
        <Route path="/talks/:id" element={<TalkDetails isAuthenticated={!!token} />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;