/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as fs from 'fs/promises';
import {join} from 'path';

const contexts = [
  'https://www.w3.org/2018/credentials/v1',
  'https://w3id.org/vaccination/v1'
];

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

/**
 * Formats data from the WHO into test data.
 *
 * @returns {Promise} Writes data to `/certificates` and exits.
*/
async function generateCertificates() {
  try {
    const path = join(process.cwd(), '.who-data', 'svc');
    const whoDataDir = await getWhoDir(path);
  } catch(e) {
    console.error(e);
  }
}

generateCertificates();
