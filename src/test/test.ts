import { Datavalidationcheck } from '../datavalid';
import {Apicheck} from '../readapi';
import { expect } from 'chai';
import 'mocha';
const yaml = require('js-yaml');
const fs = require('fs');
var ymlfile = yaml.safeLoad(fs.readFileSync('test/yamls/linkexample.yaml', 'utf8'));
let validationClass = new Datavalidationcheck(ymlfile);
let readApiClass = new Apicheck(ymlfile);
describe('First yaml', () => {
 
  it('should return the amount of properties in schemas', () => {
    var responses: {[index: string]:any} = {};
    validationClass.findTargets("properties", ymlfile, responses, "schemas");
    let i=0;
    for (var thing in responses) {
      i++;
    }
    expect(i).to.equal(3);
  });
  it('should return the status of global security scheme', () => {
    var responses: {[index: string]:any} = {};
    responses = readApiClass.checkSecurityScheme();
    let result = responses['status'];
    expect(result).to.equal(false);
  });

  
}); 

describe('Second test', () => {
 
  it('should return the amount of properties in schemas', () => {
    var responses: {[index: string]:any} = {};
    validationClass.findTargets("properties", ymlfile, responses, "schemas");
    let i=0;
    for (var thing in responses) {
      i++;
    }
    expect(i).to.equal(3);
  });
}); 