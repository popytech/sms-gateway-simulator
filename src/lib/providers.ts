export type SimulatorProvider = "generic" | "orange" | "mtn" | "moov";

const catalogs: Record<SimulatorProvider, string[]> = {
  generic: ["SIMULATED_PROVIDER_FAILURE", "TEMPORARY_UNAVAILABLE", "INVALID_DESTINATION"],
  orange: ["ORANGE_TEMPORARY_FAILURE", "ORANGE_REJECTED", "ORANGE_DESTINATION_UNREACHABLE"],
  mtn: ["MTN_SYSTEM_FAILURE", "MTN_REJECTED", "MTN_UNKNOWN_SUBSCRIBER"],
  moov: ["MOOV_TEMPORARY_FAILURE", "MOOV_REJECTED", "MOOV_UNREACHABLE"],
};

export function providerFailureCode(provider: SimulatorProvider) {
  const values = catalogs[provider];
  return values[Math.floor(Math.random() * values.length)] ?? values[0];
}

export function providerCatalog() {
  return catalogs;
}
