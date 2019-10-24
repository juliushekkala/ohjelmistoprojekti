## checkHTTP
Returns an object (dictionary) where each found url is linked to boolean. True = https, False = http
key = addr_list

## checkSecurityScheme
#Returns an object that includes everything in securitySchemes if it exists, else return False
key = sec_schemes

## Object shape
Each function has own key that has object as value
status -key has boolean value, false if problems were found
object -> key: result: status: boolean