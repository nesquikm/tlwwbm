import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Tlwwbm } from "../target/types/tlwwbm";

export async function configCreate() {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  await program.methods.configInit().rpc();
}

export async function confingFetchData() {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  const [counterPDA] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );

  return await program.account.config.fetch(counterPDA);
}

export async function configSetTopicLockTime(lockTime: number) {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  await program.methods.configSetTopicLockTime(new anchor.BN(lockTime)).rpc();
}

export async function configDelete() {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  await program.methods.configDelete().rpc();
}

export async function newWallet() {
  let provider = anchor.AnchorProvider.env();

  let wallet = Keypair.generate();

  const airdropTxHash = await provider.connection.requestAirdrop(
    wallet.publicKey,
    2 * LAMPORTS_PER_SOL
  );

  const latestBlockHash = await provider.connection.getLatestBlockhash();

  await provider.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airdropTxHash,
  });

  return wallet;
}
