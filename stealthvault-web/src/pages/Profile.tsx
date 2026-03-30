import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/services/api';
import { reEncryptVaultKeyWithNewPassword } from '@/services/crypto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Shield, Sun, Moon, Loader2, Eye, EyeOff, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { user, vaultKey, salt, autoLockMinutes, setAutoLockMinutes, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Login password update
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [confirmLoginPassword, setConfirmLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [updatingLogin, setUpdatingLogin] = useState(false);

  // Master password update
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
  const [showMasterPw, setShowMasterPw] = useState(false);
  const [updatingMaster, setUpdatingMaster] = useState(false);

  const handleUpdateLoginPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLoginPassword !== confirmLoginPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (newLoginPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (!vaultKey || !salt) return;

    setUpdatingLogin(true);
    try {
      const keys = await reEncryptVaultKeyWithNewPassword(vaultKey, newMasterPassword || 'unchanged', salt);
      await apiService.updatePassword({
        password: newLoginPassword,
        vaultKeyEncMaster: keys.vaultKeyEncMaster,
        vaultKeyEncRecovery: keys.vaultKeyEncRecovery,
      });
      toast({ title: 'Success', description: 'Login password updated. Please log in again.' });
      setNewLoginPassword('');
      setConfirmLoginPassword('');
      logout();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update password';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setUpdatingLogin(false);
    }
  };

  const handleUpdateMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMasterPassword !== confirmMasterPassword) {
      toast({ title: 'Error', description: 'Master passwords do not match.', variant: 'destructive' });
      return;
    }
    if (newMasterPassword.length < 8) {
      toast({ title: 'Error', description: 'Master password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (!vaultKey || !salt) return;

    setUpdatingMaster(true);
    try {
      const keys = await reEncryptVaultKeyWithNewPassword(vaultKey, newMasterPassword, salt);
      await apiService.updatePassword({
        password: '',
        vaultKeyEncMaster: keys.vaultKeyEncMaster,
        vaultKeyEncRecovery: keys.vaultKeyEncRecovery,
      });
      toast({ title: 'Success', description: 'Master password updated. Please log in again with the new master password.' });
      setNewMasterPassword('');
      setConfirmMasterPassword('');
      logout();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update master password';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setUpdatingMaster(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-display mb-8 flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          Profile
        </h1>

        {/* User Info */}
        <Card className="vault-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-display">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Username</span>
              <span className="text-sm font-mono">{user?.username}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{user?.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Theme & Auto-Lock */}
        <Card className="vault-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Choose your preferred theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className={theme === 'light' ? 'vault-gradient' : ''}
              >
                <Sun className="mr-2 h-4 w-4" /> Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className={theme === 'dark' ? 'vault-gradient' : ''}
              >
                <Moon className="mr-2 h-4 w-4" /> Dark
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Lock Setting */}
        <Card className="vault-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              Auto-Lock
            </CardTitle>
            <CardDescription>
              Automatically lock your vault after a period of inactivity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lock after inactivity</span>
              <span className="text-sm font-bold font-mono text-primary">{autoLockMinutes} min</span>
            </div>
            <Slider
              value={[autoLockMinutes]}
              onValueChange={([v]) => setAutoLockMinutes(v)}
              min={1}
              max={30}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 min</span>
              <span>30 min</span>
            </div>
          </CardContent>
        </Card>

        {/* Update Login Password */}
        <Card className="vault-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Update Login Password
            </CardTitle>
            <CardDescription>Change your account login password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateLoginPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showLoginPw ? 'text' : 'password'}
                    value={newLoginPassword}
                    onChange={e => setNewLoginPassword(e.target.value)}
                    placeholder="New login password"
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowLoginPw(!showLoginPw)}>
                    {showLoginPw ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmLoginPassword}
                  onChange={e => setConfirmLoginPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button type="submit" disabled={updatingLogin}>
                {updatingLogin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Update Master Password */}
        <Card className="vault-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Update Master Password
            </CardTitle>
            <CardDescription>
              Your master password encrypts your vault key. Changing it will re-encrypt your vault key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateMasterPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>New Master Password</Label>
                <div className="relative">
                  <Input
                    type={showMasterPw ? 'text' : 'password'}
                    value={newMasterPassword}
                    onChange={e => setNewMasterPassword(e.target.value)}
                    placeholder="New master password"
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowMasterPw(!showMasterPw)}>
                    {showMasterPw ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm Master Password</Label>
                <Input
                  type="password"
                  value={confirmMasterPassword}
                  onChange={e => setConfirmMasterPassword(e.target.value)}
                  placeholder="Confirm master password"
                />
              </div>
              <Button type="submit" disabled={updatingMaster} className="vault-gradient">
                {updatingMaster && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Master Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;
