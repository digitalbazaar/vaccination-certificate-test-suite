/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as fs from 'fs/promises';
import {join} from 'path';

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

async function generateCertificates() {
  try {
  const path = join(process.cwd(), '.who-data', 'svc2')
  const whoDataDir = await getWhoDir(path);
  } catch(e) {
    console.error(e);
  }
}

generateCertificates();
