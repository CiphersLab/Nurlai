import type { JobPublisher, SandboxProvider } from "@nurlai/adapter-kit";
import { expireComputerControl, stopCancelledGroupRuns, wakeRun } from "@nurlai/adapters";
import type { PrismaClient, SpaceDeparture, ThreadEvents } from "@nurlai/db";
import { getLogger } from "@nurlai/logging";

/**
 * After someone leaves a Space, is removed, or deletes their account: tell clients their runs
 * were cancelled, stop those runs' work, release the screens they held, and start the follow-ups
 * that waited behind them. The departure is committed, so each failure is logged rather than
 * reported; expired leases and the job reconciler catch up.
 */
export async function afterSpaceDeparture(
  deps: {
    prisma: PrismaClient;
    sandbox: SandboxProvider;
    jobs: JobPublisher;
    events: ThreadEvents;
  },
  actor: { spaceId: string; userId: string },
  departure: SpaceDeparture,
): Promise<void> {
  await Promise.all(
    departure.events.map(({ threadId, seq }) =>
      deps.events.notify(threadId, seq).catch((error) => {
        getLogger().error("space departure realtime notification", error);
      }),
    ),
  );
  // Their routines pass to the owner, paused.
  await deps.events.publishSpaceChange?.(actor.spaceId, "routines");
  await stopCancelledGroupRuns(deps, actor, departure).catch((error) => {
    getLogger().error("space departure run teardown", error);
  });
  await Promise.all(
    departure.heldControls.map(({ computerId, leaseId }) =>
      expireComputerControl(deps, computerId, leaseId).catch((error) => {
        getLogger().error("space departure control release", error);
      }),
    ),
  );
  await Promise.all(departure.continuationRunIds.map((runId) => wakeRun(deps.jobs, runId)));
}
