const LAMPORTS_PER_SOL = 1_000_000_000;

export function formatSol(sol: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', maximumSignificantDigits: 9, currency: 'SOL' }).format(
    sol / LAMPORTS_PER_SOL,
  );
}
