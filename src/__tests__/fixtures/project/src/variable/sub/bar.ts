/**
 * @package
 */
export const barValue = 3;

/**
 * @access package
 */
export let barValue2 = 2;

/**
 * @package
 */
export var { barDestructed = 0 } = {};

export const {
  /**
   * @package
   */
  barDestructed2,
} = { barDestructed2: 123 };
