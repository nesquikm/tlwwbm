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
import { assert } from "chai";

describe("transfers", () => {
  let provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;

  let author = provider.wallet.publicKey;

  const topics = [
    "First topic transfer",
    "Second topic transfer",
    "Third topic transfer",
    "Fourth topic transfer",
  ];
  const comments = ["First comment", "Second comment", "Third comment", "Fourth comment"];
  const tFees = [100, 555];
  const cFees = [200, 666];
  const cFeeIncrement = [444, 777];

  it("Create config", async () => {
    await configCreate();
  });

  it("When create topic, tFee", async () => {
    await configSet(0, tFees[0], cFees[0], cFeeIncrement[0]);
    await program.methods.topicCreate(topics[0], comments[0]).rpc();

    await configSet(0, tFees[1], cFees[0], cFeeIncrement[0]);
    await program.methods.topicCreate(topics[1], comments[0]).rpc();

    let topicLamports = [
      await topicFetchLamports(topics[0]),
      await topicFetchLamports(topics[1]),
    ];

    assert.equal(tFees[1] - tFees[0], topicLamports[1] - topicLamports[0]);
  });

  it("When comment topic create, cFee and cFeeMultiplier", async () => {
    await configSet(0, tFees[0], cFees[0], cFeeIncrement[0]);
    await program.methods.topicCreate(topics[2], comments[0]).rpc();

    let justCreated = await topicFetchLamports(topics[2]);

    await program.methods.topicComment(topics[2], comments[1]).rpc();

    let afterOneComment = await topicFetchLamports(topics[2]);

    await program.methods.topicComment(topics[2], comments[2]).rpc();

    let afterTwoComments = await topicFetchLamports(topics[2]);

    await program.methods.topicComment(topics[2], comments[3]).rpc();

    let afterThreeComments = await topicFetchLamports(topics[2]);

    assert.equal(afterOneComment - justCreated, cFees[0]);
    assert.equal(afterTwoComments - afterOneComment, cFees[0] + cFeeIncrement[0]);
    assert.equal(afterThreeComments - afterTwoComments, cFees[0] + cFeeIncrement[0] * 2);
  });

  it("Delete config", async () => {
    await configDelete();
  });
});
