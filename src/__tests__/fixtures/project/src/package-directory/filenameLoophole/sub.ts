// With filenameLoophole enabled, sub.ts can import from sub/ directory
import { subHelper } from "./sub/helper";

export const result = subHelper();
