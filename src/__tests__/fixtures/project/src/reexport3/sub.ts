import { subFoo } from "./sub/foo";
import { subBar } from "./sub2/bar";

// Cannot import subBar with packageOptions.defaultImportability=package
console.log(subFoo, subBar);
