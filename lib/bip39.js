import { validateMnemonic, wordlists } from 'bip39';

export const BIP39_WORDS = new Set(wordlists.english);

export function isValidBip39Word(word) {
  if (typeof word !== 'string') return false;
  return BIP39_WORDS.has(word.trim().toLowerCase());
}

export function isValidBip39Phrase(phrase) {
  if (typeof phrase !== 'string') return false;
  return validateMnemonic(phrase.trim().toLowerCase());
}
