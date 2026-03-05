import fs from 'node:fs/promises';
import path from 'node:path';

const findByExt = async () => {
  const args = process.argv.slice(2);
  const extIndex = args.indexOf('--ext');

  let targetExt = (extIndex !== -1 && args[extIndex + 1]) ? args[extIndex + 1] : 'txt';

  if (!targetExt.startsWith('.')) {
    targetExt = `.${targetExt}`;
  }

  const workspacePath = path.resolve('workspace');

  try {
    await fs.access(workspacePath);

    const foundFiles = [];

    async function search(currentDir) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          await search(fullPath);
        } else if (entry.isFile()) {
          if (path.extname(entry.name) === targetExt) {
            const relativePath = path.relative(workspacePath, fullPath);

            foundFiles.push(relativePath.replace(/\\/g, '/'));
          }
        }
      }
    }

    await search(workspacePath);

    if (foundFiles.length > 0) {
      console.log(foundFiles.sort().join('\n'));
    }

  } catch (error) {
    throw new Error('FS operation failed');
  }
};

await findByExt();