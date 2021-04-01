/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {getJSONFiles} from '../io.js';
import {paths} from '../paths.js';

describe('Vaccine Credentials', function() {
  let implementations;
  let certificates;
  before(async function() {
    implementations = await getJSONFiles(paths.implementations);
    certificates = await getJSONFiles(paths.certificates);
  });
  it('should have certificates', function() {
    for(const certificate of certificates) {
      describe(certificate.name, function() {
        for(const implementation of implementations) {
          it(`should be issued by ${implementation.name}`, async function() {

          });
        }
      });
    }
  });
});
