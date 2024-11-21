import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Tlwwbm } from "../target/types/tlwwbm";
import { assert } from "chai";
import { configSetTopicLockTime, configCreate, configDelete } from "./helpers";

describe("topic", () => {
  let provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;

  let author = provider.wallet.publicKey;

  const topic = "New Topic Title";
  const first_comment = "First comment";

  it("Create config", async () => {
    await configCreate();
    await configSetTopicLockTime(42);
  });

  it("Is created!", async () => {
    const tx = await program.methods.topicCreate(topic, first_comment).rpc();

    const [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("topic"), Buffer.from(topic)],
      program.programId
    );

    const topicData = await program.account.topic.fetch(counterPDA);

    assert.isTrue(topicData.topicAuthor.equals(author));
    assert.isTrue(topicData.lastCommentAuthor.equals(author));

    assert.equal(topicData.topicString, topic);
    assert.equal(topicData.lastCommentString, first_comment);

    assert.equal(topicData.commentCount.toNumber(), 0);

    let now = new Date().getTime() / 1000;

    assert.isTrue(topicData.createdAt.toNumber() - now < 2);
    assert.isTrue(topicData.createdAt.eq(topicData.commentedAt));

    assert.equal(
      topicData.createdAt.toNumber() + 42,
      topicData.canBeLockedAfter.toNumber()
    );

    assert.isFalse(topicData.isLocked);
  });

  it("Delete config", async () => {
    await configDelete();
  });
});
