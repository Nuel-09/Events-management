import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, Compass, Ticket, LayoutDashboard, User as UserIcon, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';
import { EventfulLogo } from './EventfulLogo';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/events" className="flex items-center space-x-2 group">
              <EventfulLogo className="h-9 w-9 shrink-0 transition-transform group-hover:scale-105" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Event<span className="text-indigo-500">ful</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/events"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/events')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Explore Events</span>
            </Link>

            {isAuthenticated && user?.role === 'EVENTEE' && (
                <Link
                  to="/tickets"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/tickets')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Ticket className="h-4 w-4" />
                  <span>My Tickets</span>
                </Link>
              )}

            {isAuthenticated && user?.role === 'CREATOR' && (
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Creator Dashboard</span>
                </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 rounded-full bg-muted px-3 py-1 border border-border">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground max-w-[120px] truncate">{user?.name}</span>
                  <span className="rounded bg-indigo-950 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                    {user?.role}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-900">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-2 pt-2 pb-4 space-y-1">
          <Link
            to="/events"
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2.5 rounded-md text-base font-medium ${
              isActive('/events') ? 'bg-zinc-900 text-white' : 'text-zinc-400'
            }`}
          >
            <Compass className="h-5 w-5" />
            <span>Explore Events</span>
          </Link>

          {isAuthenticated && (
            <>
              {user?.role === 'EVENTEE' && (
                <Link
                  to="/tickets"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-md text-base font-medium ${
                    isActive('/tickets') ? 'bg-zinc-900 text-white' : 'text-zinc-400'
                  }`}
                >
                  <Ticket className="h-5 w-5" />
                  <span>My Tickets</span>
                </Link>
              )}

              {user?.role === 'CREATOR' && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-md text-base font-medium ${
                    isActive('/dashboard') ? 'bg-zinc-900 text-white' : 'text-zinc-400'
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Creator Dashboard</span>
                </Link>
              )}

              <div className="pt-4 pb-2 border-t border-zinc-800 mt-4 px-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-zinc-400">{user?.email}</p>
                </div>
                <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  {user?.role}
                </span>
              </div>

              <div className="px-3 pt-2">
                <Button
                  variant="destructive"
                  className="w-full justify-start space-x-2 bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white"
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </>
          )}

          {!isAuthenticated && (
            <div className="space-y-2 px-3 pt-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full">
                <Button variant="outline" className="w-full border-zinc-800 text-zinc-300 bg-transparent hover:bg-zinc-900">
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full">
                <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
