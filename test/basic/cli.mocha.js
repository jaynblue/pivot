/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const expect = require('chai').expect;
const exec = require('child_process').exec;
const extend = require('./../utils/extend');

describe('cli', function () {
  this.timeout(10000);

  it('shows help', (testComplete) => {
    exec('bin/pivot', (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stdout).to.contain('Usage: pivot [options]');
      expect(stderr).to.equal('');
      testComplete();
    });
  });

  it('shows version', (testComplete) => {
    exec('bin/pivot --version', (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stdout).to.contain('0.');
      expect(stderr).to.equal('');
      testComplete();
    });
  });

  it('prints the config', (testComplete) => {
    exec('bin/pivot --example wiki --print-config', (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stdout).to.contain('# generated by Pivot version');
      expect(stdout).to.contain('defaultPinnedDimensions: ["channel","namespace","isRobot"]');
      expect(stderr).to.equal('');
      testComplete();
    });
  });

  it('prints the config with comments', (testComplete) => {
    exec('bin/pivot --example wiki --print-config --with-comments', (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stdout).to.contain('# generated by Pivot version');
      expect(stdout).to.contain("# The list of measures defined in the UI. The order here will be reflected in the UI");
      expect(stderr).to.equal('');
      testComplete();
    });
  });

  it('reads a config an prints it inlined', (testComplete) => {
    exec('bin/pivot --config test/configs/inline-vars.yaml --print-config',
      {
        env: extend(process.env, {
          DS_NAME: 'test1',
          DS_TITLE: 'Test One Title',
          DS_SOURCE: '../../assets/data/wikiticker-2015-09-12-tiny.json'
        })
      },
      (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stdout).to.contain('# generated by Pivot version');
      expect(stdout).to.contain("title: Test One Title");
      expect(stdout).to.contain("name: test1");
      expect(stdout).to.contain("formula: $regionIsoCode");
      expect(stderr).to.equal('');
      testComplete();
    });
  });

  it('complains if an inlined var can not be found', (testComplete) => {
    exec('bin/pivot --config test/configs/inline-vars.yaml',
      {
        env: extend(process.env, {
          DS_NAME: 'test1',
          DS_TITLE: 'Test One Title'
        })
      },
      (error, stdout, stderr) => {
        expect(error).to.be.an('error');
        expect(stderr).to.contain("Could not load config from 'test/configs/inline-vars.yaml': could not find variable 'DS_SOURCE'");
        testComplete();
      });
  });

  it('complains if there are too many settings inputs', (testComplete) => {
    exec('bin/pivot --example wiki --postgres localhost', (error, stdout, stderr) => {
      expect(error).to.be.an('error');
      expect(stderr).to.contain('only one of --config, --examples, --file, --druid, --postgres, --mysql can be given on the command line');
      expect(stderr).to.not.contain('https://github.com/implydata/imply-pivot/blob/master/docs/pivot-0.9.x-migration.md');
      testComplete();
    });
  });

  it('complains if there are too many settings inputs (+message)', (testComplete) => {
    exec('bin/pivot --config blah.yaml --druid localhost', (error, stdout, stderr) => {
      expect(error).to.be.an('error');
      expect(stderr).to.contain('only one of --config, --examples, --file, --druid, --postgres, --mysql can be given on the command line');
      expect(stderr).to.contain('https://github.com/implydata/imply-pivot/blob/master/docs/pivot-0.9.x-migration.md');
      testComplete();
    });
  });

  it('complains if the config settings have an error', (testComplete) => {
    exec('bin/pivot --config test/configs/duplicate-measure-dimension-name.yaml', (error, stdout, stderr) => {
      expect(error).to.be.an('error');
      expect(stderr).to.contain("Could not read setting from config file: name 'language' found in both dimensions and measures in data cube: 'wiki'");
      testComplete();
    });
  });

});
