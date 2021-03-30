/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as fs from 'fs/promises';
import {createReadStream} from 'fs';
import {finished} from 'stream/promises';
import {join} from 'path';
import csv from 'csv-parse';

const parser = new csv.Parser();
const contexts = [
  'https://www.w3.org/2018/credentials/v1',
  'https://w3id.org/vaccination/v1'
];

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
async function getWhoDir(path) {
  let whoDataDir;
  try {
    whoDataDir = await fs.readdir(path);
    if(whoDataDir.length <= 0) {
      throw new Error(`Dir ${path} is empty`);
    }
  } catch(e) {
    console.error(`getWhoDir failed \n` +
      'Did you run `npm run fetch-who-int-svc`? \n');
    throw e;
  }
  return whoDataDir;
}

function getVaccines({records, start = 1}) {
  // the sections of the csv are separated by empty rows
  const firstEmpty = records.findIndex(r => r.every(e => e === ''));
  // so we return all the vaccines before the first empty row
  return records.slice(start, firstEmpty);
}

async function getCSV(path, fileName, dir) {
  const records = [];
  if(!dir.includes(fileName)) {
    throw new Error(`dir does not contain ${fileName}`);
  }
  const _path = join(path, fileName);
  const fileStream = createReadStream(_path).pipe(parser);
  fileStream.on('readable', function() {
    let record = fileStream.read();
    while(record != null) {
      records.push(record);
      record = fileStream.read();
    }
  });
  await finished(fileStream);
  return records;
}

/**
 * Formats data from the WHO into test data.
 *
 * @returns {Promise} Writes data to `/certificates` and exits.
*/
async function generateCertificates() {
  try {
    // dir with the csv file of vaccinable conditions
    const path = join(process.cwd(), '.who-data', 'svc', 'input', 'data');
    const whoDataDir = await getWhoDir(path);
    const records = await getCSV(path, conditionsList, whoDataDir);
    const vaccineList = getVaccines({records});
console.log(vaccineList);
  } catch(e) {
    console.error(e);
  }
}

generateCertificates();
