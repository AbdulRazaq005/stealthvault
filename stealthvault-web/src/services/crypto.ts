const PBKDF2_ITERATIONS = 600000;
const AES_KEY_LENGTH = 256;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function generateSalt(): string {
  return arrayBufferToBase64(generateRandomBytes(32).buffer as ArrayBuffer);
}

async function deriveKeyFromPassword(
  password: string,
  salt: string,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(base64ToArrayBuffer(salt)),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    true,
    ["encrypt", "decrypt"],
  );
}

async function generateVaultKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    true,
    ["encrypt", "decrypt"],
  );
}

async function encryptWithKey(
  data: ArrayBuffer,
  key: CryptoKey,
): Promise<{ ciphertext: string; iv: string }> {
  const iv = generateRandomBytes(12);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    new Uint8Array(data) as unknown as BufferSource,
  );
  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
  };
}

async function decryptWithKey(
  ciphertext: string,
  iv: string,
  key: CryptoKey,
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(base64ToArrayBuffer(iv)) as unknown as BufferSource,
    },
    key,
    new Uint8Array(base64ToArrayBuffer(ciphertext)) as unknown as BufferSource,
  );
}

// --- Public API ---

export async function generateRegistrationKeys(
  masterPassword: string,
): Promise<{
  salt: string;
  vaultKeyEncMaster: string;
  vaultKeyEncRecovery: string;
  recoveryKey: string;
}> {
  const salt = generateSalt();
  const masterDerivedKey = await deriveKeyFromPassword(masterPassword, salt);
  const vaultKey = await generateVaultKey();
  const vaultKeyRaw = await crypto.subtle.exportKey("raw", vaultKey);

  // Encrypt vault key with master-derived key
  const masterEncResult = await encryptWithKey(vaultKeyRaw, masterDerivedKey);
  const vaultKeyEncMaster = `${masterEncResult.iv}:${masterEncResult.ciphertext}`;

  // Generate a recovery key and encrypt vault key with it
  const recoveryKeyBytes = generateRandomBytes(32);
  const recoveryKey = arrayBufferToBase64(
    recoveryKeyBytes.buffer as ArrayBuffer,
  );
  const recoveryImported = await crypto.subtle.importKey(
    "raw",
    recoveryKeyBytes as unknown as BufferSource,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    false,
    ["encrypt"],
  );
  const recoveryEncResult = await encryptWithKey(vaultKeyRaw, recoveryImported);
  const vaultKeyEncRecovery = `${recoveryEncResult.iv}:${recoveryEncResult.ciphertext}`;

  return { salt, vaultKeyEncMaster, vaultKeyEncRecovery, recoveryKey };
}

export async function decryptVaultKey(
  masterPassword: string,
  salt: string,
  vaultKeyEncMaster: string,
): Promise<CryptoKey> {
  const masterDerivedKey = await deriveKeyFromPassword(masterPassword, salt);
  const [iv, ciphertext] = vaultKeyEncMaster.split(":");
  const vaultKeyRaw = await decryptWithKey(ciphertext, iv, masterDerivedKey);

  return crypto.subtle.importKey(
    "raw",
    new Uint8Array(vaultKeyRaw) as unknown as BufferSource,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function reEncryptVaultKeyWithNewPassword(
  vaultKey: CryptoKey,
  newPassword: string,
  salt: string,
): Promise<string> {
  const newDerivedKey = await deriveKeyFromPassword(newPassword, salt);
  const vaultKeyRaw = await crypto.subtle.exportKey("raw", vaultKey);

  const masterEncResult = await encryptWithKey(vaultKeyRaw, newDerivedKey);
  const vaultKeyEncMaster = `${masterEncResult.iv}:${masterEncResult.ciphertext}`;

  return vaultKeyEncMaster;
}

export async function verifyMasterPassword(
  masterPassword: string,
  salt: string,
  vaultKeyEncMaster: string,
): Promise<CryptoKey | null> {
  try {
    const masterDerivedKey = await deriveKeyFromPassword(masterPassword, salt);
    const [iv, ciphertext] = vaultKeyEncMaster.split(":");
    const vaultKeyRaw = await decryptWithKey(ciphertext, iv, masterDerivedKey);
    return masterDerivedKey;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function encryptSecret(
  plaintext: string,
  vaultKey: CryptoKey,
): Promise<{ ciphertext: string; iv: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  return encryptWithKey(data.buffer as ArrayBuffer, vaultKey);
}

export async function decryptSecret(
  ciphertext: string,
  iv: string,
  vaultKey: CryptoKey,
): Promise<string> {
  const decrypted = await decryptWithKey(ciphertext, iv, vaultKey);
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
