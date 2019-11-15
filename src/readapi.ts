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

//Checks that OAuth2 authorization and token URLs in security schemes are valid url
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
                    //If the authorization url is not a valid url
                    if (!validUrl.isUri(authorizationUrl)) {
                        sec_schemes[secScheme]['flows'][flowType]['status'] = false;     
                        returnValue = false;
                    //If the authorization url is a valid url 
                    } else {
                        sec_schemes[secScheme]['flows'][flowType]['status'] = true; 
                    }
                }
                
                if (sec_schemes[secScheme]['flows'][flowType]['tokenUrl'] !== undefined) {
                    var tokenUrl = sec_schemes[secScheme]['flows'][flowType]['tokenUrl'];
                    //If the token url is not a valid url
                    if (!validUrl.isUri(tokenUrl)) {
                        sec_schemes[secScheme]['flows'][flowType]['status'] = false;   
                        returnValue = false;
                    //If the token url is a valid url    
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
checkSecurityField() {
    var sec_field = this.yaml.security;
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

    //if there are empty security requirements (as in just "- {}"))
    if (sec_field.length > 0) {
        for (var sec in sec_field) {
            if (Object.keys(sec_field[sec]).length === 0) {
                let sec_field: {[index: string]:boolean} = {};
                sec_field['status'] = false;
                return sec_field;  
            }
        }
    }
    
    
    sec_field['status'] = true;
    return sec_field;
}

public checkSecurity() {
    var api_object: {[index: string]:any} = {};
    api_object['addr_list'] = this.checkHTTP();
    api_object['sec_schemes'] = this.checkSecurityScheme();
    api_object['sec_field'] = this.checkSecurityField();
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