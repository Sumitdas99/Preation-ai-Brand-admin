import fernet from 'fernet';
import { ENCRYPTION_KEY } from '../environment';
import { Buffer } from "buffer";

// Polyfill Buffer for fernet if not already present
if (typeof window !== 'undefined' && !window.Buffer) {
    window.Buffer = Buffer;
}

/**
 * Encrypt request payload using Fernet (symmetric encryption).
 * Compatible with Python's cryptography.fernet.Fernet default implementation.
 * 
 * @param payload Object to encrypt
 * @returns EncryptedPayload envelope or original payload if key missing
 */
export const encryptPayload = (payload: any): any => {
    // If no key configured, return original payload (or could throw error)
    if (!ENCRYPTION_KEY) {
        console.warn("VITE_ENCRYPTION_KEY not set. Skipping encryption.");
        return payload;
    }

    try {
        // Initialize secret
        const secret = new fernet.Secret(ENCRYPTION_KEY);

        // Create token instance
        // Note: fernet js library automatically handles IV and timestamp generation during encode
        const token = new fernet.Token({
            secret: secret,
            ttl: 0 // 0 = no expiry check on encryption side (backend handles it)
        });

        // Serialize payload
        const jsonStr = JSON.stringify(payload);

        // Encrypt (Products a valid Fernet token string)
        const fernetToken = token.encode(jsonStr);

        // Backend expects the token to be Base64 encoded AGAIN (Double Encoding)
        // Matches python: base64.b64encode(cipher.encrypt(bytes)).decode()
        const encryptedData = Buffer.from(fernetToken).toString('base64');

        // Return envelope matching backend schema
        return {
            encrypted_data: encryptedData,
            timestamp: new Date().toISOString(),
            version: "1.0"
        };
    } catch (error) {
        console.error("Payload encryption failed:", error);
        // Determine policy: Fail closed or open? 
        // Usually fail closed for security features.
        throw new Error("Failed to encrypt sensitive data.");
    }
};

/**
 * Decrypt response payload using Fernet (symmetric encryption).
 * 
 * @param envelope Response object containing encrypted_data
 * @returns Decrypted payload (JSON object) or original envelope if no encryption found
 */
export const decryptPayload = (envelope: any): any => {
    // Check if this looks like an encrypted envelope
    if (!envelope || !envelope.encrypted_data || ENCRYPTION_KEY === "") {
        return envelope;
    }

    try {
        // Initialize secret
        const secret = new fernet.Secret(ENCRYPTION_KEY);

        // Backend sends Double Base64 Encoded token
        // We must decode the outer layer first to get the actual Fernet token
        const fernetToken = Buffer.from(envelope.encrypted_data, 'base64').toString('utf-8');

        // Create token instance
        const token = new fernet.Token({
            secret: secret,
            token: fernetToken,
            ttl: 0
        });

        // Decrypt
        const decryptedJson = token.decode();

        // Deserialize
        return JSON.parse(decryptedJson);
    } catch (error) {
        console.warn("Payload decryption failed, using original data:", error);
        // Fallback or throw?
        // If server sent encrypted data but we failed to decrypt, it's garbage.
        throw new Error("Failed to decrypt server response.");
    }
};
