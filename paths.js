/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';
import {join} from 'path';

const conditionsList = 'WHO list of vaccinable Conditions.csv';
const whoData = join(process.cwd(), '.who-data', 'svc');

export const paths = {
  whoData,
  conditions: join(whoData, 'input', 'data', conditionsList),
  certificates: join(process.cwd(), 'certificates')
};
