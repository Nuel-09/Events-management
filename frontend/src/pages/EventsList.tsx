import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Search, MapPin, Calendar, Banknote, Sparkles, Compass } from 'lucide-react';

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

export const EventsList: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search trigger
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      // Reset cursor on new search
      setCursor(null);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchEvents = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await api.get('/events', {
        params: {
          search: debouncedSearch || undefined,
          limit: 6,
          cursor: isLoadMore ? cursor : undefined,
        },
      });

      const { events: fetchedEvents, nextCursor: fetchNextCursor } = response.data;

      if (isLoadMore) {
        setEvents((prev) => [...prev, ...fetchedEvents]);
      } else {
        setEvents(fetchedEvents);
      }
      setNextCursor(fetchNextCursor);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, cursor]);

  useEffect(() => {
    fetchEvents();
  }, [debouncedSearch]);

  const handleLoadMore = () => {
    if (nextCursor) {
      setCursor(nextCursor);
      fetchEvents(true);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-zinc-950 text-white min-h-[calc(100vh-4rem)]">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-zinc-900 to-indigo-950 border border-zinc-800 p-8 sm:p-12 mb-12 shadow-2xl">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-40 w-40 translate-y-10 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Discover Unforgettable Experiences</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-tight text-white leading-[1.15]">
            Passport to a World of <span className="text-indigo-500 bg-clip-text">Moments</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            From pulsating concerts to captivating theater performances, sports events, and gatherings. 
            Book your tickets, scan check-ins, and secure your passport.
          </p>
        </div>
      </div>

      {/* Search Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search events by name, location or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-zinc-900/60 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 rounded-lg"
          />
        </div>
        <p className="text-sm text-zinc-400 self-end">
          Showing <span className="text-indigo-400 font-semibold">{events.length}</span> events
        </p>
      </div>

      {/* Main Grid */}
      {loading && !loadingMore ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="border-zinc-800 bg-zinc-900/40 text-white overflow-hidden animate-pulse">
              <div className="h-44 bg-zinc-900" />
              <div className="p-5 space-y-3">
                <div className="h-6 w-3/4 bg-zinc-900 rounded" />
                <div className="h-4 w-1/2 bg-zinc-900 rounded" />
                <div className="h-4 w-5/6 bg-zinc-900 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-zinc-800/60 rounded-xl bg-zinc-900/20 max-w-lg mx-auto">
          <p className="text-red-400 font-semibold">{error}</p>
          <Button onClick={() => fetchEvents()} className="mt-4 bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
            Retry
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
          <Compass className="mx-auto h-12 w-12 text-zinc-600 mb-4 animate-bounce" />
          <h3 className="text-lg font-semibold text-zinc-300">No events found</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-sm mx-auto">
            Try adjusting your search queries or keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const isSoldOut = event.ticketsSold >= event.capacity;
            const progress = (event.ticketsSold / event.capacity) * 100;
            
            return (
              <Card
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700 hover:scale-[1.01] transition-all duration-300 text-white overflow-hidden flex flex-col justify-between cursor-pointer group shadow-lg"
              >
                {/* Event Card Header Image Wrapper */}
                <div className="relative h-44 bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-indigo-950/80 border-b border-zinc-800 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-80" />
                  <span className="text-zinc-700 text-xl font-bold tracking-widest uppercase select-none opacity-40 group-hover:scale-105 transition-transform duration-300">
                    EVENT PREVIEW
                  </span>
                  
                  {isSoldOut ? (
                    <span className="absolute top-3 right-3 rounded bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                      Sold Out
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Selling Fast
                    </span>
                  )}
                </div>

                <CardContent className="p-5 flex-grow">
                  <h3 className="text-xl font-bold tracking-tight text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {event.title}
                  </h3>
                  
                  {/* Date & Location */}
                  <div className="space-y-1.5 mb-4 text-sm text-zinc-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </CardContent>

                <CardFooter className="px-5 pb-5 pt-0 border-t border-zinc-800/40 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 mt-4">
                    <Banknote className="h-4.5 w-4.5 text-emerald-500" />
                    <span className="font-extrabold text-lg text-emerald-400">
                      {event.price === 0 ? 'FREE' : `$${event.price}`}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white mt-4 font-semibold text-xs"
                  >
                    View Tickets
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Load More */}
      {nextCursor && (
        <div className="text-center mt-12">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="border-zinc-800 hover:bg-zinc-900 hover:text-white bg-transparent border text-zinc-300 h-11 px-8 rounded-lg"
          >
            {loadingMore ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
            ) : (
              'Load More Events'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
