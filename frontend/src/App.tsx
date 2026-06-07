import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EventsList } from './pages/EventsList';
import { EventDetails } from './pages/EventDetails';
import { PaymentCallback } from './pages/PaymentCallback';
import { MyTickets } from './pages/MyTickets';
import { CreatorDashboard } from './pages/CreatorDashboard';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500 selection:text-white">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/events" element={<EventsList />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route
                    path="/tickets"
                    element={
                      <ProtectedRoute allowedRoles={['EVENTEE']}>
                        <MyTickets />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment-callback"
                    element={
                      <ProtectedRoute allowedRoles={['EVENTEE']}>
                        <PaymentCallback />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['CREATOR']}>
                        <CreatorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/" element={<Navigate to="/events" replace />} />
                  <Route path="*" element={<Navigate to="/events" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;
