/**
 * AVA CRYPTOGRAPHIC ACCOUNTABILITY LAYER
 * Cryptographic Signatures & Verification
 * 
 * Core Principles:
 * - All decisions are cryptographically signed
 * - Tamper-proof audit trail
 * - Non-repudiation guarantees
 * - Verification at every layer
 */

import { createHash, createSign, createVerify, generateKeyPairSync, KeyObject } from 'crypto';

// ============================================
// CRYPTO TYPES
// ============================================

export interface CryptoKeyPair {
  publicKey: string;
  privateKey: string;
  keyId: string;
  createdAt: string;
  purpose: 'signing' | 'encryption' | 'both';
}

export interface SignedPayload {
  payload: any;
  signature: string;
  publicKeyId: string;
  algorithm: string;
  timestamp: string;
  nonce: string;
}

export interface VerificationResult {
  valid: boolean;
  publicKeyId: string;
  timestamp: string;
  verifiedAt: string;
  errors: string[];
}

export interface AuditProof {
  eventId: string;
  merkleRoot: string;
  merkleProof: string[];
  timestamp: string;
  signatures: AuditSignature[];
}

export interface AuditSignature {
  signerId: string;
  signature: string;
  publicKeyId: string;
  signedAt: string;
}

export interface IntegrityCheck {
  id: string;
  type: 'hash_chain' | 'merkle_tree' | 'signature' | 'full';
  status: 'valid' | 'invalid' | 'warning';
  checkedAt: string;
  details: {
    checked: number;
    valid: number;
    invalid: number;
    errors: string[];
  };
}

// ============================================
// CRYPTO ENGINE
// ============================================

export class CryptoEngine {
  private keyPairs: Map<string, { keyPair: CryptoKeyPair; publicKeyObj: KeyObject; privateKeyObj: KeyObject }> = new Map();
  private defaultKeyId: string | null = null;
  private integrityChecks: IntegrityCheck[] = [];
  private nonceCache: Set<string> = new Set();

  constructor() {
    // Generate initial key pair
    this.generateKeyPair('ava-primary', 'signing');
  }

  // ============================================
  // KEY MANAGEMENT
  // ============================================
  
  generateKeyPair(keyId: string, purpose: CryptoKeyPair['purpose']): CryptoKeyPair {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    
    const keyPair: CryptoKeyPair = {
      publicKey,
      privateKey,
      keyId,
      createdAt: new Date().toISOString(),
      purpose
    };
    
    this.keyPairs.set(keyId, {
      keyPair,
      publicKeyObj: createPublicKey(publicKey),
      privateKeyObj: createPrivateKey(privateKey)
    });
    
    if (!this.defaultKeyId) {
      this.defaultKeyId = keyId;
    }
    
    return keyPair;
  }

  getKeyPair(keyId: string): CryptoKeyPair | undefined {
    return this.keyPairs.get(keyId)?.keyPair;
  }

  getDefaultKey(): CryptoKeyPair | undefined {
    if (!this.defaultKeyId) return undefined;
    return this.getKeyPair(this.defaultKeyId);
  }

  // ============================================
  // SIGNING
  // ============================================
  
  sign(
    payload: any,
    keyId?: string
  ): SignedPayload {
    const kid = keyId || this.defaultKeyId;
    if (!kid) throw new Error('No signing key available');
    
    const keyData = this.keyPairs.get(kid);
    if (!keyData) throw new Error(`Key not found: ${kid}`);
    
    const timestamp = new Date().toISOString();
    const nonce = this.generateNonce();
    
    // Create canonical representation
    const canonicalData = this.canonicalize({
      payload,
      timestamp,
      nonce
    });
    
    // Create signature
    const signer = createSign('SHA256');
    signer.update(canonicalData);
    signer.end();
    
    const signature = signer.sign(keyData.privateKeyObj, 'base64');
    
    return {
      payload,
      signature,
      publicKeyId: kid,
      algorithm: 'RSA-SHA256',
      timestamp,
      nonce
    };
  }

  // ============================================
  // VERIFICATION
  // ============================================
  
  verify(signedPayload: SignedPayload): VerificationResult {
    const errors: string[] = [];
    
    // Check for replay attack
    if (this.nonceCache.has(signedPayload.nonce)) {
      return {
        valid: false,
        publicKeyId: signedPayload.publicKeyId,
        timestamp: signedPayload.timestamp,
        verifiedAt: new Date().toISOString(),
        errors: ['Nonce already used - possible replay attack']
      };
    }
    
    // Get public key
    const keyData = this.keyPairs.get(signedPayload.publicKeyId);
    if (!keyData) {
      return {
        valid: false,
        publicKeyId: signedPayload.publicKeyId,
        timestamp: signedPayload.timestamp,
        verifiedAt: new Date().toISOString(),
        errors: [`Unknown key: ${signedPayload.publicKeyId}`]
      };
    }
    
    // Recreate canonical data
    const canonicalData = this.canonicalize({
      payload: signedPayload.payload,
      timestamp: signedPayload.timestamp,
      nonce: signedPayload.nonce
    });
    
    // Verify signature
    try {
      const verifier = createVerify('SHA256');
      verifier.update(canonicalData);
      verifier.end();
      
      const valid = verifier.verify(keyData.publicKeyObj, signedPayload.signature, 'base64');
      
      if (valid) {
        this.nonceCache.add(signedPayload.nonce);
        // Clean old nonces (keep last 10000)
        if (this.nonceCache.size > 10000) {
          const nonces = Array.from(this.nonceCache);
          this.nonceCache = new Set(nonces.slice(-5000));
        }
      } else {
        errors.push('Signature verification failed');
      }
      
      return {
        valid,
        publicKeyId: signedPayload.publicKeyId,
        timestamp: signedPayload.timestamp,
        verifiedAt: new Date().toISOString(),
        errors
      };
    } catch (error: any) {
      return {
        valid: false,
        publicKeyId: signedPayload.publicKeyId,
        timestamp: signedPayload.timestamp,
        verifiedAt: new Date().toISOString(),
        errors: [`Verification error: ${error.message}`]
      };
    }
  }

  // ============================================
  // HASH UTILITIES
  // ============================================
  
  hash(data: any): string {
    const canonical = this.canonicalize(data);
    return createHash('sha256').update(canonical).digest('hex');
  }

  hashChain(items: any[]): string {
    let currentHash = '0'.repeat(64);
    
    for (const item of items) {
      const data = this.canonicalize({ previousHash: currentHash, item });
      currentHash = createHash('sha256').update(data).digest('hex');
    }
    
    return currentHash;
  }

  // ============================================
  // MERKLE TREE
  // ============================================
  
  buildMerkleTree(hashes: string[]): { root: string; proofs: Map<string, string[]> } {
    if (hashes.length === 0) {
      return { root: '', proofs: new Map() };
    }
    
    const proofs = new Map<string, string[]>();
    
    // Initialize proofs
    hashes.forEach((h, i) => proofs.set(h, []));
    
    let currentLevel = [...hashes];
    
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        
        const combined = createHash('sha256')
          .update(left + right)
          .digest('hex');
        
        nextLevel.push(combined);
        
        // Update proofs for leaf nodes
        if (i < hashes.length) {
          const leftProof = proofs.get(hashes[i]) || [];
          proofs.set(hashes[i], [...leftProof, right]);
        }
        if (i + 1 < hashes.length) {
          const rightProof = proofs.get(hashes[i + 1]) || [];
          proofs.set(hashes[i + 1], [...rightProof, left]);
        }
      }
      
      currentLevel = nextLevel;
    }
    
    return { root: currentLevel[0], proofs };
  }

  verifyMerkleProof(
    leaf: string,
    proof: string[],
    root: string
  ): boolean {
    let current = leaf;
    
    for (const sibling of proof) {
      current = createHash('sha256')
        .update(current + sibling)
        .digest('hex');
    }
    
    return current === root;
  }

  // ============================================
  // INTEGRITY CHECKS
  // ============================================
  
  runIntegrityCheck(
    events: Array<{ hash: string; previousHash: string }>,
    type: IntegrityCheck['type'] = 'full'
  ): IntegrityCheck {
    const errors: string[] = [];
    let valid = 0;
    let invalid = 0;
    
    // Check hash chain
    if (type === 'hash_chain' || type === 'full') {
      let previousHash = '0'.repeat(64);
      
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        
        if (event.previousHash !== previousHash) {
          errors.push(`Event ${i}: Hash chain broken`);
          invalid++;
        } else {
          valid++;
        }
        
        previousHash = event.hash;
      }
    }
    
    const check: IntegrityCheck = {
      id: `check_${Date.now()}`,
      type,
      status: errors.length === 0 ? 'valid' : 'invalid',
      checkedAt: new Date().toISOString(),
      details: {
        checked: events.length,
        valid,
        invalid,
        errors
      }
    };
    
    this.integrityChecks.push(check);
    
    return check;
  }

  getIntegrityChecks(): IntegrityCheck[] {
    return this.integrityChecks;
  }

  // ============================================
  // AUDIT PROOF GENERATION
  // ============================================
  
  generateAuditProof(
    eventId: string,
    eventHash: string,
    allHashes: string[],
    signerId: string
  ): AuditProof {
    const { root, proofs } = this.buildMerkleTree(allHashes);
    const merkleProof = proofs.get(eventHash) || [];
    
    // Sign the proof
    const proofData = {
      eventId,
      merkleRoot: root,
      timestamp: new Date().toISOString()
    };
    
    const signed = this.sign(proofData);
    
    return {
      eventId,
      merkleRoot: root,
      merkleProof,
      timestamp: new Date().toISOString(),
      signatures: [{
        signerId,
        signature: signed.signature,
        publicKeyId: signed.publicKeyId,
        signedAt: signed.timestamp
      }]
    };
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================
  
  private canonicalize(data: any): string {
    return JSON.stringify(data, Object.keys(data).sort());
  }

  private generateNonce(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let cryptoInstance: CryptoEngine | null = null;

export function getCryptoEngine(): CryptoEngine {
  if (!cryptoInstance) {
    cryptoInstance = new CryptoEngine();
  }
  return cryptoInstance;
}
