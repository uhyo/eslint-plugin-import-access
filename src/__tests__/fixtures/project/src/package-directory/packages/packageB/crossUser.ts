// This should fail - trying to import from a different package
import { packageAHelper } from "../packageA/helper";

export const result = packageAHelper();
