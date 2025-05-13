import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiVideo, FiScissors, FiImage, FiRefreshCw, FiEdit, FiList, FiHelpCircle, FiFilm } from 'react-icons/fi';
import { useProcessing } from '../context/ProcessingContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { videoFile, processingQueue } = useProcessing();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600';
  };

  const isDisabled = (path) => {
    if (path === '/') return false;
    return !videoFile;
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">VideoProcessor</Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link 
              to="/convert" 
              className={`${isActive('/convert')} ${isDisabled('/convert') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={e => isDisabled('/convert') && e.preventDefault()}
            >
              Convert
            </Link>
            <Link 
              to="/gif" 
              className={`${isActive('/gif')} ${isDisabled('/gif') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={e => isDisabled('/gif') && e.preventDefault()}
            >
              GIF Maker
            </Link>
            <Link 
              to="/trim" 
              className={`${isActive('/trim')} ${isDisabled('/trim') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={e => isDisabled('/trim') && e.preventDefault()}
            >
              Trim
            </Link>
            <Link 
              to="/watermark" 
              className={`${isActive('/watermark')} ${isDisabled('/watermark') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={e => isDisabled('/watermark') && e.preventDefault()}
            >
              Watermark
            </Link>
            <Link 
              to="/trailer" 
              className={`${isActive('/trailer')} ${isDisabled('/trailer') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={e => isDisabled('/trailer') && e.preventDefault()}
            >
              Trailer
            </Link>
            <Link 
              to="/queue" 
              className={`${isActive('/queue')} relative`}
            >
              Queue
              {processingQueue && processingQueue.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {processingQueue.length}
                </span>
              )}
            </Link>
            <Link to="/help" className={isActive('/help')}>Help</Link>
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 bg-white border-t flex flex-col space-y-3 pb-6">
            <Link to="/" className={`${isActive('/')} px-4`} onClick={closeMenu}>Home</Link>
            <Link 
              to="/convert" 
              className={`${isActive('/convert')} ${isDisabled('/convert') ? 'opacity-50 cursor-not-allowed' : ''} px-4`}
              onClick={e => {
                if (isDisabled('/convert')) {
                  e.preventDefault();
                } else {
                  closeMenu();
                }
              }}
            >
              Convert
            </Link>
            <Link 
              to="/gif" 
              className={`${isActive('/gif')} ${isDisabled('/gif') ? 'opacity-50 cursor-not-allowed' : ''} px-4`}
              onClick={e => {
                if (isDisabled('/gif')) {
                  e.preventDefault();
                } else {
                  closeMenu();
                }
              }}
            >
              GIF Maker
            </Link>
            <Link 
              to="/trim" 
              className={`${isActive('/trim')} ${isDisabled('/trim') ? 'opacity-50 cursor-not-allowed' : ''} px-4`}
              onClick={e => {
                if (isDisabled('/trim')) {
                  e.preventDefault();
                } else {
                  closeMenu();
                }
              }}
            >
              Trim
            </Link>
            <Link 
              to="/watermark" 
              className={`${isActive('/watermark')} ${isDisabled('/watermark') ? 'opacity-50 cursor-not-allowed' : ''} px-4`}
              onClick={e => {
                if (isDisabled('/watermark')) {
                  e.preventDefault();
                } else {
                  closeMenu();
                }
              }}
            >
              Watermark
            </Link>
            <Link 
              to="/trailer" 
              className={`${isActive('/trailer')} ${isDisabled('/trailer') ? 'opacity-50 cursor-not-allowed' : ''} px-4`}
              onClick={e => {
                if (isDisabled('/trailer')) {
                  e.preventDefault();
                } else {
                  closeMenu();
                }
              }}
            >
              Trailer
            </Link>
            <Link 
              to="/queue" 
              className={`${isActive('/queue')} relative px-4`}
              onClick={closeMenu}
            >
              Queue
              {processingQueue && processingQueue.length > 0 && (
                <span className="absolute top-0 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {processingQueue.length}
                </span>
              )}
            </Link>
            <Link to="/help" className={`${isActive('/help')} px-4`} onClick={closeMenu}>Help</Link>
          </nav>
        )}
      </div>
    </header>
  );
};


const HeaderComponent = () => {
  const location = useLocation();
  
  // Define navigation links with proper null checks
  const navLinks = [
    { path: '/', label: 'Home', icon: <FiVideo /> },
    { path: '/convert', label: 'Convert', icon: <FiRefreshCw /> },
    { path: '/gif', label: 'GIF Maker', icon: <FiImage /> },
    { path: '/trim', label: 'Trim', icon: <FiScissors /> },
    { path: '/watermark', label: 'Watermark', icon: <FiEdit /> },
    { path: '/trailer', label: 'Trailer', icon: <FiFilm /> },
    { path: '/queue', label: 'Queue', icon: <FiList /> },
    { path: '/help', label: 'Help', icon: <FiHelpCircle /> }
  ];
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-4">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="flex items-center">
              <FiVideo className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-xl font-bold text-gray-800">VideoProcessor</span>
            </Link>
          </div>
          
          <nav>
            <ul className="flex flex-wrap justify-center space-x-1 md:space-x-2">
              {navLinks && navLinks.length > 0 ? navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      location && location.pathname === link.path
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-1">{link.icon}</span>
                    <span className="hidden md:inline">{link.label}</span>
                  </Link>
                </li>
              )) : null}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;