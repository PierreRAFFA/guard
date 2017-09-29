
function Access(roles, verb, url, permission) {
  this.roles = roles;
  this.verb = verb;
  this.url = url;
  this.permission = permission;
}

exports = module.exports = Access;