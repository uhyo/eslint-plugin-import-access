/**
 * @package
 */
export enum barEnum {
  A,
}

/**
 * @package
 */
export namespace barNamespace {
  export const x = 1;
}

/**
 * @private
 */
export enum barPrivateEnum {
  A,
}

/**
 * @private
 */
export namespace barPrivateNamespace {
  export const x = 1;
}

/**
 * @package
 */
export const enum barConstEnum {
  A,
}

/**
 * @package
 */
export declare namespace barDeclaredNamespace {
  const x: number;
}

/**
 * @package
 */
export namespace barDotted.inner {
  export const x = 1;
}

export enum barUnannotatedEnum {
  A,
}

export namespace barUnannotatedNamespace {
  export const x = 1;
}
