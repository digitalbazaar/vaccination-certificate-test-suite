/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as fs from 'fs/promises';
import {createReadStream} from 'fs';
import {finished} from 'stream';
import {promisify} from 'util';
import csv from 'csv-parse';

const asyncFinished = promisify(finished);

/**
 * Gets the WHO Data dir used to produce certificates.
 *
 * @param {string} path - A path to the who data dir.
 *
 * @throws {Error} - Throws if the dir is not found or is empty.
 *
 * @returns {Promise<Array<string>>} Dir and file names.
*/
export async function getDir(path) {
  const directory = await fs.readdir(path);
  if(directory.length <= 0) {
    throw new Error(`Dir ${path} is empty`);
  }
  return directory;
}

export async function getCSV({path, parser = new csv.Parser()}) {
  const records = [];
  const fileStream = createReadStream(path).pipe(parser);
  fileStream.on('readable', function() {
    let record = fileStream.read();
    while(record != null) {
      records.push(record);
      record = fileStream.read();
    }
  });
  await asyncFinished(fileStream);
  return records;
}

export async function writeJSON({path, data}) {
  return fs.writeFile(path, JSON.stringify(data, null, 2));
}
