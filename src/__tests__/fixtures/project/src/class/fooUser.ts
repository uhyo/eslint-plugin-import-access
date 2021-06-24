import { fooAccessPackage, fooPackage } from "./foo";

// can import package-private things from same directory
console.log(fooAccessPackage, fooPackage);
