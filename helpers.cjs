/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {v4: uuid} = require('uuid');

// FIXME: this needs to generate a real uvci.
function uvci() {
  const input = Buffer.from(uuid());
  return input.toString('base64');
}

module.exports = {
  uvci
};
