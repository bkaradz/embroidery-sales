// import path from "node:path";
// import fs from 'node:fs'
// import crypto from 'node:crypto'
// import { logger } from "./logger";

// const results = new Map()

// export async function findFilesInDir(startPath: string, filter: string) {

//   if (!fs.existsSync(startPath)) {
//     logger.info("No directory: ", startPath);
//     throw new Error("File directory does not exist");
//   }

//   var files = fs.readdir(startPath);

//   for (var i = 0; i < files.length; i++) {
//     var filename = path.join(startPath, files[i]);
//     var stat = fs.lstatSync(filename);
//     if (stat.isDirectory()) {
//       findFilesInDir(filename, filter); //recurse
//     } else if (filename.slice(-4).toUpperCase() === filter.toUpperCase()) {
//       const hash = await generateHash(filename)
//       results.set(files[i], { name: files[i], path: filename, hash })
//     };
//   };
//   return results
// };

// async function generateHash(path: string) {
//   try {
//     // const buffer = fs.readFileSync(path)
//     // const digestSync = sha256hashSync(buffer)

//     const stream = fs.createReadStream(path)
//     const digestAsync = await sha256hashAsync(stream)

//     // console.log({ digestSync, digestAsync })
//     return digestAsync
//   } catch (err) {
//     console.error(err)
//   }
// }

// function sha256hashSync(buffer: Buffer<ArrayBufferLike> | crypto.BinaryLike) { // <1>
//   return crypto.createHash('sha256').update(buffer).digest('hex')
// }

// async function sha256hashAsync(stream: fs.ReadStream) { // <2>
//   return await new Promise((resolve, reject) => {
//     const hash = crypto.createHash('sha256')

//     hash.once('finish', () => resolve(hash.read().toString('hex')))
//     stream.once('error', err => reject(err))

//     stream.pipe(hash)
//   })
// }

/**
 * ---------------------------------------------------------
 */

// import path from "node:path";
// import fs from 'node:fs/promises'; // Use fs.promises
// import crypto from 'node:crypto';
// import { logger } from "./logger";
// import { createReadStream, ReadStream } from "node:fs";

// const results = new Map();

// export async function findFilesInDir(startPath: string, filter: string) {
//   try {
//     const entries = await fs.readdir(startPath); // Use fs.readdir (promise-based)

//     const promises = entries.map(async (entry) => {
//       const fullPath = path.join(startPath, entry);
//       const stat = await fs.lstat(fullPath); // Use fs.lstat (promise-based)

//       if (stat.isDirectory()) {
//         return findFilesInDir(fullPath, filter); // Return the promise from recursive call
//       } else if (entry.slice(-4).toUpperCase() === filter.toUpperCase()) {
//         const hash = await generateHash(fullPath);
//         return [entry, { name: entry, path: fullPath, hash }]; // Return [key, value] for Map
//       }
//       return null; // Return null for non-matching files to filter them out later
//     });

//     const resolvedEntries = await Promise.all(promises);

//     // Process results and add to the Map
//     for (const entry of resolvedEntries) {
//       if (entry) { // Check if the entry is not null (i.e., it matched the filter)
//         if (entry instanceof Map) { // Check if it's a map (from recursive call)
//           for (const [key, value] of entry) {
//             results.set(key, value);
//           }
//         } else {
//           results.set(entry[0], entry[1]); // Add the file to the results
//         }
//       }
//     }

//     return results;
//   } catch (err) {
//     logger.error("Error reading directory:", err); // Log the error
//     throw err; // Re-throw the error to be handled by the caller
//   }
// }


// async function generateHash(path: string) {
//   try {
//     const stream = createReadStream(path);
//     const digestAsync = await sha256hashAsync(stream);
//     return digestAsync;
//   } catch (err) {
//     console.error("Error generating hash:", err); // Log the error
//     throw err; // Re-throw the error
//   }
// }

// async function sha256hashAsync(stream: ReadStream) {
//   return new Promise((resolve, reject) => {
//     // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
//     const algorithms = 'md5'
//     const hash = crypto.createHash(algorithms);
//     hash.once('finish', () => resolve(hash.read().toString('hex')));
//     stream.once('error', reject); // Directly reject on stream error
//     stream.pipe(hash);
//   });
// }

import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { logger } from "./logger";
import type { PathLike, ReadStream } from "fs";

// const results = new Map();

export async function findFilesInDir(startPath: string, filter: string, allFiles = new Map<string, { name: string, path: string }>()) {
  try {
    await fs.access(startPath); // Check if directory exists
  } catch (error) {
    logger.info("No directory: ", startPath);
    throw new Error("File directory does not exist");
  }

  const files = await fs.readdir(startPath);

  await Promise.all(
    files.map(async (file) => {
      const filename = path.join(startPath, file);
      const stat = await fs.lstat(filename);
      if (stat.isDirectory()) {
        await findFilesInDir(filename, filter, allFiles); // Recurse
      } else if (filename.slice(-4).toUpperCase() === filter.toUpperCase()) {
        // const hash = await generateHash(filename);
        allFiles.set(file, { name: file, path: filename });
      }
    })
  );

  return allFiles;
}

export async function generateHash(filePath: PathLike) {
  try {
    const stream = await fs.open(filePath, "r");
    const digestAsync = await sha256hashAsync(stream.createReadStream());
    await stream.close();
    return digestAsync;
  } catch (err) {
    console.error(err);
  }
}

async function sha256hashAsync(stream: ReadStream) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("md5");
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.pipe(hash);
  });
}


