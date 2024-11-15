// deno-lint-ignore-file no-explicit-any
import {
  // base64,
  DFSFileHandler,
  EaCDistributedFileSystemDetails,
  ESBuild,
  Logger,
  path,
  toText,
} from "./.deps.ts";

export async function importDFSTypescriptModule(
  logger: Logger,
  _esbuild: ESBuild | undefined,
  fileHandler: DFSFileHandler,
  filePath: string,
  dfs: EaCDistributedFileSystemDetails,
  dfsLookup: string,
  loader: "ts" | "tsx",
): Promise<{ filePath: string; module: any; contents: string } | undefined> {
  try {
    const file = await fileHandler.GetFileInfo(
      filePath,
      Date.now(),
      dfs.DefaultFile,
      dfs.Extensions,
      dfs.UseCascading,
    );

    if (file) {
      let fileContents = await toText(file!.Contents);

      if (loader === "tsx") {
        fileContents = `import { Fragment, h } from "preact";\n${fileContents}`;
      }

      let apiUrl: string;

      // if (IS_DENO_DEPLOY()) {
      //   const result = await esbuild.transform(fileContents, {
      //     loader: loader,
      //     // jsx: 'react-jsx',
      //     jsxImportSource: 'preact',
      //     jsxFactory: 'h',
      //     jsxFragment: 'Fragment',
      //     platform: 'browser',
      //   });

      //   // const enc = base64.encodeBase64(fileContents);
      //   const enc = base64.encodeBase64(result.code);

      //   // const apiUrl = `data:application/typescript;base64,${enc}`;
      //   apiUrl = `data:application/javascript;base64,${enc}`;
      // } else {
      if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
        apiUrl = filePath;
      } else if (
        fileHandler.Root.startsWith("http://") ||
        fileHandler.Root.startsWith("https://")
      ) {
        if (filePath.startsWith("/")) {
          filePath = `.${filePath}`;
        }

        apiUrl = new URL(`${filePath}`, fileHandler.Root).href;
      } else {
        if (filePath.startsWith("file:")) {
          apiUrl = filePath;
        } else {
          apiUrl = `file:///${
            path.join(
              Deno.cwd(),
              fileHandler.Root,
              filePath,
            )
          }`;
        }
      }
      // }

      const module = await import(apiUrl);

      return { filePath: apiUrl, module, contents: fileContents };
    } else {
      return undefined;
    }
  } catch (err) {
    logger.error(
      `There was an error importing the file '${filePath}' for DFS '${dfsLookup}'`,
      err,
    );

    throw err;
  }
}
