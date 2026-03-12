import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  PlusCircle,
  User,
  LogOut,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Services", path: "/services", icon: Search },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass-strong shadow-soft" : "bg-transparent"
        }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow"
            >
              <span className="text-white font-bold text-xl">N</span>
            </motion.div>
            <span className="text-2xl font-display font-bold gradient-text hidden sm:block">
              NeighborNode
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {isActive(item.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 font-medium">
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/create-service"
                  className="hidden sm:flex btn btn-primary text-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Service</span>
                </Link>

                <div className="relative group hidden sm:block">
                  <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  {/* Dropdown for Bookings/Appointments */}
                  <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                    <div className="glass-strong rounded-xl shadow-soft-lg overflow-hidden p-2">
                      <Link
                        to="/bookings"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Search className="w-4 h-4" />
                        <span>My Bookings</span>
                      </Link>
                      <Link
                        to="/appointments"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors mt-1"
                      >
                        <Bell className="w-4 h-4" />
                        <span>Appointments</span>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold shadow-lg">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </div>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                    <div className="glass-strong rounded-xl shadow-soft-lg overflow-hidden p-2">
                      <div className="px-3 py-2 border-b border-gray-200 dark:border-slate-600">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {user?.displayName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors mt-1"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Home className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-ghost text-sm hidden sm:flex"
                >
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => onMenuClick?.()}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
