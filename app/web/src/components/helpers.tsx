import { BN } from "@coral-xyz/anchor";
import { TopicData } from "./TopicProvider";
import { getEndpointName } from "./SelectNetwork";

export const LAMPORTS_PER_SOL = 1_000_000_000;

export function formatSol(sol: BN) {
  return new Intl.NumberFormat("en-IN", { maximumSignificantDigits: 9 })
    .format(Number(sol) / LAMPORTS_PER_SOL)
    .replace(/,/g, "");
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  const t = [h, m > 9 ? m : h ? "0" + m : m || "0", s > 9 ? s : "0" + s]
  return `${t[0]} hours ${t[1]} minutes ${t[2]} seconds`;
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

export function getTopicUrl(topicString: string, endpoint: string) {
  const endpointString = getEndpointName(endpoint) === "devnet" ? "&endpoint=devnet" : "";
  return "?topic=" + topicString + endpointString;
}
