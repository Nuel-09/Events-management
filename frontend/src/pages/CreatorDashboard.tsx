import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { DateTimePicker } from '../components/DateTimePicker';
import { QrCameraScanner } from '../components/QrCameraScanner';
import { LayoutDashboard, Calendar, Users, QrCode, Plus, Pencil, Trash2, ShieldCheck, HelpCircle, AlertTriangle, CheckCircle2, ChevronRight, Coins } from 'lucide-react';
import { formatNaira } from '../lib/formatCurrency';

interface EventBreakdown {
  eventId: string;
  title: string;
  date: string;
  capacity: number;
  price: number;
  ticketsSold: number;
  ticketsScanned: number;
  attendanceRate: string;
}

interface LifetimeStats {
  totalEventsCreated: number;
  totalTicketsSold: number;
  totalScannedAttendees: number;
  overallAttendanceRate: string;
}

export const CreatorDashboard: React.FC = () => {
  const [stats, setStats] = useState<{ lifetimeStats: LifetimeStats; eventBreakdown: EventBreakdown[] } | null>(null);
  const [creatorEventsRaw, setCreatorEventsRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab selection
  const [activeTab, setActiveTab] = useState('analytics');

  // Selected event for booking lists
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formCapacity, setFormCapacity] = useState(100);
  const [formReminderInterval, setFormReminderInterval] = useState('1_DAY');
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  // Check-In Desk Simulator state
  const [scanToken, setScanToken] = useState('');
  const [scanChecking, setScanChecking] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, eventsRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/events/creator'),
      ]);
      setStats(statsRes.data);
      setCreatorEventsRaw(eventsRes.data);
      
      // Auto-select first event if none selected
      if (eventsRes.data.length > 0 && !selectedEventId) {
        setSelectedEventId(eventsRes.data[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleOpenCreate = () => {
    setEditingEventId(null);
    setFormTitle('');
    setFormDescription('');
    setFormDate('');
    setFormLocation('');
    setFormPrice(0);
    setFormCapacity(100);
    setFormReminderInterval('1_DAY');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (event: any) => {
    setEditingEventId(event.eventId || event.id);
    
    // Normalize date format for datetime-local input (YYYY-MM-DDTHH:MM)
    const formattedDate = new Date(event.date).toISOString().slice(0, 16);
    
    setFormTitle(event.title);
    setFormDescription(event.description || '');
    setFormDate(formattedDate);
    setFormLocation(event.location);
    setFormPrice(event.price);
    setFormCapacity(event.capacity);
    setFormReminderInterval(event.reminderInterval || '1_DAY');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitLoading(true);
    
    const payload = {
      title: formTitle,
      description: formDescription,
      date: new Date(formDate).toISOString(),
      location: formLocation,
      price: Number(formPrice),
      capacity: Number(formCapacity),
      reminderInterval: formReminderInterval,
    };

    try {
      if (editingEventId) {
        await api.put(`/events/${editingEventId}`, payload);
      } else {
        await api.post('/events', payload);
      }
      setIsFormOpen(false);
      loadDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save event');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This action will cancel all booked tickets.')) {
      return;
    }
    
    try {
      await api.delete(`/events/${eventId}`);
      if (selectedEventId === eventId) {
        setSelectedEventId(null);
      }
      loadDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const verifyScan = async (token: string) => {
    setScanChecking(true);
    setScanResult(null);
    setScanError(null);
    try {
      const response = await api.post('/tickets/verify-qr', { token });
      setScanResult(response.data);
      setScanToken('');
      loadDashboardData();
    } catch (err: any) {
      setScanError(err.response?.data?.message || 'Check-in validation failed');
    } finally {
      setScanChecking(false);
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyScan(scanToken);
  };

  const getOverallRevenue = () => {
    if (!stats) return 0;
    return stats.eventBreakdown.reduce((sum, ev) => sum + (ev.ticketsSold * ev.price), 0);
  };

  const getSelectedEventDetails = () => {
    return creatorEventsRaw.find((e) => e.id === selectedEventId);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !stats) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-zinc-950 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-zinc-950 text-white min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <LayoutDashboard className="h-8 w-8 text-indigo-500" />
          <h1 className="text-3xl font-bold tracking-tight text-white m-0">Creator Dashboard</h1>
        </div>
        <Button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-5 rounded-lg flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Create Event</span>
        </Button>
      </div>

      {error ? (
        <div className="text-center py-12 border border-zinc-800/60 rounded-xl bg-zinc-900/20 max-w-lg mx-auto">
          <p className="text-red-400 font-semibold">{error}</p>
          <Button onClick={loadDashboardData} className="mt-4 bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
            Retry
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-8">
          <TabsList className="flex h-auto w-full flex-row flex-wrap justify-start gap-1 bg-zinc-900 border border-zinc-800/80 rounded-lg p-1.5">
            <TabsTrigger
              value="analytics"
              className="flex-none px-4 py-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-300 hover:text-white"
            >
              Analytics Summary
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="flex-none px-4 py-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-300 hover:text-white"
            >
              Manage Events & Bookings
            </TabsTrigger>
            <TabsTrigger
              value="checkin"
              className="flex-none px-4 py-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-300 hover:text-white"
            >
              Check-In Gate
            </TabsTrigger>
          </TabsList>

          {/* 1. Analytics Summary Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Event count */}
              <Card className="border-zinc-800 bg-zinc-900/40 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Events Created</span>
                  <Calendar className="h-5 w-5 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">{stats?.lifetimeStats?.totalEventsCreated}</div>
                  <p className="text-xs text-zinc-500 mt-1">Lifetime total events</p>
                </CardContent>
              </Card>

              {/* Tickets sold */}
              <Card className="border-zinc-800 bg-zinc-900/40 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tickets Booked</span>
                  <Users className="h-5 w-5 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">{stats?.lifetimeStats?.totalTicketsSold}</div>
                  <p className="text-xs text-zinc-500 mt-1">Paid bookings across catalog</p>
                </CardContent>
              </Card>

              {/* Attendance rate */}
              <Card className="border-zinc-800 bg-zinc-900/40 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Attendance Rate</span>
                  <QrCode className="h-5 w-5 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">{stats?.lifetimeStats?.overallAttendanceRate}</div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {stats?.lifetimeStats?.totalScannedAttendees} check-ins processed
                  </p>
                </CardContent>
              </Card>

              {/* Revenue */}
              <Card className="border-zinc-800 bg-zinc-900/40 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Gross Sales</span>
                  <Coins className="h-5 w-5 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-emerald-500">{formatNaira(getOverallRevenue())}</div>
                  <p className="text-xs text-zinc-500 mt-1">Paid ticket sales revenue</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance breakdowns */}
            <Card className="border-zinc-800 bg-zinc-900/40 text-white">
              <CardHeader>
                <CardTitle className="text-xl">Event Sales Breakdown</CardTitle>
                <CardDescription className="text-zinc-500">Detailed performance metrics per event</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.eventBreakdown.length === 0 ? (
                  <p className="text-center py-6 text-zinc-500 text-sm">No events statistics available.</p>
                ) : (
                  <Table className="text-zinc-300">
                    <TableHeader className="border-zinc-800">
                      <TableRow>
                        <TableHead className="text-zinc-500 font-bold">Event Title</TableHead>
                        <TableHead className="text-zinc-500 font-bold">Event Date</TableHead>
                        <TableHead className="text-zinc-500 font-bold">Price</TableHead>
                        <TableHead className="text-zinc-500 font-bold">Sales Progress</TableHead>
                        <TableHead className="text-zinc-500 font-bold text-center">Attendance Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.eventBreakdown.map((ev) => {
                        const pct = (ev.ticketsSold / ev.capacity) * 100;
                        return (
                          <TableRow key={ev.eventId} className="border-zinc-800/60 hover:bg-zinc-900/20">
                            <TableCell className="font-semibold text-white">{ev.title}</TableCell>
                            <TableCell className="text-xs">{formatDate(ev.date)}</TableCell>
                            <TableCell className="font-medium text-emerald-500">{formatNaira(ev.price)}</TableCell>
                            <TableCell className="w-1/4">
                              <div className="space-y-1">
                                <Progress value={pct} className="h-1.5 bg-zinc-800 [&>div]:bg-indigo-500" />
                                <span className="text-[10px] text-zinc-500">
                                  {ev.ticketsSold} / {ev.capacity} sold
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono font-bold text-indigo-400 text-xs">
                              {ev.attendanceRate} ({ev.ticketsScanned} check-ins)
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. Manage Events & Bookings Tab */}
          <TabsContent value="events" className="space-y-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Event selection list */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2">Select Event</h3>
                {creatorEventsRaw.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No events found.</p>
                ) : (
                  creatorEventsRaw.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`cursor-pointer rounded-lg border p-4 transition-all flex items-center justify-between ${
                        selectedEventId === ev.id
                          ? 'border-indigo-600 bg-indigo-600/10'
                          : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1 truncate pr-2">
                        <h4 className="font-bold text-white text-sm truncate">{ev.title}</h4>
                        <p className="text-[10px] text-zinc-500">{formatDate(ev.date)}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-500 shrink-0" />
                    </div>
                  ))
                )}
              </div>

              {/* Booked attendees details table */}
              <div className="lg:col-span-2 space-y-4">
                {selectedEventId ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-3 gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-white">{getSelectedEventDetails()?.title}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Bookings roster and gate check-in status</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(getSelectedEventDetails())}
                          className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 bg-transparent flex items-center space-x-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteEvent(selectedEventId)}
                          className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white flex items-center space-x-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>

                    <Card className="border-zinc-800 bg-zinc-900/40 text-white">
                      <CardContent className="p-0">
                        {getSelectedEventDetails()?.tickets?.length === 0 ? (
                          <p className="text-center py-12 text-zinc-500 text-sm">No ticket bookings recorded yet.</p>
                        ) : (
                          <Table className="text-zinc-300">
                            <TableHeader className="border-zinc-800">
                              <TableRow>
                                <TableHead className="text-zinc-500 font-bold">Attendee Name</TableHead>
                                <TableHead className="text-zinc-500 font-bold">Email</TableHead>
                                <TableHead className="text-zinc-500 font-bold">Ref</TableHead>
                                <TableHead className="text-zinc-500 font-bold text-center">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getSelectedEventDetails()?.tickets?.map((t: any) => (
                                <TableRow key={t.id} className="border-zinc-800/60">
                                  <TableCell className="font-semibold text-white">{t.user?.name}</TableCell>
                                  <TableCell className="text-xs">{t.user?.email}</TableCell>
                                  <TableCell className="font-mono text-zinc-500 text-[10px]">{t.paymentReference}</TableCell>
                                  <TableCell className="text-center">
                                    {t.scanned ? (
                                      <span className="inline-flex items-center space-x-1 rounded bg-indigo-950 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/30">
                                        <span>Checked In</span>
                                      </span>
                                    ) : t.status === 'PAID' ? (
                                      <span className="inline-flex items-center space-x-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                                        Active
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center space-x-1 rounded bg-zinc-950 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                        {t.status}
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <p className="text-center py-12 text-zinc-500 text-sm">Select an event to view booked attendees.</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 3. Check-In Gate Tab */}
          <TabsContent value="checkin" className="max-w-2xl mx-auto">
            <Card className="border-zinc-800 bg-zinc-900/60 text-white shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 text-indigo-500 mb-2">
                  <QrCode className="h-full w-full" />
                </div>
                <CardTitle className="text-2xl font-bold">Simulated Check-In Scanner</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Scan QR with camera or paste verification token / ticket URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <QrCameraScanner
                  onScan={(decoded) => verifyScan(decoded)}
                  onError={(msg) => setScanError(msg)}
                />

                <form onSubmit={handleCheckInSubmit} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Paste verification token UUID..."
                    value={scanToken}
                    onChange={(e) => setScanToken(e.target.value)}
                    className="flex-grow bg-zinc-950 border-zinc-800 text-white focus-visible:ring-indigo-600 focus-visible:border-indigo-600"
                    required
                  />
                  <Button type="submit" disabled={scanChecking} className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-6 font-semibold">
                    {scanChecking ? 'Scanning...' : 'Verify Gate'}
                  </Button>
                </form>

                {/* Scan Results Console */}
                {scanError && (
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-red-500/20 bg-red-500/10 rounded-xl space-y-2 text-center">
                    <AlertTriangle className="h-10 w-10 text-red-500 animate-pulse" />
                    <h4 className="text-lg font-bold text-red-400">Access DENIED</h4>
                    <p className="text-sm text-zinc-400 max-w-sm">{scanError}</p>
                  </div>
                )}

                {scanResult && (
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-emerald-500/20 bg-emerald-500/10 rounded-xl space-y-2 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                    <h4 className="text-lg font-bold text-emerald-400">Access GRANTED</h4>
                    <div className="text-sm text-zinc-300 font-semibold mt-1">
                      Eventee: {scanResult.attendee}
                    </div>
                    <div className="text-xs text-zinc-500">
                      Email: {scanResult.email}
                    </div>
                    <div className="text-xs rounded bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-zinc-400 mt-2 font-mono">
                      Event: "{scanResult.eventTitle}"
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* 4. Create / Edit Event Form Dialog Modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && setIsFormOpen(false)}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {editingEventId ? 'Edit Event Details' : 'Create Event'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Provide event parameters. Tickets will be purchasable instantly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-3">
            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="form-title" className="text-zinc-300 text-xs">Event Title</Label>
              <Input
                id="form-title"
                type="text"
                placeholder="Summer Concert Series"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-indigo-600"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="form-desc" className="text-zinc-300 text-xs">Description</Label>
              <textarea
                id="form-desc"
                placeholder="A pulsating music performance..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                rows={3}
                required
              />
            </div>

            {/* Date & Venue */}
            <div className="grid grid-cols-1 gap-4">
              <DateTimePicker
                id="form-date"
                label="Date & Time"
                value={formDate}
                onChange={setFormDate}
              />
              <div className="space-y-1">
                <Label htmlFor="form-location" className="text-zinc-300 text-xs">Venue Location</Label>
                <Input
                  id="form-location"
                  type="text"
                  placeholder="Madison Square Garden"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-indigo-600"
                  required
                />
              </div>
            </div>

            {/* Price & Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="form-price" className="text-zinc-300 text-xs">Price (₦ NGN)</Label>
                <Input
                  id="form-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="29.99"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-indigo-600"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="form-capacity" className="text-zinc-300 text-xs">Total Capacity</Label>
                <Input
                  id="form-capacity"
                  type="number"
                  min="1"
                  placeholder="500"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-indigo-600"
                  required
                />
              </div>
            </div>

            {/* Reminder Interval */}
            <div className="space-y-1">
              <Label htmlFor="form-reminder" className="text-zinc-300 text-xs">Creator Reminder Default</Label>
              <select
                id="form-reminder"
                value={formReminderInterval}
                onChange={(e) => setFormReminderInterval(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                <option value="1_DAY">1 Day Before Event</option>
                <option value="1_WEEK">1 Week Before Event</option>
              </select>
            </div>

            <DialogFooter className="pt-3">
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  className="border-zinc-800 text-zinc-400 bg-transparent hover:bg-zinc-950"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formSubmitLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {formSubmitLoading ? 'Saving...' : 'Save Event'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
