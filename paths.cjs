/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {join} = require('path');

const conditionsList = 'WHO list of vaccinable Conditions.csv';
const whoData = join(process.cwd(), '.who-data', 'svc');

const paths = {
  whoData,
  conditions: join(whoData, 'input', 'data', conditionsList),
  certificates: join(process.cwd(), 'certificates'),
  implementations: join(process.cwd(), 'implementations')
};

module.exports = {
  paths
};
