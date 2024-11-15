import {
  DFSFileHandler,
  EaCDistributedFileSystemDetails,
  EaCRuntimeHandlerSet,
  ESBuild,
  Logger,
} from "./.deps.ts";
import { loadEaCRuntimeHandlers } from "./loadEaCRuntimeHandlers.ts";

export async function loadMiddleware(
  logger: Logger,
  esbuild: ESBuild,
  fileHandler: DFSFileHandler,
  filePath: string,
  dfs: EaCDistributedFileSystemDetails,
  dfsLookup: string,
): Promise<[string, EaCRuntimeHandlerSet] | undefined> {
  const handler = await loadEaCRuntimeHandlers(
    logger,
    esbuild,
    fileHandler,
    filePath,
    dfs,
    dfsLookup,
  );

  if (handler) {
    const root = filePath.replace("_middleware.ts", "");

    return [root, handler];
  } else {
    return undefined;
  }
}
