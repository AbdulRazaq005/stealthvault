# 🔐 StealthVault — Zero Knowledge Secrets Manager

A **privacy-first, zero-knowledge password & secrets manager** that ensures your sensitive data is **never accessible to the server** — not even in a breach scenario.

Built with a strong focus on **client-side encryption, secure key derivation, and minimal backend trust**.

---

## 🚀 Features

- 🔒 **Zero-Knowledge Architecture**  
  All encryption happens on the client. The server never sees plaintext data or master passwords.

- 🧠 **Client-Side Encryption (Web Crypto API)**  
  Secrets are encrypted before leaving the browser using modern cryptographic standards.

- 🧬 **Secure Key Derivation**  
  Uses PBKDF2 / Argon2 to derive strong encryption keys from user master passwords.

- 🛡️ **AES-256-GCM Encryption**  
  Ensures confidentiality, integrity, and tamper detection for stored secrets.

- ⚡ **Minimal Trust Backend**  
  Backend only stores encrypted blobs — no sensitive data exposure.

- 🔁 **Secure Authentication Flow**  
  Password verification via hashing — no plaintext credential transmission.

---

## 🏗️ Architecture Overview

```text
User (Browser)
   ↓
Master Password
   ↓
Key Derivation (PBKDF2 / Argon2)
   ↓
Encryption (AES-GCM)
   ↓
Encrypted Data → Backend (ASP.NET Core API)
```

### Key Principles

- Server is **stateless and untrusted**
- Encryption keys are **never stored**
- All cryptographic operations happen **client-side**

---

## 🧰 Tech Stack

### Frontend
- React / Vite
- Web Crypto API

### Backend
- ASP.NET Core Web API
- RESTful architecture

### Security
- AES-256-GCM (encryption)
- PBKDF2 / Argon2 (key derivation)
- Secure hashing for authentication

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/AbdulRazaq005/stealthvault.git
cd stealthvault
```

### 2. Setup Backend
```bash
cd StealthVault
dotnet restore
dotnet run
```

### 3. Setup Frontend
```bash
cd stealthvault-web
npm install
npm run dev
```
