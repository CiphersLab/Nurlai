import type { RealtimeFanout, SecretStore } from "@nurlai/adapter-kit";
import { createSecretStore } from "@nurlai/adapters";
import { resolveEncryptionKey } from "@nurlai/core/node/secrets-guard";

/** Worker composition without starting job hosts or database connections. */
export async function createWorkerSecretStore(
  source: NodeJS.ProcessEnv,
  realtime?: RealtimeFanout,
): Promise<SecretStore> {
  const store = createSecretStore(resolveEncryptionKey(source), source, realtime);
  await store.start();
  return store;
}
