import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Calendar, MapPin, Ticket, Sparkles, ArrowLeft, Share2, Users, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatNaira } from '../lib/formatCurrency';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  ticketsSold: number;
}

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState(false);

  useEffect(() => {
    const state = location.state as { paymentSuccess?: boolean };
    if (state?.paymentSuccess) {
      setPaymentSuccessMsg(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleBookTicket = async () => {
    if (!event) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${event.id}` } });
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      const response = await api.post('/payments/initialize', { eventId: event.id });
      const { redirectUrl, isFree } = response.data;

      if (isFree) {
        // Free event: booked instantly
        navigate('/tickets', { state: { successMessage: 'Ticket booked successfully! Check your list below.' } });
      } else if (redirectUrl) {
        // Paid event: redirect to Paystack
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize ticket purchase');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleShare = () => {
    // We will generate the sharing link which resolves to our backend OG HTML scraper target
    const backendShareUrl = `${window.location.protocol}//${window.location.host.split(':')[0]}:3000/events/${event?.id}/share`;
    navigator.clipboard.writeText(backendShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-foreground bg-background min-h-[calc(100vh-4rem)]">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <p className="text-zinc-500 mt-2">The event details you are looking for does not exist or was deleted.</p>
        <Link to="/events" className="mt-6 inline-block">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Back to Explore
          </Button>
        </Link>
      </div>
    );
  }

  const isSoldOut = event.ticketsSold >= event.capacity;
  const ticketsLeft = event.capacity - event.ticketsSold;
  const capacityPct = (event.ticketsSold / event.capacity) * 100;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-background text-foreground min-h-[calc(100vh-4rem)]">
      {/* Back button */}
      <Link to="/events" className="inline-flex items-center space-x-2 text-zinc-400 hover:text-white mb-6 group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Events</span>
      </Link>

      {paymentSuccessMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>
            Payment successful! Your ticket is confirmed — check <Link to="/tickets" className="font-semibold underline">My Tickets</Link> for your QR code.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-xl">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl" />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 text-white leading-tight">
              {event.title}
            </h1>

            {/* Meta details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start space-x-3 rounded-lg bg-zinc-900/60 p-4 border border-zinc-800">
                <Calendar className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Date & Time</p>
                  <p className="text-sm text-zinc-300 font-medium mt-1">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg bg-zinc-900/60 p-4 border border-zinc-800">
                <MapPin className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Location</p>
                  <p className="text-sm text-zinc-300 font-medium mt-1">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-zinc-800 pt-6">
              <h2 className="text-xl font-bold mb-3">About This Event</h2>
              <p className="text-zinc-400 leading-relaxed whitespace-pre-line text-base">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Card */}
        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/60 backdrop-blur-md text-white shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Ticket className="h-5 w-5 text-indigo-500" />
                <span>Ticket Details</span>
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Secure your booking instantly via Paystack
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <div className="flex items-center space-x-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Price Row */}
              <div className="flex items-baseline justify-between rounded-lg bg-zinc-950 border border-zinc-800 p-4">
                <span className="text-sm text-zinc-400">Ticket Price</span>
                <span className="text-2xl font-black text-emerald-400">
                  {formatNaira(event.price)}
                </span>
              </div>

              {/* Capacity Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Availability</span>
                  <span className="text-zinc-300 font-medium">
                    {isSoldOut ? 'Sold Out' : `${ticketsLeft} tickets left`}
                  </span>
                </div>
                <Progress value={capacityPct} className="h-2 bg-zinc-800 [&>div]:bg-indigo-600" />
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>{event.ticketsSold} booked</span>
                  <span>{event.capacity} total capacity</span>
                </div>
              </div>

              {/* Security Badges */}
              <div className="rounded-lg bg-zinc-950/40 p-3 border border-zinc-800/60 flex items-center space-x-3 text-xs text-zinc-400">
                <ShieldCheck className="h-5 w-5 text-indigo-500 shrink-0" />
                <span>Official QR Code tickets automatically generated upon purchase.</span>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-3">
              {/* Main Booking Button */}
              {user?.role === 'CREATOR' ? (
                <Button disabled className="w-full bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed">
                  Creators Cannot Book Tickets
                </Button>
              ) : (
                <Button
                  onClick={handleBookTicket}
                  disabled={isSoldOut || bookingLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 text-sm font-bold shadow-lg shadow-indigo-600/10"
                >
                  {bookingLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : isSoldOut ? (
                    'Sold Out'
                  ) : (
                    `Book Ticket ${event.price > 0 ? 'via Paystack' : '(Free)'}`
                  )}
                </Button>
              )}

              {/* Share Button */}
              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full border-zinc-800 text-zinc-300 hover:bg-zinc-900 bg-transparent flex items-center justify-center space-x-2"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-scale" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    <span>Copy Shareable Link</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
