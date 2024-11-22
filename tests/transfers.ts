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
} from "./helpers";

describe("transfers", () => {
  let provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;

  let author = provider.wallet.publicKey;

  const topics = ["First topic transfer", "Second topic transfer", "Third topic transfer", "Fourth topic transfer"];
  const comments = ["First comment", "Second comment", "Third comment"];

  it("Create config", async () => {
    await configCreate();
    await configSet(0, 100);
  });

  it("When topic create, tFee", async () => {
    await program.methods.topicCreate(topics[0], comments[0]).rpc();

    let topicLamports = await topicFetchLamports(topics[0]);

    // TODO: calculate rent exemption, add tFee and compare
    console.log(topicLamports);
  });

  it("Delete config", async () => {
    await configDelete();
  });
});
