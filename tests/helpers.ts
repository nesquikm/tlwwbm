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
  const configPDA = getConfigPDA();

  return await program.account.config.fetch(configPDA);
}

export async function configSet(lockTime: number, tFee: number) {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  await program.methods.configSet(new anchor.BN(lockTime), new anchor.BN(tFee)).rpc();
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

export async function topicFetchData(topic: string) {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  const topicPDA = getTopicPDA(topic);

  return await program.account.topic.fetch(topicPDA);
}

export async function topicFetchLamports(topic: string) {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  const topicPDA = getTopicPDA(topic);

  let topicInfo = await program.account.topic.getAccountInfo(topicPDA);

  return topicInfo.lamports;
}

export async function getRentExemption() {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  return await program.provider.connection.getMinimumBalanceForRentExemption(program.account.topic.size);
}

function getConfigPDA() {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  const [configPDA] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );
  return configPDA;
}

function getTopicPDA(topic: string) {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  const [topicPDA] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(topic)],
    program.programId
  );
  return topicPDA;
}
