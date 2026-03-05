import fs from 'node:fs/promises';
import path from 'node:path';

const restore = async () => {
  const snapshotPath = path.resolve('snapshot.json');
  const restoreDir = path.resolve('workspace_restored');

  try {
    await fs.access(snapshotPath);

    try {
      await fs.access(restoreDir);
      throw new Error('FS operation failed');
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw new Error('FS operation failed');
      }
    }

    const snapshotRaw = await fs.readFile(snapshotPath, 'utf8');
    const { entries } = JSON.parse(snapshotRaw);

    await fs.mkdir(restoreDir);

    for (const entry of entries) {
      const entryPath = path.join(restoreDir, entry.path);

      if (entry.type === 'directory') {
        await fs.mkdir(entryPath, { recursive: true });
      } else if (entry.type === 'file') {
        await fs.mkdir(path.dirname(entryPath), { recursive: true });

        await fs.writeFile(entryPath, entry.content, { encoding: 'base64' });
      }
    }
  } catch (error) {
    throw new Error('FS operation failed');
  }
};

await restore();