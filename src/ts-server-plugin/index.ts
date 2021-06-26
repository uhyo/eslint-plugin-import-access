import fs from "fs";
import path from "path";
import { checkSymbolImportability } from "../core/checkSymbolmportability";
import { PackageOptions } from "../utils/isInPackage";

const logFile = path.join(__dirname, "../../log.txt");
fs.appendFileSync(logFile, `[${new Date()}] a!!!!!\n`);

export function tsServerPluginInit(modules: {
  typescript: typeof import("typescript/lib/tsserverlibrary");
}) {
  const { typescript } = modules;

  function create(info: ts.server.PluginCreateInfo) {
    const log = (message: unknown) => {
      info.project.projectService.logger.info(String(message));
      fs.appendFileSync(logFile, `[${new Date()}] ${message}\n`);
    };

    log("Hello from ts-server-plugin");

    const packageOptions: PackageOptions = {
      indexLoophole: true,
      filenameLoophole: false,
    };

    // Set up decorator
    const proxy: ts.LanguageService = Object.create(null);
    for (const k of Object.keys(info.languageService) as Array<
      keyof ts.LanguageService
    >) {
      const x = info.languageService[k];
      proxy[k] = x as any;
    }
    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      // log(
      //   `getCompletionsAtPosition ${fileName} ${position} ${JSON.stringify(
      //     options
      //   )}`
      // );
      const res = info.languageService.getCompletionsAtPosition(
        fileName,
        position,
        options
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
            typescript.escapeLeadingUnderscores(exportName)
          );
          if (exportedSymbol === undefined) {
            return true;
          }
          const checkResult = checkSymbolImportability(
            packageOptions,
            checker,
            fileName,
            exportedSymbol
          );
          log(`${entryFileName} ${exportName} ${checkResult}`);
          return checkResult === undefined;
        });
        res.entries = filtered;
      }
      // log(JSON.stringify(res, undefined, 2));
      return res;
    };
    return proxy;
  }

  return { create };
}
