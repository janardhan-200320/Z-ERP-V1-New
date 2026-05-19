import { safeGetItem, safeSetItem } from '@/lib/storage';

export type ESignatureProfile = {
  id: string;
  signerName: string;
  designation: string;
  mode: 'uploaded' | 'typed' | 'drawn';
  signatureLabel: string;
  fileName?: string;
  fileDataUrl?: string;
  isDefault: boolean;
  updatedAt: string;
};

export const ESIGN_SIGNATURES_STORAGE_KEY = 'settings.esign.signatures';
export const ESIGN_SIGNATURES_UPDATED_EVENT = 'eSignaturesUpdated';

const DEFAULT_ESIGNATURES: ESignatureProfile[] = [
  {
    id: 'esign-default-1',
    signerName: 'Zedunix ERP Admin',
    designation: 'Authorized Signatory',
    mode: 'typed',
    signatureLabel: 'Zedunix ERP Admin',
    isDefault: true,
    updatedAt: new Date().toISOString(),
  },
];

const isValidSignatureProfile = (signature: any): signature is ESignatureProfile => {
  return (
    !!signature
    && typeof signature.id === 'string'
    && typeof signature.signerName === 'string'
    && typeof signature.designation === 'string'
    && typeof signature.signatureLabel === 'string'
  );
};

export const getESignatureProfiles = (): ESignatureProfile[] => {
  const stored = safeGetItem<ESignatureProfile[]>(ESIGN_SIGNATURES_STORAGE_KEY, DEFAULT_ESIGNATURES);
  if (!Array.isArray(stored)) {
    return DEFAULT_ESIGNATURES;
  }

  const valid = stored.filter(isValidSignatureProfile);
  if (valid.length === 0) {
    return DEFAULT_ESIGNATURES;
  }

  const hasDefault = valid.some((signature) => signature.isDefault);
  if (!hasDefault) {
    return valid.map((signature, index) => ({ ...signature, isDefault: index === 0 }));
  }

  return valid;
};

export const saveESignatureProfiles = (profiles: ESignatureProfile[]): void => {
  const normalized = profiles.map((signature, index) => ({
    ...signature,
    isDefault: signature.isDefault || (!profiles.some((item) => item.isDefault) && index === 0),
  }));

  safeSetItem(ESIGN_SIGNATURES_STORAGE_KEY, normalized);
  window.dispatchEvent(new Event(ESIGN_SIGNATURES_UPDATED_EVENT));
};

export const setDefaultESignatureProfile = (id: string): void => {
  const signatures = getESignatureProfiles();
  const updated = signatures.map((signature) => ({
    ...signature,
    isDefault: signature.id === id,
  }));
  saveESignatureProfiles(updated);
};

export const getDefaultESignatureProfile = (): ESignatureProfile | null => {
  const signatures = getESignatureProfiles();
  return signatures.find((signature) => signature.isDefault) ?? signatures[0] ?? null;
};

export const removeESignatureProfile = (id: string): void => {
  const signatures = getESignatureProfiles().filter((signature) => signature.id !== id);
  if (signatures.length === 0) {
    saveESignatureProfiles([]);
    return;
  }

  if (!signatures.some((signature) => signature.isDefault)) {
    signatures[0].isDefault = true;
  }

  saveESignatureProfiles(signatures);
};

export const upsertESignatureProfile = (profile: Omit<ESignatureProfile, 'id' | 'updatedAt'> & { id?: string }): ESignatureProfile => {
  const signatures = getESignatureProfiles();
  const id = profile.id ?? `esign-${Date.now()}`;
  const updatedProfile: ESignatureProfile = {
    ...profile,
    id,
    updatedAt: new Date().toISOString(),
  };

  const exists = signatures.some((signature) => signature.id === id);
  const updated = exists
    ? signatures.map((signature) => (signature.id === id ? updatedProfile : signature))
    : [...signatures, updatedProfile];

  if (updatedProfile.isDefault) {
    saveESignatureProfiles(updated.map((signature) => ({
      ...signature,
      isDefault: signature.id === id,
    })));
  } else {
    saveESignatureProfiles(updated);
  }

  return updatedProfile;
};
