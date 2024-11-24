import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Tlwwbm } from "../target/types/tlwwbm";
import { assert } from "chai";
import {
  configSet,
  configCreate,
  configDelete,
  topicFetchData,
  newWallet,
} from "./helpers";

describe("topic", () => {
  let provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;

  let author = provider.wallet.publicKey;

  const topics = ["First topic", "Second topic", "Third topic", "Fourth topic"];
  const comments = ["First comment", "Second comment", "Third comment"];
  const feeMultiplier = [new anchor.BN(1), new anchor.BN(3)];

  it("Create config", async () => {
    await configCreate();
    await configSet(420, 100, 200, 300);
  });

  it("Is created", async () => {
    await program.methods.topicCreate(topics[0], comments[0], feeMultiplier[0]).rpc();

    const topicData = await topicFetchData(topics[0]);

    assert.isTrue(topicData.topicAuthor.equals(author));
    assert.isTrue(topicData.lastCommentAuthor.equals(author));

    assert.equal(topicData.topicString, topics[0]);
    assert.equal(topicData.lastCommentString, comments[0]);

    assert.equal(topicData.commentCount.toNumber(), 0);

    let now = new Date().getTime() / 1000;

    assert.isTrue(topicData.createdAt.toNumber() - now < 2);
    assert.isTrue(topicData.createdAt.eq(topicData.commentedAt));

    assert.equal(
      topicData.createdAt.toNumber() + 420,
      topicData.canBeLockedAfter.toNumber()
    );

    assert.isFalse(topicData.isLocked);
  });

  it("Can't be created with same topic", async () => {
    await program.methods
      .topicCreate(topics[0], comments[0], feeMultiplier[0])
      .rpc()
      .then(
        () => {
          assert.fail("Should have thrown an error");
        },
        (err: anchor.AnchorError) => {}
      );
  });

  it("Is commented", async () => {
    await program.methods.topicComment(topics[0], comments[1]).rpc();

    const topicData = await topicFetchData(topics[0]);

    assert.equal(topicData.topicString, topics[0]);
    assert.isTrue(topicData.lastCommentAuthor.equals(author));
    assert.equal(topicData.lastCommentString, comments[1]);
    assert.equal(topicData.commentCount.toNumber(), 1);
    assert.isFalse(topicData.isLocked);
  });

  it("Is commented by stranger", async () => {
    let stranger = await newWallet();

    await program.methods
      .topicComment(topics[0], comments[2])
      .accounts({ authority: stranger.publicKey })
      .signers([stranger])
      .rpc();

    const topicData = await topicFetchData(topics[0]);

    assert.isTrue(topicData.lastCommentAuthor.equals(stranger.publicKey));
    assert.equal(topicData.lastCommentString, comments[2]);
    assert.equal(topicData.commentCount.toNumber(), 2);
    assert.isFalse(topicData.isLocked);
  });

  it("Can't be deleted because has comment", async () => {
    await program.methods
      .topicDelete(topics[0])
      .rpc()
      .then(
        () => {
          assert.fail("Should have thrown an error");
        },
        (err: anchor.AnchorError) => {}
      );
  });

  it("Can't be locked because time is not up", async () => {
    await program.methods
      .topicLock(topics[0])
      .rpc()
      .then(
        () => {
          assert.fail("Should have thrown an error");
        },
        (err: anchor.AnchorError) => {}
      );
  });

  it("Created a new topic with zero time to lock", async () => {
    await configSet(0, 100, 200, 300);

    await program.methods.topicCreate(topics[1], comments[0], feeMultiplier[0]).rpc();
  });

  it("Can be locked after time is up (zero)", async () => {
    await program.methods.topicLock(topics[1]).rpc();

    const topicData = await topicFetchData(topics[1]);

    assert.equal(topicData.commentCount.toNumber(), 0);
    assert.isTrue(topicData.isLocked);
  });

  it("Created a new topic with zero time to lock, add comment", async () => {
    await configSet(0, 100, 200, 300);

    await program.methods.topicCreate(topics[2], comments[0], feeMultiplier[0]).rpc();

    let stranger = await newWallet();

    await program.methods
      .topicComment(topics[2], comments[0])
      .accounts({ authority: stranger.publicKey })
      .signers([stranger])
      .rpc();
  });

  it("Can be locked after time is up (zero), with comment", async () => {
    await program.methods.topicLock(topics[2]).rpc();

    const topicData = await topicFetchData(topics[2]);

    assert.equal(topicData.commentCount.toNumber(), 1);
    assert.isTrue(topicData.isLocked);
  });

  it("Can't be deleted since it's locked", async () => {
    await program.methods
      .topicDelete(topics[2])
      .rpc()
      .then(
        () => {
          assert.fail("Should have thrown an error");
        },
        (err: anchor.AnchorError) => {}
      );
  });

  it("Created a new topic", async () => {
    await program.methods.topicCreate(topics[3], comments[0], feeMultiplier[0]).rpc();
  });

  it("Can't be deleted by stranger", async () => {
    let stranger = await newWallet();

    await program.methods
      .topicDelete(topics[3])
      .accounts({ authority: stranger.publicKey })
      .signers([stranger])
      .rpc()
      .then(
        () => {
          assert.fail("Should have thrown an error");
        },
        (err: anchor.AnchorError) => {}
      );

      await topicFetchData(topics[3]);
  });

  it("Can be deleted", async () => {
    await program.methods.topicDelete(topics[3]).rpc();

    try {
      await topicFetchData(topics[3]);
      assert.fail("Should have thrown an error");
    } catch (err) {
      assert.isTrue(err.toString().includes("does not exist"));
    }
  });

  it("Delete config", async () => {
    await configDelete();
  });
});
