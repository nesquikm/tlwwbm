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
  const comments = [
    "First comment",
    "Second comment",
    "Third comment",
    "Fourth comment",
  ];
  const tFees = [100, 555];
  const cFees = [200, 666];
  const cFeeIncrements = [444, 777];
  const feeMultipliers = [new anchor.BN(1), new anchor.BN(3)];

  it("Create config", async () => {
    await configCreate();
  });

  async function testTopicCreate(feeMultiplier) {
    const topicsWithMultipliers = [
      `${topics[0]} ${feeMultiplier}`,
      `${topics[1]} ${feeMultiplier}`,
    ];

    await configSet(0, tFees[0], cFees[0], cFeeIncrements[0]);
    await program.methods
      .topicCreate(topicsWithMultipliers[0], comments[0], feeMultiplier)
      .rpc();

    await configSet(0, tFees[1], cFees[0], cFeeIncrements[0]);
    await program.methods
      .topicCreate(topicsWithMultipliers[1], comments[0], feeMultiplier)
      .rpc();

    let topicLamports = [
      await topicFetchLamports(topicsWithMultipliers[0]),
      await topicFetchLamports(topicsWithMultipliers[1]),
    ];

    assert.equal(topicLamports[1] - topicLamports[0], (tFees[1] - tFees[0]) * feeMultiplier);
  }

  it(`When create topic, tFee, feeMultiplier = ${feeMultipliers[0]}`, async () => {
    await testTopicCreate(feeMultipliers[0]);
  });

  it(`When create topic, tFee, feeMultiplier = ${feeMultipliers[1]}`, async () => {
    await testTopicCreate(feeMultipliers[1]);
  });

  async function testTpoicCreateComment(feeMultiplier) {
    const topicWithMultiplier = `${topics[2]} ${feeMultiplier}`;

    await configSet(0, tFees[0], cFees[0], cFeeIncrements[0]);
    await program.methods
      .topicCreate(topicWithMultiplier, comments[0], feeMultiplier)
      .rpc();

    let justCreated = await topicFetchLamports(topicWithMultiplier);

    await program.methods.topicComment(topicWithMultiplier, comments[1]).rpc();

    let afterOneComment = await topicFetchLamports(topicWithMultiplier);

    await program.methods.topicComment(topicWithMultiplier, comments[2]).rpc();

    let afterTwoComments = await topicFetchLamports(topicWithMultiplier);

    await program.methods.topicComment(topicWithMultiplier, comments[3]).rpc();

    let afterThreeComments = await topicFetchLamports(topicWithMultiplier);

    assert.equal(afterOneComment - justCreated, cFees[0] * feeMultiplier);
    assert.equal(
      afterTwoComments - afterOneComment,
      (cFees[0] + cFeeIncrements[0]) * feeMultiplier
    );
    assert.equal(
      afterThreeComments - afterTwoComments,
      (cFees[0] + cFeeIncrements[0] * 2) * feeMultiplier
    );
  }

  it(`When comment topic create and comment, cFee and cFeeMultiplier, feeMultiplier = ${feeMultipliers[0]}`, async () => {
    await testTpoicCreateComment(feeMultipliers[0]);
  });

  it(`When comment topic create and comment, cFee and cFeeMultiplier, feeMultiplier = ${feeMultipliers[1]}`, async () => {
    await testTpoicCreateComment(feeMultipliers[1]);
  });

  it("Delete config", async () => {
    await configDelete();
  });
});
