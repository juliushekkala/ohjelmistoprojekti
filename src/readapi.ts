const yaml = require('js-yaml');
const fs   = require('fs');

//This file is imported to the main plugin file
//Includes functions that check security features of a OPENAPI-file

function checkHTTP(doc: any) {
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
}

try {
    var ymlfile = yaml.safeLoad(fs.readFileSync('test/petstore.yaml', 'utf8'));
} catch (e) {
    console.log(e);
}

checkHTTP(ymlfile);