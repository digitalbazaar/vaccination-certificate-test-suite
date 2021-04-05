/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import Implementation from './implementation.js';
import * as chai from 'chai';

const should = chai.should();

// we need this as a test so the implementations
// and certificates have been loaded
it('Vaccine Credentials', function() {
  const implementations = global.test.implementations;
  const certificates = global.test.certificates;
  for(const certificate of certificates) {
    describe(certificate.name, function() {
      for(const settings of implementations) {
        it(`should be issued by ${settings.name}`, async function() {
          const implementation = new Implementation(settings);
          const response = await implementation.issue(
            {credential: certificate});
          should.exist(response);
          response.status.should.equal(201);
          should.exist(response.data);
          response.data.should.be.an('object');
        });
      }
    });
  }
});
