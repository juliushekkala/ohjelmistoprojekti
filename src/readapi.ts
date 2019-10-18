const yaml = require('js-yaml');
const fs   = require('fs');

//This file is imported to the main plugin file
//Includes functions that check security features of a OPENAPI-file

export function checkHTTP(doc: any) {
    var servers = doc.servers;
    var addrlist: {[index: string]:any} = {};
    for (var server of servers) {
        var address = server['url'];
        console.log(address);
        if (address.startsWith("https")){
            addrlist[address] = true;
        }
        else {
            addrlist[address] = false;
        }
    }
    console.log(addrlist);
    return addrlist;
}