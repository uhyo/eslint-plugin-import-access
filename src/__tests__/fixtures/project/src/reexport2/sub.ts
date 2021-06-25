import { subFoo } from "./sub/foo";
import { subBar } from "./sub2/bar";

// Can import subFoo under `filenameLoophole: true`, but not subBar
console.log(subFoo, subBar);
