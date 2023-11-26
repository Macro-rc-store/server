export * from '../../../../../shared/utils/common.util';

export function isValid2faSecret(secret: string) {
  secret = secret.replace(/ /g, '');
  if (!secret) {
    return false;
  }
  const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  secret = secret.replace(/\s/g, "").toUpperCase();
  if (secret.length % 8 != 0) {
    return false;
  }
  for (let i = 0; i < secret.length; i++) {
    if (base32Chars.indexOf(secret.charAt(i)) < 0) {
      return false;
    }
  }
  return true;
}