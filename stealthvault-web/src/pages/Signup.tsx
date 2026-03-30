import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '@/services/api';
import { generateRegistrationKeys } from '@/services/crypto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff, Loader2, Copy, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmMaster, setConfirmMaster] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMaster, setShowMaster] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim() || !masterPassword.trim()) {
      toast({ title: 'Error', description: 'All fields are required.', variant: 'destructive' });
      return;
    }
    if (masterPassword !== confirmMaster) {
      toast({ title: 'Error', description: 'Master passwords do not match.', variant: 'destructive' });
      return;
    }
    if (masterPassword.length < 8) {
      toast({ title: 'Error', description: 'Master password must be at least 8 characters.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const keys = await generateRegistrationKeys(masterPassword);

      const response = await apiService.register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        salt: keys.salt,
        vaultKeyEncMaster: keys.vaultKeyEncMaster,
        vaultKeyEncRecovery: keys.vaultKeyEncRecovery,
      });

      if (!response.isSuccess) {
        throw new Error(response.errorMessage || 'Registration failed');
      }

      setRecoveryKey(keys.recoveryKey);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast({ title: 'Registration Failed', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryKey = () => {
    if (recoveryKey) {
      navigator.clipboard.writeText(recoveryKey);
      toast({ title: 'Copied!', description: 'Recovery key copied to clipboard.' });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="vault-card border-border">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl vault-gradient vault-glow">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-display">Create Your Vault</CardTitle>
            <CardDescription>Set up your zero-knowledge encrypted vault</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="johndoe" autoComplete="username" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Login Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your login password"
                    autoComplete="new-password"
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="masterPassword">Master Password</Label>
                <div className="relative">
                  <Input
                    id="masterPassword"
                    type={showMaster ? 'text' : 'password'}
                    value={masterPassword}
                    onChange={e => setMasterPassword(e.target.value)}
                    placeholder="Your master encryption password"
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowMaster(!showMaster)}>
                    {showMaster ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Used to encrypt your vault. Never sent to the server.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmMaster">Confirm Master Password</Label>
                <Input
                  id="confirmMaster"
                  type="password"
                  value={confirmMaster}
                  onChange={e => setConfirmMaster(e.target.value)}
                  placeholder="Confirm master password"
                />
              </div>

              <Button type="submit" className="w-full vault-gradient" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Vault
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recovery Key Dialog */}
      <Dialog open={!!recoveryKey} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Save Your Recovery Key
            </DialogTitle>
            <DialogDescription>
              This key is shown only once. Store it safely — you'll need it if you forget your master password.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-4 font-mono text-sm break-all select-all">
            {recoveryKey}
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={copyRecoveryKey}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button
              onClick={() => {
                setRecoveryKey(null);
                navigate('/login');
              }}
              className="vault-gradient"
            >
              I've Saved It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
