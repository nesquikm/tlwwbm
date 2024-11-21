import * as anchor from "@coral-xyz/anchor";
import { AnchorError, Program } from "@coral-xyz/anchor";
import { Tlwwbm } from "../target/types/tlwwbm";
import { assert } from "chai";
import {
  configSetTopicLockTime,
  configCreate,
  confingFetchData,
  newWallet,
  configDelete,
} from "./helpers";

describe("config", () => {
  let provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.Tlwwbm as Program<Tlwwbm>;

  it("Is initialized!", async () => {
    await configCreate();

    const configData = await confingFetchData();

    assert.isTrue(configData.admin.equals(provider.wallet.publicKey));
    assert.equal(configData.topicLockTime.toNumber(), 60 * 60 * 24 * 2);
  });

  it("Can be changed!", async () => {
    await configSetTopicLockTime(42);

    const configData = await confingFetchData();

    assert.equal(configData.topicLockTime.toNumber(), 42);
  });

  it("Can't be changed by unauthorized user!", async () => {
    let stranger = await newWallet();

    const tx = await program.methods
      .configSetTopicLockTime(new anchor.BN(69))
      .accounts({ autority: stranger.publicKey })
      .signers([stranger])
      .rpc()
      .then(
        () => {
          assert.fail("Should have thrown an error");
        },
        (err: AnchorError) => {
          assert.equal(err.error.errorCode.code, "NotAdmin");
        }
      );

    const configData = await confingFetchData();

    assert.equal(configData.topicLockTime.toNumber(), 42);
  });

  it("Can't be deleted by unauthorized user!", async () => {
    let stranger = await newWallet();

    const tx = await program.methods
      .configDelete()
      .accounts({ autority: stranger.publicKey })
      .signers([stranger])
      .rpc()
      .then(
        () => {
          assert.fail("Should have thrown an error");
        },
        (err: AnchorError) => {
          assert.equal(err.error.errorCode.code, "NotAdmin");
        }
      );

    const configData = await confingFetchData();

    assert.equal(configData.topicLockTime.toNumber(), 42);
  });

  it("Can be deleted!", async () => {
    await configDelete();

    try {
      await confingFetchData();
      assert.fail("Should have thrown an error");
    } catch (err) {
      assert.isTrue(err.toString().includes("does not exist"));
    }
  });

  it("Can be created again and deleted!", async () => {
    await configCreate();

    const configData = await confingFetchData();

    assert.equal(configData.topicLockTime.toNumber(), 60 * 60 * 24 * 2);

    await configDelete();

    try {
      await confingFetchData();
      assert.fail("Should have thrown an error");
    } catch (err) {
      assert.isTrue(err.toString().includes("does not exist"));
    }
  });
});
