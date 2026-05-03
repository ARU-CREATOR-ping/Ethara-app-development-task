import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiGrid, FiBriefcase } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar card">
      <div className="navbar-brand">
        <span className="logo-icon">🚀</span>
        <h2>TaskFlow</h2>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard" className="nav-link"><FiGrid /> Dashboard</Link>
        <Link to="/projects" className="nav-link"><FiBriefcase /> Projects</Link>
      </div>
      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className="user-role">{user.role}</span>
        </div>
        <button className="btn btn-secondary logout-btn" onClick={logout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
