import { BN } from "@coral-xyz/anchor";
import { TopicData } from "./TopicProvider";

export const LAMPORTS_PER_SOL = 1_000_000_000;

export function formatSol(sol: BN) {
  return new Intl.NumberFormat("en-IN", { maximumSignificantDigits: 9 })
    .format(Number(sol) / LAMPORTS_PER_SOL)
    .replace(/,/g, "");
}

export function getTopicInfoString(topic: TopicData) {
  const canBeLockedDate = topic.canBeLockedAfter.toNumber() * 1000;
  const canBeLockedString =
    Date.now() > canBeLockedDate
      ? "NOW"
      : new Date(canBeLockedDate).toLocaleString();

  const lockString = topic.isLocked
    ? "Locked"
    : "Can be locked: " + canBeLockedString;

  return (
    "Fee Multiplier: " +
    topic.feeMultiplier.toString() +
    " - " +
    "Raised: " +
    formatSol(topic.raised) +
    " SOL - " +
    "Comment Count: " +
    topic.commentCount.toString() +
    " - " +
    lockString
  );
}

export function getTopicUrl(topicString: string) {
  return "?topic=" + topicString;
}
