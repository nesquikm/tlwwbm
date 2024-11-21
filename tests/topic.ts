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

  const topics = ["First topic", "Second topic"];
  const comments = ["First comment", "Second comment"];

  it("Create config", async () => {
    await configCreate();
    await configSetTopicLockTime(420);
  });

  it("Is created!", async () => {
    const tx = await program.methods.topicCreate(topics[0], comments[0]).rpc();

    const [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("topic"), Buffer.from(topics[0])],
      program.programId
    );

    const topicData = await program.account.topic.fetch(counterPDA);

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

  it("Can't be created with same topic!", async () => {
    await program.methods
      .topicCreate(topics[0], comments[0])
      .rpc()
      .then(
        () => {
          assert.fail("Should have thrown an error");
        },
        (err: anchor.AnchorError) => {}
      );
  });

  it("Is commented!", async () => {});

  it("Is commented by stranger!", async () => {});

  it("Can't be deleted because has comment", async () => {});

  it("Can't be locked because time is not up", async () => {});

  it("Can be locked after time is up", async () => {});

  it("Created a new topic", async () => {});

  it("Can be deleted", async () => {});

  it("Created a new topic", async () => {});

  it("Can be locked", async () => {});

  it("Can't be deleted since it's locked", async () => {});

  it("Delete config", async () => {
    await configDelete();
  });
});
