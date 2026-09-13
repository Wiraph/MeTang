'use server';

import crypto from 'crypto';

/**
 * Server Action: Verify 6-digit PIN securely on the server
 * Prevents hardcoding PINs in client-side JS bundles or GitHub repository.
 */
export async function verifyPinAction(inputPin: string): Promise<boolean> {
  const targetPin = process.env.APP_PIN || '095225';

  if (!inputPin || inputPin.length !== 6) {
    return false;
  }

  // Constant-time timing-safe comparison to prevent timing attacks
  const inputBuffer = Buffer.from(inputPin);
  const targetBuffer = Buffer.from(targetPin);

  if (inputBuffer.length !== targetBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, targetBuffer);
}
