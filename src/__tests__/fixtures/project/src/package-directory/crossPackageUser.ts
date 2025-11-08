// This should fail even with packageDirectory option
// because it's trying to import from a different package (sub/)
import { subInternalHelper } from "./sub/_internal/subHelpers";

export const crossResult = subInternalHelper();
