export enum SecretType {
  Credentials = 1,
  ApiKey = 2,
  PlainText = 3,
}

export interface Secret {
  id: string;
  name: string;
  ciphertext: string;
  userId: string;
  iv: string;
  type: SecretType;
}

export interface DecryptedSecret extends Secret {
  decryptedData: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  errorMessage: string | null;
  userId: string;
  name: string;
  username: string;
  email: string;
  token: string;
  salt: string;
  vaultKeyEncMaster: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  salt: string;
  vaultKeyEncMaster: string;
  vaultKeyEncRecovery: string;
}

export interface UpdatePasswordRequest {
  password: string;
  newPassword: string | null;
  vaultKeyEncMaster: string | null;
}

export interface CreateSecretRequest {
  name: string;
  ciphertext: string;
  iv: string;
  type: SecretType;
}

export interface UpdateSecretRequest {
  name: string;
  ciphertext: string;
}

export interface BaseResponse {
  isSuccess: boolean;
  errorMessage: string | null;
}

export interface User {
  userId: string;
  name: string;
  username: string;
  email: string;
}

export interface CredentialData {
  url?: string;
  username: string;
  password: string;
}
