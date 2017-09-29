# Node ACL

This library provides a minimalistic ACL implementation with no connection to a database.

### Installation
```bash
$ npm install node-acl --save


```

### Define the authorisations
It's recommended to deny access to all, then allows the routes for a specific role.

```js
acl.add(['any'], 'any' , '.*', 'deny');
acl.add(['admin', 'developer'], 'any' , '.*', 'allow');
acl.add(['authenticated', 'marketing'], 'GET' , '/api/cases/.*', 'allow');
acl.add(['authenticated', 'marketing'], 'POST' , '/api/cases/.*', 'allow');
acl.add(['marketing'], 'DELETE' , '/api/cases/.*', 'deny');
```

### Check the access
Checks the access by getting the user roles
```js
const user = {
    ...
    roles: ['authenticated'],
  };
acl.can(user, 'GET', '/api/cases/123-abc/comments/456-abc') // return true
```
```js
const user = {
    roles: ['marketing']
  };
acl.can(user, 'GET', '/api/cases/123-abc') // return true
acl.can(user, 'POST', '/api/cases/123-abc') // return true
acl.can(user, 'DELETE', '/api/cases/123-abc') // return false
```

### Custom user structure
```js

acl.setRolesGetter(user => {
    const roles = [];
    if (user.admin) {
      roles.push('admin');
    }
    if (user.developer) {
      roles.push('developer');
    }
    return roles;
});

const user = {
    ...
    admin: true,
    authenticated: true,
  };

acl.can(user, 'GET', '/api/cases') // return true
```

### Documentation

#### add(roles, verb, url, permission)
Adds a specific access control.  

>*roles* {Array<string>} Any role that you want. any may be used a wildcard  
*verb* {string} GET|POST|PATCH|PUT|DELETE|any (wildcard)  
*url* {string} RegExp route  
*permission* {string} allow|deny  
  
#### can(user, verb, url)
Returns if the user have access to a specific route.  

>*roles* {Array<string>} Any role that you want. any may be used a wildcard  
*verb* {string} GET|POST|PATCH|PUT|DELETE|any (wildcard)  
*url* {string} RegExp route  

#### setRolesGetter(method)  
Defines a custom method to retrieve the user roles  

>*method* {Function} Function called when acl needs to retrieve the user roles  

