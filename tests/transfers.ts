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
  newWallet,
  accountFetchLamports,
} from "./helpers";
import { assert } from "chai";

describe("transfers", () => {
  let provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;

  let newAdmin;

  before(async () => {
    newAdmin = await newWallet();
  });

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
  const tFees = [100, 500];
  const cFees = [200, 300];
  const cFeeIncrements = [444, 400];
  const feeMultipliers = [new anchor.BN(1), new anchor.BN(3)];

  it("Create config", async () => {
    await configCreate();
  });

  async function testTopicCreate(feeMultiplier) {
    const topicsWithMultipliers = [
      `${topics[0]} ${feeMultiplier}`,
      `${topics[1]} ${feeMultiplier}`,
    ];

    await configSet(0, tFees[0], cFees[0], cFeeIncrements[0], 0.25, 0.5);
    await program.methods
      .topicCreate(topicsWithMultipliers[0], comments[0], feeMultiplier)
      .rpc();

    await configSet(0, tFees[1], cFees[0], cFeeIncrements[0], 0.25, 0.5);
    await program.methods
      .topicCreate(topicsWithMultipliers[1], comments[0], feeMultiplier)
      .rpc();

    let topicLamports = [
      await topicFetchLamports(topicsWithMultipliers[0]),
      await topicFetchLamports(topicsWithMultipliers[1]),
    ];

    assert.equal(
      topicLamports[1] - topicLamports[0],
      (tFees[1] - tFees[0]) * feeMultiplier
    );

    let topicData = [
      await topicFetchData(topicsWithMultipliers[0]),
      await topicFetchData(topicsWithMultipliers[1]),
    ];

    assert.equal(topicData[0].raised.toNumber(), tFees[0] * feeMultiplier);
    assert.equal(topicData[1].raised.toNumber(), tFees[1] * feeMultiplier);
  }

  it(`When create topic, tFee, feeMultiplier = ${feeMultipliers[0]}`, async () => {
    await testTopicCreate(feeMultipliers[0]);
  });

  it(`When create topic, tFee, feeMultiplier = ${feeMultipliers[1]}`, async () => {
    await testTopicCreate(feeMultipliers[1]);
  });

  async function testTpoicCreateComment(feeMultiplier) {
    const topicWithMultiplier = `${topics[2]} ${feeMultiplier}`;

    await configSet(0, tFees[0], cFees[0], cFeeIncrements[0], 0.25, 0.5);
    await program.methods
      .topicCreate(topicWithMultiplier, comments[0], feeMultiplier)
      .rpc();

    let justCreated = await topicFetchLamports(topicWithMultiplier);
    let justCreatedRaised = (
      await topicFetchData(topicWithMultiplier)
    ).raised.toNumber();

    await program.methods.topicComment(topicWithMultiplier, comments[1]).rpc();

    let afterOneComment = await topicFetchLamports(topicWithMultiplier);
    let afterOneCommentRaised = (
      await topicFetchData(topicWithMultiplier)
    ).raised.toNumber();

    await program.methods.topicComment(topicWithMultiplier, comments[2]).rpc();

    let afterTwoComments = await topicFetchLamports(topicWithMultiplier);
    let afterTwoCommentsRaised = (
      await topicFetchData(topicWithMultiplier)
    ).raised.toNumber();

    await program.methods.topicComment(topicWithMultiplier, comments[3]).rpc();

    let afterThreeComments = await topicFetchLamports(topicWithMultiplier);
    let afterThreeCommentsRaised = (
      await topicFetchData(topicWithMultiplier)
    ).raised.toNumber();

    assert.equal(afterOneComment - justCreated, cFees[0] * feeMultiplier);
    assert.equal(
      afterOneCommentRaised - justCreatedRaised,
      cFees[0] * feeMultiplier
    );

    assert.equal(
      afterTwoComments - afterOneComment,
      (cFees[0] + cFeeIncrements[0]) * feeMultiplier
    );
    assert.equal(
      afterTwoCommentsRaised - afterOneCommentRaised,
      (cFees[0] + cFeeIncrements[0]) * feeMultiplier
    );

    assert.equal(
      afterThreeComments - afterTwoComments,
      (cFees[0] + cFeeIncrements[0] * 2) * feeMultiplier
    );
    assert.equal(
      afterThreeCommentsRaised - afterTwoCommentsRaised,
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

  it("Create config with newAdmin", async () => {
    await configCreate(newAdmin);
  });

  it("When topic locked, author and last comment author get their share (and admin too)", async () => {
    await configSet(
      0,
      tFees[1],
      cFees[1],
      cFeeIncrements[1],
      0.2,
      0.3,
      newAdmin
    );

    let newAuthor = await newWallet();

    await program.methods
      .topicCreate(topics[3], comments[0], feeMultipliers[0])
      .accounts({ authority: newAuthor.publicKey })
      .signers([newAuthor])
      .rpc();

    let commenter = await newWallet();

    await program.methods
      .topicComment(topics[3], comments[2])
      .accounts({ authority: commenter.publicKey })
      .signers([commenter])
      .rpc();

    let authorBalanceBefore = await accountFetchLamports(newAuthor.publicKey);
    let commenterBalanceBefore = await accountFetchLamports(
      commenter.publicKey
    );
    let adminBalanceBefore = await accountFetchLamports(
      newAdmin.publicKey
    );

    let raised = (await topicFetchData(topics[3])).raised.toNumber();

    let stranger = await newWallet();

    await program.methods
      .topicLock(topics[3])
      .accounts({
        topicAuthor: newAuthor.publicKey,
        lastCommentAuthor: commenter.publicKey,
        admin: newAdmin.publicKey,
        authority: stranger.publicKey,
      })
      .signers([stranger])
      .rpc();

    let authorBalanceAfter = await accountFetchLamports(newAuthor.publicKey);
    let commenterBalanceAfter = await accountFetchLamports(commenter.publicKey);
    let adminBalanceAfter = await accountFetchLamports(
      newAdmin.publicKey
    );

    assert.equal(authorBalanceAfter - authorBalanceBefore, raised * 0.2);
    assert.equal(commenterBalanceAfter - commenterBalanceBefore, raised * 0.3);
    assert.equal(adminBalanceAfter - adminBalanceBefore, raised * 0.5);
  });

  it("Delete config with newAdmin", async () => {
    await configDelete(newAdmin);
  });
});
