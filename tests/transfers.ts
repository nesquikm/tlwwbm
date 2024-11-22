import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Tlwwbm } from "../target/types/tlwwbm";
import {
  configSet,
  configCreate,
  configDelete,
  topicFetchData,
  topicFetchLamports,
  getRentExemption,
} from "./helpers";

describe("transfers", () => {
  let provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;

  let author = provider.wallet.publicKey;

  const topics = ["First topic transfer", "Second topic transfer", "Third topic transfer", "Fourth topic transfer"];
  const comments = ["First comment", "Second comment", "Third comment"];
  const tFees = [100, 555];

  it("Create config", async () => {
    await configCreate();
    await configSet(0, tFees[0]);
  });

  it("When topic create, tFee", async () => {
    await program.methods.topicCreate(topics[0], comments[0]).rpc();

    let topicLamports = await topicFetchLamports(topics[0]);
    let rentExemption = await getRentExemption();

    // TODO: calculate rent exemption, add tFee and compare
    console.log("Topic lamports: ", topicLamports);
    console.log("tFee: ", tFees[0]);
    console.log("Rent exemption", rentExemption);
  });

  it("Delete config", async () => {
    await configDelete();
  });
});
