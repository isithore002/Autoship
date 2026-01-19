import { env } from "../config/env";
import { simulationRunner } from "./simRunner";
import { realRunner } from "./realRunner";

export function getRunner() {
  console.log(`[Runner] Using ${env.SIMULATION_MODE ? "simulationRunner" : "realRunner"}`);
  return env.SIMULATION_MODE ? simulationRunner : realRunner;
}
