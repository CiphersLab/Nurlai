import type { VoiceUsage } from "@nurlai/adapter-kit";
import type { Actor } from "@nurlai/contracts";
import { admitSpeech, settleSpeech } from "@nurlai/db";
import { bestEffort, getLogger } from "@nurlai/logging";
import type { VoiceDeps } from "../calls/voice.js";
import { requireDeploymentVoiceConsent } from "./deployment-consent.js";

export async function withSpeechCost<T extends { usage?: VoiceUsage; providerRequestId?: string }>(
  deps: Pick<VoiceDeps, "prisma" | "env">,
  actor: Pick<Actor, "userId" | "spaceId"> & { callId?: string },
  target: { deployment: boolean; cred: { provider: string } },
  operation: "synthesize" | "transcribe",
  work: () => Promise<T>,
): Promise<T> {
  const policy = target.deployment ? deps.env?.deploymentVoice : undefined;
  if (!policy) return work();
  await requireDeploymentVoiceConsent(deps.prisma, actor, policy, operation);
  const id = await admitSpeech(
    deps.prisma,
    actor,
    target.cred.provider,
    operation,
    policy.pricing[operation],
  );
  // If the request fails or is interrupted, pending evidence and its reservation survive.
  // Retrying audio automatically could charge twice, so recovery requires provider evidence.
  const result = await work();
  // Intent is already durable. Losing the result would invite another paid request.
  const settled = await bestEffort(
    "Settle completed operator speech",
    settleSpeech(deps.prisma, id, result.usage, result.providerRequestId).then(() => true),
  );
  if (!settled)
    getLogger().error("Operator speech settlement requires reconciliation", {
      speechCostId: id,
      provider: target.cred.provider,
      operation,
      providerRequestId: result.providerRequestId,
    });
  return result;
}
