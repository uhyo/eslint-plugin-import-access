import { barAccessPackage, barPackage, barPackage as renamed } from "./sub/bar";

// cannot import package-private things from sub directory
console.log(barAccessPackage, barPackage, renamed);
