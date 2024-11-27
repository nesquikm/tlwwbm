import { BN } from "@coral-xyz/anchor";

export const LAMPORTS_PER_SOL = 1_000_000_000;

export function formatSol(sol: BN) {
    return new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 9}).format(
    (Number(sol) / LAMPORTS_PER_SOL),
  ).replace(/,/g, '');
}
