import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../Contexts/UserContext";
import axios from "axios";

export default function Navbar() {
    const { userToken, setUserToken } = useContext(UserContext);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (search.trim()) {
                axios
                    .get(`http://localhost:4008/api/users/search?search=${search}`)
                    .then((res) => {
                        setResults(res.data.data);
                        setShowResults(true);
                    })
                    .catch((err) => {
                        console.error("Search error:", err);
                        setShowResults(false);
                    });
            } else {
                setShowResults(false);
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    const handleLogout = () => {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userId");
        setUserToken(null);
        navigate("/signin");
    };

    const handleSelectUser = (userId) => {
        setSearch("");
        setShowResults(false);
        navigate(`/profile/${userId}`);
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3 shadow-sm">
                <div className="container-fluid">
                    <Link className="navbar-brand fw-bold" to="/">Social App</Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarContent"
                        aria-controls="navbarContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div className="collapse navbar-collapse" id="navbarContent">
                        <form className="d-flex ms-auto me-3 position-relative" role="search">
                            <input
                                className="form-control"
                                type="search"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>

                        <ul className="navbar-nav ms-auto align-items-center gap-2">
                            <li className="nav-item">
                                <Link
                                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                                    to="/"
                                >
                                    Home
                                </Link>
                            </li>

                            {userToken ? (
                                <>
                                    <li className="nav-item">
                                        <Link
                                            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                                            to="/profile"
                                        >
                                            My Profile
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className="btn btn-outline-light btn-sm"
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <Link
                                            className={`nav-link ${location.pathname === '/signin' ? 'active' : ''}`}
                                            to="/signin"
                                        >
                                            Login
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link
                                            className={`nav-link ${location.pathname === '/signup' ? 'active' : ''}`}
                                            to="/signup"
                                        >
                                            Register
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            {showResults && results.length > 0 && (
                <div className="container mt-2">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-10 col-lg-8">
                            <div className="bg-white border rounded shadow-sm p-2">
                                <ul className="list-group">
                                    {results.map((user) => (
                                        <li
                                            key={user._id}
                                            className="list-group-item list-group-item-action"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleSelectUser(user.id)}
                                        >
                                            {user.username}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
