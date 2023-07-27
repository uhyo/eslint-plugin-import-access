import type ts from "typescript/lib/tsserverlibrary";
import { checkSymbolImportability } from "../core/checkSymbolmportability";
import { jsDocRuleDefaultOptions, JSDocRuleOptions } from "../rules/jsdoc";
import { PackageOptions } from "../utils/isInPackage";

type PluginConfig = {
  jsdoc?: Partial<JSDocRuleOptions>;
};

export function tsServerPluginInit(modules: {
  typescript: typeof import("typescript/lib/tsserverlibrary");
}) {
  const { typescript } = modules;

  function create(info: ts.server.PluginCreateInfo) {
    // const log = (message: unknown) => {
    //   info.project.projectService.logger.info(String(message));
    //   fs.appendFileSync(logFile, `[${new Date()}] ${message}\n`);
    // };

    const config: PluginConfig = info.config;

    const packageOptions: PackageOptions = jsDocRuleDefaultOptions(
      config.jsdoc,
    );

    // Set up decorator
    const proxy: ts.LanguageService = Object.create(null);
    for (const k of Object.keys(info.languageService) as Array<
      keyof ts.LanguageService
    >) {
      const x = info.languageService[k];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      proxy[k] = x as any;
    }
    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const res = info.languageService.getCompletionsAtPosition(
        fileName,
        position,
        options,
      );
      const prog = info.languageService.getProgram();
      if (prog === undefined) {
        return res;
      }
      const checker = prog.getTypeChecker();
      if (res !== undefined) {
        // const importerNormalizedFilename = prog.getSourceFile(fileName)?.fileName || "/"
        // remove export modifiers that imports package-private or private symbols.
        const filtered = res.entries.filter((entry) => {
          if (entry.kindModifiers !== "export" || !entry.data) {
            return true;
          }
          const { exportName, fileName: entryFileName } = entry.data;
          if (!entryFileName) {
            return true;
          }
          const sourceFile = prog.getSourceFile(entryFileName);
          if (!sourceFile) {
            return true;
          }
          const symb = checker.getSymbolAtLocation(sourceFile);
          const exportedSymbol = symb?.exports?.get(
            typescript.escapeLeadingUnderscores(exportName),
          );
          if (exportedSymbol === undefined) {
            return true;
          }
          const checkResult = checkSymbolImportability(
            packageOptions,
            prog,
            fileName,
            exportedSymbol,
          );
          return checkResult === undefined;
        });
        res.entries = filtered;
      }
      // log(JSON.stringify(res, undefined, 2));
      return res;
    };

    const importMatch = /^Import ['"](\w+)['"] from module ['"]([^'"]+)['"]$/;
    proxy.getCodeFixesAtPosition = (
      fileName,
      start,
      end,
      errorCodes,
      formatOptions,
      preferences,
    ) => {
      const res = info.languageService.getCodeFixesAtPosition(
        fileName,
        start,
        end,
        errorCodes,
        formatOptions,
        preferences,
      );
      const prog = info.languageService.getProgram();
      if (prog === undefined) {
        return res;
      }
      const checker = prog.getTypeChecker();
      const filtered = res.filter((fix) => {
        if (fix.fixName !== "import") {
          return true;
        }
        // FIXME: using string for filter is stupid, but found no other way
        const importDescriptionMatch = fix.description.match(importMatch);
        if (importDescriptionMatch === null) {
          return true;
        }
        const [, exportName, exportFileName] = importDescriptionMatch;

        const resolvedModule = info.languageServiceHost.resolveModuleNames?.(
          [exportFileName],
          fileName,
          undefined,
          undefined,
          info.project.getCompilerOptions(),
        )?.[0];
        if (resolvedModule === undefined) {
          return true;
        }
        const exporterSourcefile = prog.getSourceFile(
          resolvedModule.resolvedFileName,
        );
        if (exporterSourcefile === undefined) {
          return true;
        }

        const symb = checker.getSymbolAtLocation(exporterSourcefile);
        const exportedSymbol = symb?.exports?.get(
          typescript.escapeLeadingUnderscores(exportName),
        );
        if (exportedSymbol === undefined) {
          return true;
        }
        const checkResult = checkSymbolImportability(
          packageOptions,
          prog,
          fileName,
          exportedSymbol,
        );
        return checkResult === undefined;
      });
      return filtered;
    };
    return proxy;
  }

  return { create };
}
