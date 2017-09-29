const Permission = require('./Permission');
const reduce = require('lodash/reduce');
const intersection = require('lodash/intersection');

class ACL {

  constructor() {
    this.permissions = [];
  }


  getUserRoles(user) {
    return user.roles;
  }

  add(roles, verb, url, permission2) {
    this.permissions.push(new Permission(roles, verb, url, permission2));
  }

  /**
   *
   * @param user
   * @param url
   */
  isPermitted(user, verb, url) {
    const roles = this.getUserRoles(user);

    const success = reduce(this.permissions, (result, permission) => {

      let doesUrlMatch = false;
      const urlMatches = url.match(permission.url);
      console.log(urlMatches);
      if(urlMatches && urlMatches.length) {
        doesUrlMatch = true;
      }
      const doesVerbMatch = verb == permission.verb;
      const doesRoleMatch = intersection(roles, permission.roles).length > 0;
      const isAllowed = permission.permission2 === ACL.PERMISSION_ALLOW;
      console.log(permission.permission2);
      console.log(ACL.PERMISSION_ALLOW);
      const doesAuthorisationMatch = doesUrlMatch && doesVerbMatch && doesRoleMatch;
      console.log(isAllowed);
      console.log(doesUrlMatch);
      console.log(doesVerbMatch);
      console.log(doesRoleMatch);

      if (doesAuthorisationMatch) {
        return doesAuthorisationMatch && isAllowed;
      }else{
        return result;
      }

    }, false);


    return success;
  }

  clear() {
    this.permissions = [];
  }
}

ACL.PERMISSION_DENY = 'deny';
ACL.PERMISSION_ALLOW = 'allow';

ACL.VERB_GET = 'GET';
ACL.VERB_POST = 'POST';
ACL.VERB_PUT = 'PUT';
ACL.VERB_PATCH = 'PATCH';
ACL.VERB_DELETE = 'DELETE';


module.exports = new ACL();