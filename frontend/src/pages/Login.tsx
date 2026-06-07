import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { KeyRound, Mail, AlertTriangle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectAfterAuth = (userObj: { role: string }) => {
    const from = (location.state as { from?: string })?.from;
    if (from) {
      navigate(from);
    } else if (userObj.role === 'CREATOR') {
      navigate('/dashboard');
    } else {
      navigate('/events');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      const savedUser = localStorage.getItem('eventful_user');
      if (savedUser) {
        redirectAfterAuth(JSON.parse(savedUser));
      } else {
        navigate('/events');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-border bg-card/60 backdrop-blur-md text-foreground">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-zinc-400">
            Sign in to access your event dashboard or check your tickets
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
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-indigo-600 focus-visible:border-indigo-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-indigo-600 focus-visible:border-indigo-600"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2 h-11"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Sign In'
              )}
            </Button>

            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <span className="text-xs text-muted-foreground">or continue with</span>
                <GoogleLogin
                  onSuccess={async (res) => {
                    if (!res.credential) return;
                    setError(null);
                    setLoading(true);
                    try {
                      await googleLogin(res.credential);
                      const savedUser = localStorage.getItem('eventful_user');
                      if (savedUser) redirectAfterAuth(JSON.parse(savedUser));
                    } catch (err: any) {
                      setError(err.message || 'Google sign-in failed');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onError={() => setError('Google sign-in was cancelled or failed')}
                  theme="filled_black"
                  size="large"
                  width="100%"
                />
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-zinc-400">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-500 hover:text-indigo-400">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
