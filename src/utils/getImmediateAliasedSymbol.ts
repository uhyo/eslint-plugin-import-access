import { Symbol, TypeChecker } from "typescript";

/**
 * Use non-public getImmediateAliasedSymbol API
 */
export function getImmediateAliasedSymbol(
  checker: TypeChecker,
  symbol: Symbol
): Symbol | undefined {
  return (checker as any).getImmediateAliasedSymbol(symbol);
}
