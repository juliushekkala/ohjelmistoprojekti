import { Datavalidationcheck } from '../src/datavalid';
import { expect } from 'chai';
import 'mocha';
const yaml = require('js-yaml');
const fs = require('fs');
 
describe('First test', () => {
 
  it('should return true', () => {
    var ymlfile = yaml.safeLoad(fs.readFileSync('test/yamls/linkexample.yaml', 'utf8'));
    let validationClass = new Datavalidationcheck(ymlfile);
    var result = validationClass.checkSchemas();
    var status = result['status'];
    expect(status).to.equal(true);
  });
}); 