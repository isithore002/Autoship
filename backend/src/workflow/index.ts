import { env } from "../config/env";
import { executionRunner } from "./simRunner";
import { realRunner } from "./realRunner";

export function getRunner() {
  console.log(`[Runner] Using ${env.SIMULATION_MODE ? "executionRunner" : "realRunner (Gemini-powered)"}`);
  return env.SIMULATION_MODE ? executionRunner : realRunner;
}
