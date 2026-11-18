import type { DecisionProvider, DecisionProviderOptions } from "@nurlai/adapter-kit";
import type { ModelCatalogEntry } from "@nurlai/contracts";

/** Provider-owned decision protocol identifiers and pricing provenance. */
export interface DecisionModelDescriptor {
  provider: string;
  id: string;
  aliases?: readonly string[];
  inputUsdPerMillion: number;
  pricingVersion: string;
  pricingUrl: string;
  catalog?: ModelCatalogEntry;
  create: (options: DecisionProviderOptions) => DecisionProvider;
  deploymentApiKey: (env: NodeJS.ProcessEnv) => string | undefined;
  includedByDefault?: boolean;
}
