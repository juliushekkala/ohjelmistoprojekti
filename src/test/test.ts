import { Datavalidationcheck } from '../datavalid';
import {Apicheck} from '../readapi';
import { expect } from 'chai';
import 'mocha';
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
var ymlfile = yaml.safeLoad(fs.readFileSync('src/test/yamls/petstore.yaml', 'utf8'));
let validationClass = new Datavalidationcheck(ymlfile);
let readApiClass = new Apicheck(ymlfile);
describe('Testing different functions', () => {
 
  it('Testing findTargets() 1', () => {
    var responses: {[index: string]:any} = {};
    validationClass.findTargets("properties", ymlfile['components'], responses, "schemas");
    let i=0;
    for (var thing in responses) {
      i++;
    }
    expect(i).to.equal(6);
    expect(responses).to.have.keys("schemas/schemas/Order/properties", "schemas/schemas/Category/properties", "schemas/schemas/User/properties", "schemas/schemas/Tag/properties",
    "schemas/schemas/Pet/properties", "schemas/schemas/ApiResponse/properties");
  });
 /* it('Testing checkSecurityScheme()', () => {
    var responses: {[index: string]:any} = {};
    responses = readApiClass.checkSecurityScheme();
    let result = responses['status'];
    expect(result).to.equal(false);
  });*/

  it('Testing findTargets() 2', () => {
    var responses: {[index: string]:any} = {};
    let searchData = ymlfile['tags'];
    validationClass.findTargets("name", searchData, responses, "tags");
    let i=0;
    for (var thing in responses) {
      i++;
    }
    expect(i).to.equal(3);
    expect(responses).to.have.keys(["tags/0/name", "tags/1/name", "tags/2/name"]);
    //expect(responses).to.have.deep.property("pet", "store", "user");
  });
  
  it('Testing findTargets() 3', () => {
    var responses: {[index: string]:any} = {};
    let searchData = ymlfile['paths'];
    validationClass.findTargets("responses", searchData, responses, "paths");
    let i=0;
    for (var thing in responses) {
      i++;
    }
    expect(i).to.equal(20);
    expect(responses).to.have.keys("paths//pet/post/responses", "paths//pet/put/responses", "paths//pet/findByStatus/get/responses", "paths//pet/findByTags/get/responses", "paths//pet/{petId}/get/responses",
    "paths//pet/{petId}/post/responses", "paths//pet/{petId}/delete/responses", "paths//pet/{petId}/uploadImage/post/responses", "paths//store/inventory/get/responses", "paths//store/order/post/responses",
    "paths//store/order/{orderId}/get/responses", "paths//store/order/{orderId}/delete/responses", "paths//user/post/responses", "paths//user/createWithArray/post/responses",
    "paths//user/createWithList/post/responses", "paths//user/login/get/responses", "paths//user/logout/get/responses", "paths//user/{username}/get/responses", "paths//user/{username}/put/responses", "paths//user/{username}/delete/responses");
  
  });

  it('testing checkHTTP', () => {
    fs.readdir('src/test/yamls/', function (err: any, files: any) {
      if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
      }
      files.forEach(function (file: any, index: any) {
        // Make one pass and make the file complete
        var location = path.join('src/test/yamls', file);
        var ymlfile = yaml.safeLoad(fs.readFileSync(location, 'utf8'));
        var readApiTest = new Apicheck(ymlfile);
        let result = readApiTest.checkHTTP();
      //  console.log(result);
      //  console.log(file);
        if (typeof result['status'] !== 'undefined') 
        {
          expect(result['status']).to.equal(false);
        }
      });
    });
  });
  it('testing checkSecuritySchemes', () => {
    fs.readdir('src/test/yamls/', function (err: any, files: any) {
      if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
      }
      files.forEach(function (file: any, index: any) {
        // Make one pass and make the file complete
        var location = path.join('src/test/yamls', file);
        var ymlfile = yaml.safeLoad(fs.readFileSync(location, 'utf8'));
        var readApiTest = new Apicheck(ymlfile);
        let result = readApiTest.checkSecurityScheme();
      //  console.log(result);
    //    console.log(file);
        if (typeof result['status'] !== 'undefined') 
        {
          expect(result).to.include.keys('status');
        }
      });
    });
  });
  it('testing checkOAuth2Urls', () => {
    fs.readdir('src/test/yamls/', function (err: any, files: any) {
      if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
      }
      files.forEach(function (file: any, index: any) {
        // Make one pass and make the file complete
        var location = path.join('src/test/yamls', file);
        var ymlfile = yaml.safeLoad(fs.readFileSync(location, 'utf8'));
        var readApiTest = new Apicheck(ymlfile);
        let result1 = readApiTest.checkSecurityScheme();
        let result = readApiTest.checkOAuth2Urls(result1);
   //     console.log("result is " + result.toString());
        if (result1 === false) {
          expect(result).to.have.deep.property("type", "oauth2");
          expect(result).to.have.deep.property("status", "false");
        }
      
    });
  });
}); 
it('testing checkSecurityField()', () => {
  fs.readdir('src/test/yamls/', function (err: any, files: any) {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    }
    files.forEach(function (file: any, index: any) {
      // Make one pass and make the file complete
      var location = path.join('src/test/yamls', file);
      var ymlfile = yaml.safeLoad(fs.readFileSync(location, 'utf8'));
      var readApiTest = new Apicheck(ymlfile);
      let result1 = readApiTest.checkSecurityField(ymlfile.security);
      expect(result1).to.include.keys("status");
  });
});
}); 

it('testing responseCheck()', () => {
  fs.readdir('src/test/yamls/', function (err: any, files: any) {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    }
    files.forEach(function (file: any, index: any) {
      // Make one pass and make the file complete
      var location = path.join('src/test/yamls', file);
      var ymlfile = yaml.safeLoad(fs.readFileSync(location, 'utf8'));
      var readApiTest = new Apicheck(ymlfile);
      let result1 = readApiTest.checkSecurityField(ymlfile.security);
      let result2 = readApiTest.responseCheck(result1['status']);
     // console.log(result2);
      expect(result2).to.be.an('object').that.is.not.empty;
  });
});
}); 



});

