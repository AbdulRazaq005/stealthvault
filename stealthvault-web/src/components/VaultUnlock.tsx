import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const VaultUnlock: React.FC = () => {
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { unlockVault } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword.trim()) {
      toast({ title: 'Error', description: 'Master password is required.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await unlockVault(masterPassword);
      toast({ title: 'Vault Unlocked', description: 'Your vault is now accessible.' });
    } catch {
      toast({ title: 'Unlock Failed', description: 'Invalid master password. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
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
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Lock className="h-7 w-7 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-display">Vault Locked</CardTitle>
            <CardDescription>Enter your master password to unlock your vault</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="masterPassword">Master Password</Label>
                <div className="relative">
                  <Input
                    id="masterPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={masterPassword}
                    onChange={e => setMasterPassword(e.target.value)}
                    placeholder="Enter your master password"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Your master password never leaves this device.</p>
              </div>

              <Button type="submit" className="w-full vault-gradient" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Shield className="mr-2 h-4 w-4" />
                Unlock Vault
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VaultUnlock;
