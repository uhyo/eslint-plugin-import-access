import {
  barEnum,
  barNamespace,
  barPrivateEnum,
  barPrivateNamespace,
  barConstEnum,
  barDeclaredNamespace,
  barDotted,
} from "./sub/bar";

console.log(
  barEnum.A,
  barNamespace.x,
  barPrivateEnum.A,
  barPrivateNamespace.x,
  barConstEnum.A,
  barDeclaredNamespace.x,
  barDotted.inner.x,
);
