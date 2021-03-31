/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as fs from 'fs/promises';
import {createReadStream} from 'fs';
import {finished} from 'stream';
import {promisify} from 'util';
import {join} from 'path';
import csv from 'csv-parse';

const contexts = [
  'https://www.w3.org/2018/credentials/v1',
  'https://w3id.org/vaccination/v1'
];
const asyncFinished = promisify(finished);

const conditionsList = 'WHO list of vaccinable Conditions.csv';

/**
 * Gets the WHO Data dir used to produce certificates.
 *
 * @param {string} path - A path to the who data dir.
 *
 * @throws {Error} - Throws if the dir is not found or is empty.
 *
 * @returns {Promise<Array<string>>} Dir and file names.
*/
async function getDir(path) {
  const directory = await fs.readdir(path);
  if(directory.length <= 0) {
    throw new Error(`Dir ${path} is empty`);
  }
  return directory;
}

function getVaccines({records, start = 1}) {
  // the sections of the csv are separated by empty rows
  const firstEmpty = records.findIndex(r => r.every(e => e === ''));
  // so we return all the vaccines before the first empty row
  return records.slice(start, firstEmpty);
}

async function getCSV({path, parser = new csv.Parser()}) {
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

/**
 * Formats data from the WHO into test data.
 *
 * @returns {Promise} Writes data to `/certificates` and exits.
*/
async function generateCertificates() {
  try {
    const paths = {
      conditions: join(
        process.cwd(), '.who-data', 'svc', 'input', 'data', conditionsList),
      implementations: join(process.cwd(), 'implementations'),
      certificates: join(process.cwd(), 'certificates')
    }
    // dir with the csv file of vaccinable conditions
    const records = await getCSV({path: paths.conditions});
    const vaccineList = getVaccines({records});
    const implementations = await getDir(paths.implementations);
console.log({vaccineList, implementations});
  } catch(e) {
    console.error(e);
  }
}

generateCertificates();
