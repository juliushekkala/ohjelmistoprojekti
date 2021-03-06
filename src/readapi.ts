import * as datavalid from "./datavalid";

const yaml = require('js-yaml');
const fs   = require('fs');
const validUrl = require('valid-url');

//This file is imported to the main plugin file
//Includes functions that check security features of a OPENAPI-file

export class Apicheck {

    yaml: any;
    constructor(doc: any) {
        this.yaml = doc;
    }
checkHTTP() {
    //Returns an object (dictionary) where each found url is linked to boolean. True = https, False = http
    var servers = this.yaml.servers;
    var addr_list: {[index: string]:any} = {};

    //Go through servers, check if their urls start with https and update object accordingly
    if (typeof servers !== "undefined") {
        for (var server of servers) {
            var address = server['url'];
            //console.log(address);
            if (address.startsWith("https")){
                addr_list[address] = true;
            }
            else {
                addr_list[address] = false;
                addr_list['status'] = false;
            }
        }
    }
   
    //console.log(addrlist);
    return addr_list;
}

checkSecurityScheme() {
    var sec_schemes = this.yaml.components.securitySchemes;
    if (typeof sec_schemes === "undefined") {
        let sec_schemes: {[index: string]:boolean} = {};
        sec_schemes['status'] = false;
        return sec_schemes;
    }
    var statusValue: boolean = this.checkOAuth2Urls(sec_schemes);
    sec_schemes['status'] = statusValue;
    return sec_schemes;
}

//Checks that OAuth2 authorization and token URLs in security schemes are valid HTTPS URLs
checkOAuth2Urls(sec_schemes: any): boolean {
    var returnValue: boolean;
    returnValue = true;
    //Go through all the different schemes
    for (var secScheme in sec_schemes) {
        var schemeType = sec_schemes[secScheme]['type'];
        //If the scheme uses oauth2
        if (schemeType === "oauth2") {
            var flows = sec_schemes[secScheme]['flows'];
            //Go through the different flows
            for (var flowType in flows) {
               
                if (sec_schemes[secScheme]['flows'][flowType]['authorizationUrl'] !== undefined) {
                    var authorizationUrl = sec_schemes[secScheme]['flows'][flowType]['authorizationUrl'];
                    //If the authorization url is not a valid https url
                    if (!validUrl.isHttpsUri(authorizationUrl)) {
                        sec_schemes[secScheme]['flows'][flowType]['status'] = false;
                        sec_schemes[authorizationUrl] = false;     
                        returnValue = false;
                    //If the authorization url is a valid https url 
                    } else {
                        sec_schemes[secScheme]['flows'][flowType]['status'] = true; 
                    }
                }
                
                if (sec_schemes[secScheme]['flows'][flowType]['tokenUrl'] !== undefined) {
                    var tokenUrl = sec_schemes[secScheme]['flows'][flowType]['tokenUrl'];
                    //If the token url is not a valid https url
                    if (!validUrl.isHttpsUri(tokenUrl)) {
                        sec_schemes[secScheme]['flows'][flowType]['status'] = false;
                        sec_schemes[tokenUrl] = false;        
                        returnValue = false;
                    //If the token url is a valid https url    
                    } else {
                        sec_schemes[secScheme]['flows'][flowType]['status'] = true; 
                    }
                }
            }
           
        }
     }
     return returnValue;

}

//Check whether global security field is defined && that it is not an empty array
checkSecurityField(sec_field: any) {
    
    //console.log(sec_field);
    //not defined
    if (typeof sec_field === "undefined") {
        let sec_field: {[index: string]:boolean} = {};
        sec_field['status'] = false;
        return sec_field;
    }

    //if the security field is just an empty array
    if (sec_field.length === 0) {
        let sec_field: {[index: string]:boolean} = {};
        sec_field['status'] = false;
        return sec_field;  
    }

    //if there are empty security requirements in a list(as in just "- {}"))
    if (sec_field.length > 0) {
        for (var sec in sec_field) {
            if (Object.keys(sec_field[sec]).length === 0) {
                let sec_field: {[index: string]:boolean} = {};
                sec_field['status'] = false;
                return sec_field;  
            }
        }
    }
    //If the global security field is an empty object (as in "{}")
    if (typeof sec_field === "object") {
        if (Object.keys(sec_field).length === 0) {
            let sec_field: {[index: string]:boolean} = {};
                sec_field['status'] = false;
                return sec_field;  
        }
    }
    
    
    sec_field['status'] = true;
    return sec_field;
}

//Checks the correctness of different response definitions. 
responseCheck(secStatus: boolean) {
    //Use the Json object parser found in datavalid.ts
    let targetFinder = new datavalid.Datavalidationcheck(this.yaml);
    var responses: {[index: string]:any} = {};
    var responseSec: {[index: string]: any} = {};
    let field = this.yaml.paths; 
    if (typeof field === 'object') {
        //Find all response definitions in the yaml
        targetFinder.findTargets('responses', field, responses, 'paths');
        targetFinder.findTargets('security', field, responseSec, 'paths');
    }
    
    //Go through the different responses
    for (var response in responses) {
        //Split the location string    
        var resp = response.split("/");
        //Get the operation that the response codes refer to 
        var operation = resp[resp.length - 2];
        var oper_long: string = response.substring(0, response.length - 9);
        var security_check: string = oper_long + "security";
        //For each response code
        for (var responseCode in responses[response]) {
            
            if (operation !== "head") {
                //Check if 400 response code is defined
                if (responses[response]['400status'] !== true) {
                    if (responseCode === '400') {
                        responses[response]['400status'] = true;
                        
                    } else {
                        responses[response]['400status'] = false;
                    }
                }
                //Check if 429 response code is defined 
                if (responses[response]['429status'] !== true) {
                    if (responseCode === '429') {
                        responses[response]['429status'] = true;
                        
                    } else {
                        responses[response]['429status'] = false;
                    }
                }
                //Check if 500 response code is defined
                if (responses[response]['500status'] !== true) {
                    if (responseCode === '500') {
                        responses[response]['500status'] = true;
                        
                    } else {
                        responses[response]['500status'] = false;
                    }
                }
            }
            
            //Check if GET, PUT, HEAD and DELETE operations have their 404 response defined
            if ((operation === "get" || operation === "put" || operation === "head" || operation === "delete") && responses[response]['404status'] !== true) {
                if (responseCode === '404') {
                    responses[response]['404status'] = true;
                    
                } else {
                    responses[response]['404status'] = false;
                }
            }
            
            //GET operations: Is a 200 or 202 response defined
            if (operation === "get" && responses[response]['getStatus'] !== true) {
                if (responseCode === '200' || responseCode === '202') {
                    responses[response]['getStatus'] = true;
                } else {
                    responses[response]['getStatus'] = false;
                }
            }

            //OPTIONS operations should have 200 response code defined
            if (operation === "options" && responses[response]['oper200status'] !== true) {
               if (responseCode === '200') {
                   responses[response]['oper200status'] = true;
               } else {
                   responses[response]['oper200status'] = false;
               }
            }

            //HEAD operations: Is a 200 or 202 response defined
            if (operation === "head" && responses[response]['headStatus'] !== true) {
                if (responseCode === '200' || responseCode === '202') {
                    responses[response]['headStatus'] = true;
                } else {
                    responses[response]['headStatus'] = false;
                }
            }

            //DELETE operations: Is a 200, 201, 202 or 204 response defined
            if (operation === "delete" && responses[response]['deleteStatus'] !== true) {
                if (responseCode === '200' || responseCode === '201' || responseCode === '202' || responseCode === '204') {
                    responses[response]['deleteStatus'] = true;
                } else {
                    responses[response]['deleteStatus'] = false;
                }
            }

            //PATCH operations: Is a 200, 201, 202 or 204 response defined
            if (operation === "patch" && responses[response]['patchStatus'] !== true) {
                if (responseCode === '200' || responseCode === '201' || responseCode === '202' || responseCode === '204') {
                    responses[response]['patchStatus'] = true;
                } else {
                    responses[response]['patchStatus'] = false;
                }
            }

            //POST operations: Is a 200, 201, 202 or 204 response defined
            if (operation === "post" && responses[response]['postStatus'] !== true) {
                if (responseCode === '200' || responseCode === '201' || responseCode === '202' || responseCode === '204') {
                    responses[response]['postStatus'] = true;
                } else {
                    responses[response]['postStatus'] = false;
                }
            }

            //PUT operations: Is a 200, 201, 202 or 204 response defined
            if (operation === "put" && responses[response]['putStatus'] !== true) {
                if (responseCode === '200' || responseCode === '201' || responseCode === '202' || responseCode === '204') {
                    responses[response]['putStatus'] = true;
                } else {
                    responses[response]['putStatus'] = false;
                }
            }

            //Checks if default status is defined. It is optional so not that big of a deal
            if (responses[response]['defaultstatus'] !== true) {
                if (responseCode === 'default') {
                    responses[response]['defaultstatus'] = true;
                } else {
                    responses[response]['defaultstatus'] = false;
                }
            }
            
            //If security is defined for the operation, 401 and 403 responses should be defined
            if (responses[response]['sec401status'] !== true || responses[response]['sec403status'] !== true) {
                //If global securily defined
                if (secStatus === true) {
                    if (responseCode === '401') {
                        responses[response]['sec401status'] = true;
                    }
                    else if (responseCode === '403') {
                        responses[response]['sec403status'] = true;
                    } else {
                        if (typeof responses[response]['sec401status'] === "undefined") {
                            responses[response]['sec401status'] = false;
                        }
                        if (typeof responses[response]['sec403status'] === "undefined") {
                            responses[response]['sec403status'] = false;
                        }
                    }
                //If operation has specific security defined
                } else if (typeof responseSec[security_check] !== "undefined") {
                    //Check the security field
                    
                    var sec = this.checkSecurityField(Object.assign({}, responseSec[security_check]));
                    //console.log(sec);
                    if (sec['status'] === true) {
                        if (responseCode === '401') {
                            responses[response]['sec401status'] = true;
                        }
                        else if (responseCode === '403') {
                            responses[response]['sec403status'] = true;
                        } else {
                            if (typeof responses[response]['sec401status'] === "undefined") {
                                responses[response]['sec401status'] = false;
                            }
                            if (typeof responses[response]['sec403status'] === "undefined") {
                                responses[response]['sec403status'] = false;
                            }
                        }
                    }
                } else {
                    responses[response]['sec401status'] = true;
                    responses[response]['sec403status'] = true;
                }
            }
            





           

        }
    }
    return responses;

}

public checkSecurity() {
    var api_object: {[index: string]:any} = {};
    api_object['addr_list'] = this.checkHTTP();
    api_object['sec_schemes'] = this.checkSecurityScheme();
    api_object['sec_field'] = this.checkSecurityField(this.yaml.security);
    api_object['responses'] = this.responseCheck(api_object['sec_field']['status']);
    console.log(api_object);
    return api_object;
}
}

//Everything below is testing only and should always be commented out before committing changes
/* 
try {
    var ymlfile = yaml.safeLoad(fs.readFileSync('test/petstore.yaml', 'utf8'));
} catch (e) {
    console.log(e);
}

var schemes = checkSecurity(ymlfile);
console.log(schemes);
*/