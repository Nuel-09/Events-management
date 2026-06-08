import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { User as UserIcon, Mail, AlertTriangle, Trash2, Save, KeyRound, Send } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile, sendTestEmail, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await updateProfile({
        currentPassword: user?.hasPassword ? currentPassword : undefined,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(user?.hasPassword ? 'Password updated successfully.' : 'Password set. You can now sign in with email and password.');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSendTestEmail = async () => {
    setError(null);
    setSuccess(null);
    setSendingTest(true);
    try {
      const message = await sendTestEmail();
      setSuccess(message);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Delete your account permanently? This removes your tickets, reminders, and events you created.',
    );
    if (!confirmed) return;

    setError(null);
    setDeleting(true);
    try {
      await deleteAccount();
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8 bg-background text-foreground min-h-[calc(100vh-4rem)]">
      <Card className="border-border bg-card text-card-foreground shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/15 border border-indigo-500/30">
              <UserIcon className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <CardTitle className="text-2xl">My Profile</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your account details
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-muted-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={user.email}
                readOnly
                className="pl-10 bg-muted border-border text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</span>
            <span className="rounded bg-indigo-600/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
              {user.role}
            </span>
          </div>

          <form onSubmit={handleSaveName} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Display Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background border-border"
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <Button
              type="submit"
              disabled={saving || name.trim() === user.name}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Name
                </>
              )}
            </Button>
          </form>

          <div className="border-t border-border pt-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-indigo-500" />
                {user.hasPassword ? 'Change Password' : 'Set Password'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {user.hasPassword
                  ? 'Enter your current password to choose a new one.'
                  : 'You signed in with Google. Set a password to also sign in with email and password.'}
              </p>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-3">
              {user.hasPassword && (
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-background border-border"
                    required
                    minLength={6}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-background border-border"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background border-border"
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                disabled={savingPassword}
                variant="outline"
                className="w-full border-border"
              >
                {savingPassword ? 'Updating...' : user.hasPassword ? 'Update Password' : 'Set Password'}
              </Button>
            </form>
          </div>

          <div className="border-t border-border pt-6 space-y-3">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Send className="h-4 w-4 text-indigo-500" />
                Email domain test
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Sends a test from <strong>no-reply@youreventful.org</strong> to your inbox. Use this after verifying the domain in Resend.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={sendingTest}
              onClick={handleSendTestEmail}
              className="w-full border-border"
            >
              {sendingTest ? 'Sending...' : 'Send Test Email'}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground text-center">
            Deleting your account is permanent and cannot be undone.
          </p>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
            className="w-full bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
