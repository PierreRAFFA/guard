const Access = require('./access');
const reduce = require('lodash/reduce');
const intersection = require('lodash/intersection');
const uniq = require('lodash/uniq');
const union = require('lodash/union');
////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////// CONSTRUCTOR
function Acl() {
  this.accesses = [];
  this.rolesGetter = null;
}

Acl.DEFAULT_USER_ALLOWED = true;

Acl.ROLE_ANY = 'any';
Acl.ROLE_AUTHENTICATED = 'authenticated';

Acl.VERB_ANY = 'any';
Acl.VERB_GET = 'GET';
Acl.VERB_POST = 'POST';
Acl.VERB_PUT = 'PUT';
Acl.VERB_PATCH = 'PATCH';
Acl.VERB_DELETE = 'DELETE';

Acl.PERMISSION_DENY = 'deny';
Acl.PERMISSION_ALLOW = 'allow';
////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////// ADD
/**
 * Adds a specific access control
 *
 * @param roles {Array<string>}
 * @param verb {string} May be GET|POST|PATCH|PUT...
 * @param url {string} Regexp Route
 * @param permission {string} May be allow|deny
 */
Acl.prototype.add = function(roles, verb, url, permission) {
  this.accesses.push(new Access(roles, verb, url, permission));
};
////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////// CAN
/**
 * Checks the access to a specific route for a specific user.
 *
 * @param user {object} User containing the roles
 * @param verb {string} May be GET|POST|PATCH|PUT...
 * @param url {string} Route
 * @returns {boolean}
 */
Acl.prototype.can = function(user, verb, url) {
  const roles = this.getUserRoles(user);

  const success = reduce(this.accesses, (result, permission) => {

    let doesUrlMatch = false;
    const urlMatches = url.match(permission.url);
    if(urlMatches && urlMatches.length) {
      doesUrlMatch = true;
    }
    const doesVerbMatch = verb == permission.verb || permission.verb == Acl.VERB_ANY;
    const doesRoleMatch = permission.roles.indexOf(Acl.ROLE_ANY) >= 0 || intersection(roles, permission.roles).length > 0;
    const isAllowed = permission.permission === Acl.PERMISSION_ALLOW;
    const doesAuthorisationMatch = doesUrlMatch && doesVerbMatch && doesRoleMatch;
    // console.log(isAllowed);
    // console.log(doesUrlMatch);
    // console.log(doesVerbMatch);
    // console.log(doesRoleMatch);

    if (doesAuthorisationMatch) {
      return doesAuthorisationMatch && isAllowed;
    }else{
      return result;
    }

  }, Acl.DEFAULT_USER_ALLOWED);

  return success;
};

/**
 * Returns the user roles
 * By default, gets the user roles by checking 'roles' property in 'user'
 * But it can be customised by specifying a custom method 'rolesGetter'
 *
 * @param user {object} User containing the roles
 * @returns {*}
 */
Acl.prototype.getUserRoles = function(user) {
  if (!user) return [];

  let roles = [];

  if (this.rolesGetter && typeof this.rolesGetter === 'function') {
    roles = this.rolesGetter(user) || [];
  }else{
    roles = user.roles;
  }

  //any user is by default considered as authenticated if it contains an id
  if(user.id) {
    roles.push(Acl.ROLE_AUTHENTICATED);
  }

  return uniq(roles);
};

/**
 * Denies all routes for all users
 */
Acl.prototype.denyAll = function() {
  this.add(['any'], 'any' , '.*', 'deny');
};
////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////// CUSTOM
/**
 * Defines a custom method to retrieve the user roles
 * @param method
 */
Acl.prototype.setRolesGetter = function(method) {
  this.rolesGetter = method;
};
////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////// CLEAR
/**
 * Clears any accesses
 */
Acl.prototype.clear = function() {
  this.accesses = [];
};
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
exports = module.exports = new Acl();