import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Mail, KeyRound, User as UserIcon, CalendarDays, BarChart3, ShieldCheck, AlertTriangle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'EVENTEE' | 'CREATOR'>('EVENTEE');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await register(email, password, name, role);
      // Redirect to login on success
      navigate('/login', { state: { successMessage: 'Registration successful! Please login.' } });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg border-border bg-card/60 backdrop-blur-md text-card-foreground">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign up to buy tickets or start organizing your own events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-background border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-indigo-600 focus-visible:border-indigo-600"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-indigo-600 focus-visible:border-indigo-600"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="•••••••• (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-indigo-600 focus-visible:border-indigo-600"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-foreground">Select Your Account Type</Label>
              <div className="grid grid-cols-2 gap-4 pt-1">
                {/* Eventee Option */}
                <div
                  onClick={() => setRole('EVENTEE')}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer text-center transition-all ${
                    role === 'EVENTEE'
                      ? 'border-indigo-600 bg-indigo-600/10'
                      : 'border-border bg-muted/50 hover:border-border'
                  }`}
                >
                  <CalendarDays className={`h-8 w-8 mb-2 ${role === 'EVENTEE' ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                  <span className="font-semibold text-sm">Attend Events</span>
                  <span className="text-[10px] text-muted-foreground mt-1">Discover & buy tickets</span>
                </div>

                {/* Creator Option */}
                <div
                  onClick={() => setRole('CREATOR')}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer text-center transition-all ${
                    role === 'CREATOR'
                      ? 'border-indigo-600 bg-indigo-600/10'
                      : 'border-border bg-muted/50 hover:border-border'
                  }`}
                >
                  <BarChart3 className={`h-8 w-8 mb-2 ${role === 'CREATOR' ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                  <span className="font-semibold text-sm">Organize Events</span>
                  <span className="text-[10px] text-muted-foreground mt-1">Sell, scan & view stats</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4 h-11"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-500 hover:text-indigo-400">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
