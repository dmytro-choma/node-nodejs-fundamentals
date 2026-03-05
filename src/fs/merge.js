import fs from 'node:fs/promises';
import path from 'node:path';

const merge = async () => {
  try {
    const partsDir = path.resolve('workspace/parts');
    const outputFile = path.resolve('workspace/merged.txt');

    await fs.access(partsDir);

    const args = process.argv.slice(2);
    const filesIndex = args.indexOf('--files');

    let filesToMerge;

    if (filesIndex !== -1 && args[filesIndex + 1]) {
      filesToMerge = args[filesIndex + 1].split(',');

      for (const file of filesToMerge) {
        await fs.access(path.join(partsDir, file));
      }

    } else {
      const allFiles = await fs.readdir(partsDir);

      filesToMerge = allFiles
        .filter(file => path.extname(file) === '.txt')
        .sort();

      if (filesToMerge.length === 0) {
        throw new Error();
      }
    }

    let combinedContent = '';

    for (const fileName of filesToMerge) {
      const filePath = path.join(partsDir, fileName);
      const content = await fs.readFile(filePath, 'utf-8');
      combinedContent += content;
    }

    await fs.writeFile(outputFile, combinedContent);

  } catch (error) {
    throw new Error('FS operation failed');
  }
};

await merge();