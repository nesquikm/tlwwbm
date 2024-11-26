import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Tlwwbm } from "../target/types/tlwwbm";

export async function configCreate(authority: Keypair = undefined) {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  await program.methods
    .configInit()
    .accounts({ authority: authority?.publicKey })
    .signers(authority ? [authority] : [])
    .rpc();
}

export async function confingFetchData() {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  const configPDA = getConfigPDA();

  return await program.account.config.fetch(configPDA);
}

export async function configSet(
  lockTime: number,
  tFee: number,
  cFee: number,
  cFeeIncrement: number,
  topicAuthorShare: number,
  lastCommentAuthorShare: number,
  authority: Keypair = undefined
) {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  return program.methods
    .configSet(
      new anchor.BN(lockTime),
      new anchor.BN(tFee),
      new anchor.BN(cFee),
      new anchor.BN(cFeeIncrement),
      topicAuthorShare,
      lastCommentAuthorShare
    )
    .accounts({ authority: authority?.publicKey })
    .signers(authority ? [authority] : [])
    .rpc();
}

export async function configDelete(authority: Keypair = undefined) {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  await program.methods
    .configDelete()
    .accounts({ authority: authority?.publicKey })
    .signers(authority ? [authority] : [])
    .rpc();
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

export async function accountFetchLamports(account: PublicKey) {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;

  let accountInfo = await program.provider.connection.getAccountInfo(account);

  return accountInfo.lamports;
}

export async function getRentExemption() {
  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;
  return await program.provider.connection.getMinimumBalanceForRentExemption(
    program.account.topic.size
  );
}

export function nearlyEqual(a: number, b: number, epsilon: number = 0.0000001) {
  return Math.abs(a - b) < epsilon;
}

export function assertNearlyEqual(
  a: number,
  b: number,
  epsilon: number = 0.0000001
) {
  if (!nearlyEqual(a, b, epsilon)) {
    throw new Error(`Expected ${a} to be nearly equal to ${b}`);
  }
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
