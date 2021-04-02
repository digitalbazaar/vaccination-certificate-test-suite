/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {v4 as uuid} from 'uuid';

// FIXME: this needs to generate a real uvci.
export function uvci() {
  const input = Buffer.from(uuid());
  return input.toString('base64');
}

