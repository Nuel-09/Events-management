import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { DateTimePicker } from '../components/DateTimePicker';
import { Ticket, MapPin, Calendar, QrCode, Bell, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

interface TicketItem {
  id: string;
  paymentReference: string;
  status: string;
  verificationToken: string;
  qrCodeUrl: string;
  scanned: boolean;
  scannedAt: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    price: number;
  };
}

export const MyTickets: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [activeQrTicket, setActiveQrTicket] = useState<TicketItem | null>(null);
  const [reminderTicket, setReminderTicket] = useState<TicketItem | null>(null);
  const [customTriggerTime, setCustomTriggerTime] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const ticketId = searchParams.get('ticket');
    if (ticketId && tickets.length > 0) {
      const match = tickets.find((t) => t.id === ticketId);
      if (match) {
        setActiveQrTicket(match);
        setSearchParams({}, { replace: true });
      }
    }
  }, [tickets, searchParams, setSearchParams]);

  const handleOpenReminder = (ticket: TicketItem) => {
    setReminderTicket(ticket);
    setCustomTriggerTime('');
    setScheduleSuccess(false);
    setScheduleError(null);
  };

  const handleScheduleReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTicket) return;

    if (!customTriggerTime) {
      setScheduleError('Please select a reminder date and time.');
      return;
    }

    const triggerDate = new Date(customTriggerTime);
    const eventDate = new Date(reminderTicket.event.date);

    if (triggerDate.getTime() <= Date.now()) {
      setScheduleError('Reminder time must be in the future.');
      return;
    }

    if (triggerDate.getTime() >= eventDate.getTime()) {
      setScheduleError('Reminder time must be before the event starts.');
      return;
    }

    setScheduling(true);
    setScheduleError(null);
    setScheduleSuccess(false);

    try {
      await api.post(`/events/${reminderTicket.event.id}/reminders`, {
        triggerTime: triggerDate.toISOString(),
      });
      setScheduleSuccess(true);
      setTimeout(() => {
        setReminderTicket(null);
      }, 2500);
    } catch (err: any) {
      setScheduleError(err.response?.data?.message || 'Failed to schedule reminder');
    } finally {
      setScheduling(false);
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

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-background text-foreground min-h-[calc(100vh-4rem)]">
      <div className="flex items-center space-x-3 mb-8">
        <Ticket className="h-8 w-8 text-indigo-500" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground m-0">My Tickets</h1>
      </div>

      {error ? (
        <div className="text-center py-12 border border-border/60 rounded-xl bg-muted max-w-lg mx-auto">
          <p className="text-red-400 font-semibold">{error}</p>
          <Button onClick={fetchTickets} className="mt-4 bg-accent text-muted-foreground hover:bg-zinc-700">
            Retry
          </Button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-muted/50 max-w-lg mx-auto">
          <Ticket className="mx-auto h-12 w-12 text-zinc-700 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No tickets booked</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-sm mx-auto mb-6">
            You haven't purchased any tickets yet. Explore upcoming concerts and gatherings to book yours!
          </p>
          <Link to="/events" className="inline-block">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Discover Events
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => {
            const isScanned = ticket.scanned;
            
            return (
              <Card
                key={ticket.id}
                className={`border-border bg-card text-card-foreground shadow-lg overflow-hidden flex flex-col justify-between relative border-l-4 ${
                  isScanned ? 'border-l-zinc-700 opacity-70' : 'border-l-indigo-600'
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500">REF: {ticket.paymentReference}</span>
                    {isScanned ? (
                      <span className="rounded bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1 border border-border">
                        <span>Scanned</span>
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-white leading-tight">
                    {ticket.event.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span>{formatDate(ticket.event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="truncate">{ticket.event.location}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-5 pb-5 pt-0 border-t border-border/40 flex items-center justify-between gap-2">
                  {/* Show QR code button */}
                  <Button
                    onClick={() => setActiveQrTicket(ticket)}
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-accent hover:text-foreground bg-transparent flex-1 text-muted-foreground mt-4 font-semibold text-xs flex items-center justify-center space-x-1"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>View QR Code</span>
                  </Button>

                  {/* Set Reminder button */}
                  {!isScanned && (
                    <Button
                      onClick={() => handleOpenReminder(ticket)}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-accent mt-4 font-semibold text-xs flex items-center justify-center space-x-1"
                    >
                      <Bell className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Remind Me</span>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* 1. QR Code Dialog Modal */}
      <Dialog open={activeQrTicket !== null} onOpenChange={(open) => !open && setActiveQrTicket(null)}>
        <DialogContent className="border-border bg-card text-card-foreground max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">{activeQrTicket?.event?.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Pass Verification Gate QR Code
            </DialogDescription>
          </DialogHeader>

          {activeQrTicket && (
            <div className="space-y-4 py-4">
              <div className="mx-auto w-44 h-44 bg-white p-2 rounded-xl shadow-lg border border-border flex items-center justify-center">
                <img
                  src={activeQrTicket.qrCodeUrl}
                  alt="Ticket QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="rounded-lg bg-muted border border-border/60 p-3 text-left space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Ticket ID:</span>
                  <span className="font-mono text-muted-foreground">{activeQrTicket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Venue:</span>
                  <span className="text-muted-foreground truncate max-w-[180px]">{activeQrTicket.event.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Gate Status:</span>
                  <span className={`font-semibold ${activeQrTicket.scanned ? 'text-zinc-500' : 'text-emerald-400'}`}>
                    {activeQrTicket.scanned ? 'Scanned Check-in Complete' : 'Active Pass (Ready)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-center sm:justify-center">
            <Button onClick={() => setActiveQrTicket(null)} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
              Close Pass
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Custom Reminder Scheduler Dialog Modal */}
      <Dialog open={reminderTicket !== null} onOpenChange={(open) => !open && setReminderTicket(null)}>
        <DialogContent className="border-border bg-card text-card-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-white">
              <Bell className="h-5 w-5 text-indigo-500" />
              <span>Set Custom Reminder</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose a custom date and time to receive an email alert before this event starts.
            </DialogDescription>
          </DialogHeader>

          {scheduleSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto h-12 w-12 text-emerald-400 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold">Reminder scheduled!</p>
              <p className="text-xs text-muted-foreground px-4">
                You will receive an email at your chosen time with event details and a link to your ticket.
              </p>
            </div>
          ) : (
            <form onSubmit={handleScheduleReminder} className="space-y-4 py-3">
              {scheduleError && (
                <div className="flex items-center space-x-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{scheduleError}</span>
                </div>
              )}

              <div className="space-y-2">
                <DateTimePicker
                  id="reminder-time"
                  label="Reminder Date & Time"
                  value={customTriggerTime}
                  onChange={setCustomTriggerTime}
                />
                <span className="text-[10px] text-zinc-500 block">
                  Must be in the future and strictly before: {reminderTicket && formatDate(reminderTicket.event.date)}
                </span>
              </div>

              <DialogFooter className="pt-2">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReminderTicket(null)}
                    className="border-border text-muted-foreground bg-transparent hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={scheduling || !customTriggerTime}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    {scheduling ? 'Scheduling...' : 'Set Reminder'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
