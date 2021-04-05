/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {getJSONFiles} from '../io.js';
import {paths} from '../paths.js';

// do not test these implementations issuers or verifiers
export const notTest = ['Dock', 'Factom', 'SICPA', 'Trybe'];

global.test = {};

export const mochaHooks = {
  async beforeAll() {
    const vendors = await getJSONFiles(paths.implementations);
    global.test = {
      vendors,
      implementations: vendors.filter(v => !notTest.includes(v.name)),
      certificates: await getJSONFiles(paths.certificates)
    };
  }
};
