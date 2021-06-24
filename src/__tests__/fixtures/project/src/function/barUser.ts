import { barAccessPackage, barPackage } from "./sub/bar";

// cannot import package-private things from sub directory
console.log(barAccessPackage, barPackage);
