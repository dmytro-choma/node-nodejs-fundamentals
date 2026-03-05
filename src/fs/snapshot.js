import fs from 'node:fs/promises';
import path from 'node:path';

const snapshot = async () => {
  const workspaceArg = process.argv[2] || 'workspace';

  try {
    const absoluteRoot = path.resolve(workspaceArg);

    const rootStat = await fs.stat(absoluteRoot);
    if (!rootStat.isDirectory()) throw new Error();

    const entries = [];

    async function scan(currentPath) {
      const dirEntries = (await fs.readdir(currentPath, { withFileTypes: true }))
        .sort((a, b) => a.name.localeCompare(b.name));

      for (const dirent of dirEntries) {
        const fullPath = path.join(currentPath, dirent.name);
        const relativePath = path.relative(absoluteRoot, fullPath);

        if (dirent.isDirectory()) {
          entries.push({ path: relativePath, type: 'directory' });
          await scan(fullPath);
        } else if (dirent.isFile()) {
          const fileStats = await fs.stat(fullPath);
          const content = await fs.readFile(fullPath, { encoding: 'base64' });

          entries.push({
            path: relativePath,
            type: 'file',
            size: fileStats.size,
            content: content
          });
        }
      }
    }

    await scan(absoluteRoot);

    const result = {
      rootPath: absoluteRoot,
      entries: entries
    };

    const outputPath = path.join(path.dirname(absoluteRoot), 'snapshot.json');
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));

  } catch (error) {
    throw new Error('FS operation failed');
  }
};

await snapshot();