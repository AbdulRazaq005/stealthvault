import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Lock, Key, FileText } from "lucide-react";
import { motion } from "framer-motion";

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl vault-gradient vault-glow animate-pulse-glow">
          <Shield className="h-12 w-12 text-primary-foreground" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="text-5xl sm:text-6xl font-bold font-display mb-4 tracking-tight">
          Stealth<span className="text-primary">Secrets</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
          Your secrets, encrypted. Zero-knowledge architecture ensures only you
          can access your credentials, API keys, and private notes.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 mb-16"
      >
        {isAuthenticated ? (
          <Link to="/vault">
            <Button size="lg" className="vault-gradient gap-2 text-base px-8">
              Open Vault <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        ) : (
          <>
            <Link to="/signup">
              <Button size="lg" className="vault-gradient gap-2 text-base px-8">
                Get Started <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-base px-8">
                Login
              </Button>
            </Link>
          </>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl"
      >
        {[
          {
            icon: <Lock className="h-5 w-5" />,
            label: "Credentials",
            desc: "Securely store login details",
          },
          {
            icon: <Key className="h-5 w-5" />,
            label: "API Keys",
            desc: "Manage service tokens",
          },
          {
            icon: <FileText className="h-5 w-5" />,
            label: "Secure Notes",
            desc: "Encrypted text storage",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-6 vault-card"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {item.icon}
            </div>
            <span className="font-semibold font-display">{item.label}</span>
            <span className="text-sm text-muted-foreground">{item.desc}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Index;
