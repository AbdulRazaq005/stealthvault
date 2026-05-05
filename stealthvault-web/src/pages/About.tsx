import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Server,
  Key,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Zero-Knowledge Architecture",
    description:
      "Your master password never leaves your device. All encryption and decryption happens locally in your browser.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "AES-256-GCM Encryption",
    description:
      "Military-grade encryption protects every secret. Each entry uses unique initialization vectors.",
  },
  {
    icon: <Key className="h-6 w-6" />,
    title: "PBKDF2 Key Derivation",
    description:
      "600,000 iterations of PBKDF2-SHA256 protects against brute-force attacks on your master password.",
  },
  {
    icon: <EyeOff className="h-6 w-6" />,
    title: "Server Sees Nothing",
    description:
      "The server only stores encrypted blobs. Even with full database access, your secrets remain unreadable.",
  },
  {
    icon: <Server className="h-6 w-6" />,
    title: "Secure API Communication",
    description:
      "JWT-authenticated API with encrypted payloads ensures secure data transit between client and server.",
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Client-Side Only Decryption",
    description:
      "Secrets are decrypted in memory only when you need them, and never persisted in plaintext.",
  },
];

const About: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl vault-gradient vault-glow">
          <Shield className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-display mb-4">
          About <span className="text-primary">StealthVault</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A zero-knowledge secrets manager that ensures your sensitive data —
          credentials, Passwords / keys, and private notes — remains encrypted
          and accessible only to you.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Card className="vault-card h-full border-border hover:border-primary/20 transition-colors">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold font-display mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold font-display mb-4">How It Works</h2>
        <div className="max-w-3xl mx-auto space-y-4 text-left">
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full vault-gradient text-primary-foreground text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-medium">
                Create an account with a login password and a master password
              </p>
              <p className="text-sm text-muted-foreground">
                Your master password derives a key using PBKDF2, which encrypts
                a randomly generated vault key.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full vault-gradient text-primary-foreground text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Log in and unlock your vault</p>
              <p className="text-sm text-muted-foreground">
                Your master password decrypts the vault key locally, giving you
                access to your secrets.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full vault-gradient text-primary-foreground text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Add, view, and manage secrets</p>
              <p className="text-sm text-muted-foreground">
                Each secret is encrypted with AES-256-GCM before being sent to
                the server. Decryption only happens in your browser.
              </p>
            </div>
          </div>
        </div>

        <Link to="/signup" className="inline-block mt-8">
          <Button size="lg" className="vault-gradient gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default About;
