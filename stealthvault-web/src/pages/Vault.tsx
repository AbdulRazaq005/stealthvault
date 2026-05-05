import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { decryptSecret, encryptSecret } from "@/services/crypto";
import { SecretType } from "@/types";
import type { Secret } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Key,
  FileText,
  Lock,
  Search,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Loader2,
  ShieldCheck,
  Copy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VaultUnlock from "@/components/VaultUnlock";

const secretTypeLabels: Record<SecretType, string> = {
  [SecretType.Credentials]: "Credentials",
  [SecretType.ApiKey]: "Password / Key",
  [SecretType.PlainText]: "Plain Text",
};

const secretTypeIcons: Record<SecretType, React.ReactNode> = {
  [SecretType.Credentials]: <Lock className="h-4 w-4" />,
  [SecretType.ApiKey]: <Key className="h-4 w-4" />,
  [SecretType.PlainText]: <FileText className="h-4 w-4" />,
};

interface SecretFormData {
  name: string;
  type: SecretType;
  // For credentials
  url: string;
  username: string;
  password: string;
  // For API key
  apiKey: string;
  // For plain text
  note: string;
}

const emptyForm: SecretFormData = {
  name: "",
  type: SecretType.Credentials,
  url: "",
  username: "",
  password: "",
  apiKey: "",
  note: "",
};

function serializeSecretData(form: SecretFormData): string {
  switch (form.type) {
    case SecretType.Credentials:
      return JSON.stringify({
        url: form.url,
        username: form.username,
        password: form.password,
      });
    case SecretType.ApiKey:
      return form.apiKey;
    case SecretType.PlainText:
      return form.note;
    default:
      return "";
  }
}

function deserializeSecretData(
  data: string,
  type: SecretType,
): Partial<SecretFormData> {
  switch (type) {
    case SecretType.Credentials:
      try {
        const parsed = JSON.parse(data);
        return {
          url: parsed.url || "",
          username: parsed.username || "",
          password: parsed.password || "",
        };
      } catch {
        return { url: "", username: "", password: data };
      }
    case SecretType.ApiKey:
      return { apiKey: data };
    case SecretType.PlainText:
      return { note: data };
    default:
      return {};
  }
}

const Vault: React.FC = () => {
  const { vaultKey, isVaultUnlocked } = useAuth();
  const { toast } = useToast();
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
  const [form, setForm] = useState<SecretFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Secret | null>(null);

  // View state
  const [viewSecret, setViewSecret] = useState<{
    secret: Secret;
    data: string;
  } | null>(null);
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set());

  const fetchSecrets = useCallback(async () => {
    try {
      const data = await apiService.getSecrets();
      setSecrets(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load secrets";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isVaultUnlocked) {
      fetchSecrets();
    }
  }, [fetchSecrets, isVaultUnlocked]);

  const openCreate = () => {
    setEditingSecret(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = async (secret: Secret) => {
    if (!vaultKey) return;
    try {
      const decrypted = await decryptSecret(
        secret.ciphertext,
        secret.iv,
        vaultKey,
      );
      const fields = deserializeSecretData(decrypted, secret.type);
      setForm({
        ...emptyForm,
        name: secret.name,
        type: secret.type,
        ...fields,
      });
      setEditingSecret(secret);
      setDialogOpen(true);
    } catch {
      toast({
        title: "Decryption Error",
        description: "Failed to decrypt secret for editing.",
        variant: "destructive",
      });
    }
  };

  const handleView = async (secret: Secret) => {
    if (!vaultKey) return;
    try {
      const decrypted = await decryptSecret(
        secret.ciphertext,
        secret.iv,
        vaultKey,
      );
      setViewSecret({ secret, data: decrypted });
      setRevealedFields(new Set());
    } catch {
      toast({
        title: "Decryption Error",
        description: "Failed to decrypt secret.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!vaultKey || !form.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const plaintext = serializeSecretData(form);
      const encrypted = await encryptSecret(plaintext, vaultKey);

      if (editingSecret) {
        await apiService.updateSecret(editingSecret.id, {
          name: form.name.trim(),
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
        });
        toast({
          title: "Updated",
          description: "Secret updated successfully.",
        });
      } else {
        await apiService.createSecret({
          name: form.name.trim(),
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          type: form.type,
        });
        toast({
          title: "Created",
          description: "Secret created successfully.",
        });
      }
      setDialogOpen(false);
      fetchSecrets();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save secret";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiService.deleteSecret(deleteTarget.id);
      toast({ title: "Deleted", description: "Secret deleted." });
      setDeleteTarget(null);
      fetchSecrets();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete secret";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const toggleReveal = (field: string) => {
    setRevealedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const filtered = secrets.filter((s) => {
    const matchesSearch = s.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || s.type === Number(filterType);
    return matchesSearch && matchesType;
  });

  if (!isVaultUnlocked) {
    return <VaultUnlock />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Your Vault
          </h1>
          <p className="mt-1 text-muted-foreground">
            {secrets.length} secret{secrets.length !== 1 ? "s" : ""} stored
          </p>
        </div>
        <Button onClick={openCreate} className="vault-gradient gap-2">
          <Plus className="h-4 w-4" /> Add Secret
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search secrets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="1">Credentials</SelectItem>
            <SelectItem value="2">Passwords / Keys</SelectItem>
            <SelectItem value="3">Plain Texts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Secrets Grid */}
      {filtered.length === 0 ? (
        <Card className="vault-card border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {secrets.length === 0
                ? "Your vault is empty"
                : "No secrets match your filters"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {secrets.length === 0
                ? "Add your first secret to get started."
                : "Try adjusting your search or filter."}
            </p>
            {secrets.length === 0 && (
              <Button
                onClick={openCreate}
                variant="outline"
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" /> Add Secret
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((secret) => (
              <motion.div
                key={secret.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="vault-card border-border hover:border-primary/30 transition-colors group cursor-pointer"
                  onClick={() => handleView(secret)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {secretTypeIcons[secret.type]}
                        </div>
                        <div>
                          <CardTitle className="text-base leading-tight">
                            {secret.name}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {secretTypeLabels[secret.type] || "Unknown"}
                          </Badge>
                        </div>
                      </div>
                      <div
                        className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(secret)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteTarget(secret)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground font-mono">
                      ••••••••••••
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingSecret ? "Edit Secret" : "New Secret"}
            </DialogTitle>
            <DialogDescription>
              {editingSecret
                ? "Update your encrypted secret."
                : "Add a new encrypted secret to your vault."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editingSecret && (
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={String(form.type)}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, type: Number(v) as SecretType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Credentials</SelectItem>
                    <SelectItem value="2">Password / Key</SelectItem>
                    <SelectItem value="3">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="My Secret"
              />
            </div>

            {form.type === SecretType.Credentials && (
              <>
                <div className="space-y-2">
                  <Label>URL (optional)</Label>
                  <Input
                    value={form.url}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, url: e.target.value }))
                    }
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={form.username}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, username: e.target.value }))
                    }
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}

            {form.type === SecretType.ApiKey && (
              <div className="space-y-2">
                <Label>Password / Key</Label>
                <Input
                  value={form.apiKey}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, apiKey: e.target.value }))
                  }
                  placeholder="*****..."
                  className="font-mono"
                />
              </div>
            )}

            {form.type === SecretType.PlainText && (
              <div className="space-y-2">
                <Label>Note</Label>
                <Textarea
                  value={form.note}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, note: e.target.value }))
                  }
                  placeholder="Your secret text..."
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="vault-gradient"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSecret ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Secret Dialog */}
      <Dialog open={!!viewSecret} onOpenChange={() => setViewSecret(null)}>
        <DialogContent className="sm:max-w-lg">
          {viewSecret && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  {secretTypeIcons[viewSecret.secret.type]}
                  {viewSecret.secret.name}
                </DialogTitle>
                <Badge variant="secondary" className="w-fit">
                  {secretTypeLabels[viewSecret.secret.type]}
                </Badge>
              </DialogHeader>
              <div className="space-y-3">
                {viewSecret.secret.type === SecretType.Credentials &&
                  (() => {
                    try {
                      const data = JSON.parse(viewSecret.data);
                      return (
                        <>
                          {data.url && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">
                                URL
                              </Label>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-mono flex-1 truncate">
                                  {data.url}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    copyToClipboard(data.url, "URL")
                                  }
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Username
                            </Label>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-mono flex-1">
                                {data.username}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  copyToClipboard(data.username, "Username")
                                }
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Password
                            </Label>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-mono flex-1">
                                {revealedFields.has("password")
                                  ? data.password
                                  : "••••••••••"}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => toggleReveal("password")}
                              >
                                {revealedFields.has("password") ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  copyToClipboard(data.password, "Password")
                                }
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </>
                      );
                    } catch {
                      return (
                        <p className="text-sm font-mono">{viewSecret.data}</p>
                      );
                    }
                  })()}

                {viewSecret.secret.type === SecretType.ApiKey && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Password / Key
                    </Label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono flex-1 break-all">
                        {revealedFields.has("apiKey")
                          ? viewSecret.data
                          : "••••••••••••••••••••"}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleReveal("apiKey")}
                      >
                        {revealedFields.has("apiKey") ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          copyToClipboard(viewSecret.data, "Password / Key")
                        }
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {viewSecret.secret.type === SecretType.PlainText && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Note
                    </Label>
                    <div className="flex items-start gap-2">
                      <p className="text-sm flex-1 whitespace-pre-wrap">
                        {viewSecret.data}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => copyToClipboard(viewSecret.data, "Note")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    openEdit(viewSecret.secret);
                    setViewSecret(null);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeleteTarget(viewSecret.secret);
                    setViewSecret(null);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Secret</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Vault;
