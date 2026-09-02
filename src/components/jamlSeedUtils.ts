export function normalizeJamlSeed(seed: string): string {
  return seed
    .toUpperCase()
    .replace(/0/g, "O")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

const SEED_ALPHABET = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function randomLength8Seeds(count: number): string[] {
  const out: string[] = [];
  const bytes = new Uint8Array(count * 8);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < count; i++) {
    let seed = "";
    for (let j = 0; j < 8; j++) {
      seed += SEED_ALPHABET[bytes[i * 8 + j]! % SEED_ALPHABET.length]!;
    }
    out.push(seed);
  }
  return out;
}
