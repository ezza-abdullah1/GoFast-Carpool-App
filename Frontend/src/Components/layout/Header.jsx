import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Moon, Sun, Car } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import SignIn from '../Authentication/SignIn';
import SignUp from '../Authentication/SignUp';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const location = useLocation();
  

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if user prefers dark mode
    if (localStorage.theme === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Find Carpool', path: '/carpools' },
    { name: 'Messages', path: '/messages' },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);
  
  // Auth modal functions
  const openSignIn = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const switchToSignUp = () => setAuthMode('signup');
  const switchToSignIn = () => setAuthMode('signin');

  return (
    <>
      <header 
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300 w-full',
          isScrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="relative flex items-center justify-center h-8 w-8 bg-primary rounded-full overflow-hidden">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-transparent">
                GoFAST
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 hover:text-primary relative py-2 px-1",
                    location.pathname === link.path 
                      ? "text-primary" 
                      : "text-foreground/80 hover:text-foreground"
                  )}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary rounded-full transform transition-transform duration-300"></span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <Button variant="outline" size="sm" onClick={openSignIn}>
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              
              <Button size="sm" onClick={openSignUp} className="dark:bg-muted dark:hover:bg-button-hover dark:text-white">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-4">
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button
                type="button"
                className="p-2 rounded-md text-gray-700 dark:text-gray-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "fixed inset-0 z-40 transform transition-transform ease-in-out duration-300 md:hidden",
            mobileMenuOpen 
              ? "translate-x-0 backdrop-blur-sm bg-background/30" 
              : "translate-x-full"
          )}
        >
          <div className="fixed right-0 h-full w-[75%] max-w-sm bg-background dark:bg-background shadow-xl overflow-y-auto">
            <div className="px-6 py-6 space-y-8">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                  <div className="relative flex items-center justify-center h-8 w-8 bg-primary rounded-full overflow-hidden">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-transparent">
                    GoFAST
                  </span>
                </Link>
                <button
                  type="button"
                  className="rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={closeMobileMenu}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <nav className="grid gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={cn(
                      "flex items-center py-3 px-4 rounded-lg transition-colors",
                      location.pathname === link.path
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/80 hover:bg-muted"
                    )}
                    onClick={closeMobileMenu}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              
              <div className="grid gap-4 pt-6">
                <Button variant="outline" onClick={() => {openSignIn(); closeMobileMenu();}} className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button onClick={() => {openSignUp(); closeMobileMenu();}} className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {authModalOpen && (
  <div 
    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
    onKeyDown={(e) => e.key === 'Escape' && closeAuthModal()}
    tabIndex={-1}
  >
    <div 
      className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-md p-6 relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
        onClick={closeAuthModal}
      >
        <X className="h-5 w-5" />
      </button>
      {authMode === 'signin' ? (
        <SignIn 
          onSwitchToSignUp={switchToSignUp} 
          onClose={closeAuthModal} 
        />
      ) : (
        <SignUp 
          onSwitchToSignIn={switchToSignIn} 
          onClose={closeAuthModal} 
        />
      )}
    </div>
  </div>
)}

    </>
  );
};

export default Header;