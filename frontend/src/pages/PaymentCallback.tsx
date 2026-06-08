import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle2, XCircle, ShieldCheck, AlertTriangle } from 'lucide-react';

export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const eventIdFromUrl = searchParams.get('eventId');

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyTransaction = async () => {
      if (!reference) {
        setError('No payment reference found in callback.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/payments/verify/${reference}`);
        setTicket(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Transaction verification failed.');
      } finally {
        setLoading(false);
      }
    };

    verifyTransaction();
  }, [reference]);

  useEffect(() => {
    if (!ticket || error) return;

    const eventId = ticket.event?.id || eventIdFromUrl;
    if (!eventId) return;

    const timer = window.setTimeout(() => {
      navigate(`/events/${eventId}`, {
        replace: true,
        state: { paymentSuccess: true, ticketId: ticket.id },
      });
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [ticket, error, eventIdFromUrl, navigate]);

  const eventId = ticket?.event?.id || eventIdFromUrl;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <h3 className="text-xl font-semibold">Verifying Payment...</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Please do not refresh the page. We are securely validating your transaction with Paystack.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12 text-foreground">
      {error ? (
        <Card className="w-full max-w-md border-border bg-card/60 backdrop-blur-md text-card-foreground text-center">
          <CardHeader>
            <div className="mx-auto h-12 w-12 text-red-500 mb-2">
              <XCircle className="h-full w-full" />
            </div>
            <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
            <CardDescription className="text-muted-foreground">
              There was a problem verifying your ticket purchase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 justify-center">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              If you have been debited, please contact Eventful support with reference:{' '}
              <code className="text-xs bg-muted text-muted-foreground px-1 py-0.5 rounded">{reference}</code>.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 justify-center">
            {reference && (
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  api
                    .get(`/payments/verify/${reference}`)
                    .then((res) => {
                      setTicket(res.data);
                      setLoading(false);
                    })
                    .catch((err) => {
                      setError(err.response?.data?.message || 'Retry failed');
                      setLoading(false);
                    });
                }}
              >
                Retry Verification
              </Button>
            )}
            <Link to="/events" className="w-full">
              <Button variant="outline" className="w-full border-border">
                Back to Events
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-md border-border bg-card/60 backdrop-blur-md text-card-foreground text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-indigo-500" />
          <CardHeader>
            <div className="mx-auto h-14 w-14 text-emerald-400 mb-2 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Payment Confirmed!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your ticket has been booked. A confirmation email is on its way.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="mx-auto w-44 h-44 bg-white p-2.5 rounded-xl border border-border shadow-inner flex items-center justify-center">
              {ticket?.qrCodeUrl ? (
                <img
                  src={ticket.qrCodeUrl}
                  alt="Ticket QR Code Verification Token"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-muted-foreground text-xs">QR Code Missing</div>
              )}
            </div>

            <div className="rounded-lg bg-muted border border-border p-4 text-left space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground font-bold uppercase tracking-wider">
                <span>Verification Details</span>
              </div>
              <div className="text-sm font-semibold text-foreground">{ticket?.event?.title}</div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-border text-muted-foreground">
                <div>
                  <span className="block font-medium">Ticket ID</span>
                  <span className="font-mono truncate block max-w-[120px]">{ticket?.id}</span>
                </div>
                <div>
                  <span className="block font-medium">Ref</span>
                  <span className="font-mono truncate block max-w-[120px]">{ticket?.paymentReference}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 justify-center text-[10px] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Redirecting you back to the event page…</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {eventId && (
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
                onClick={() =>
                  navigate(`/events/${eventId}`, {
                    replace: true,
                    state: { paymentSuccess: true, ticketId: ticket.id },
                  })
                }
              >
                Back to Event
              </Button>
            )}
            <Link to="/tickets" className="w-full">
              <Button variant="outline" className="w-full border-border">
                View My Tickets
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
