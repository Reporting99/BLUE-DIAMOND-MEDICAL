import { doctors } from "./data";
import type { Doctor } from "./types";

export function getDoctor(id: string): Doctor | undefined {
  return doctors.find((d) => d.id === id);
}
