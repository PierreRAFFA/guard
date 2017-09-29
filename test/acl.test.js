/**
 * Created by pierreraffa on 28/09/2017.
 */
const test = require('ava').test;
const acl = require('../lib');
const reduce = require('lodash/reduce');

test.beforeEach(t => {
  acl.clear();
});

test('NO access specified so any user should have access', async t => {
  const user = {
    roles: ['authenticated']
  };
  t.is(acl.can(user, 'GET', '/api/cases'), true);
});


test('User with a role matching an denied access should NOT have access', async t => {
  acl.add(['authenticated'], 'GET' , '/api/cases', 'deny');

  const user = {
    roles: ['authenticated']
  };

  t.is(acl.can(user, 'GET', '/api/cases'), false)
});

test('When a deny access for all (with the denyAll), no user should have access', async t => {
  acl.denyAll();

  const user = {
    roles: ['anonymous']
  };

  t.is(acl.can(user, 'GET', '/api/cases'), false)
});

test('When a deny access for all, no user should have access', async t => {
  acl.add(['any'], 'any' , '.*', 'deny');

  const user = {
    roles: ['anonymous']
  };

  t.is(acl.can(user, 'GET', '/api/cases'), false)
});

test('User with an array of role matching an allowed access should have access', async t => {
  acl.add(['any'], 'any' , '.*', 'deny');
  acl.add(['authenticated'], 'GET' , '/api/cases', 'allow');

  const user = {
    roles: ['admin', 'authenticated']
  };

  t.is(acl.can(user, 'GET', '/api/cases'), true)
});

test('User with an array of role NOT matching an allowed access should NOT have access', async t => {
  acl.add(['any'], 'any' , '.*', 'deny');
  acl.add(['developer'], 'GET' , '/api/cases', 'allow');

  const user = {
    roles: ['admin', 'authenticated']
  };

  t.is(acl.can(user, 'GET', '/api/cases'), false)
});

test('When a authenticated access allows some POST url with wildcard, any authenticated should have access', async t => {
  acl.add(['any'], 'any' , '.*', 'deny');
  acl.add(['authenticated'], 'POST' , '/api/cases/.*', 'allow');

  const user = {
    roles: ['authenticated']
  };

  t.is(acl.can(user, 'POST', '/api/cases/123-abc'), true)
});

test('When a authenticated access denies some POST url with wildcard, any authenticated should NOT have access', async t => {
  acl.add(['any'], 'any' , '.*', 'deny');
  acl.add(['authenticated'], 'POST' , '/api/cases/.^[\/]*', 'allow');

  const user = {
    roles: ['authenticated']
  };

  t.is(acl.can(user, 'POST', '/api/cases/123-abc/rr'), false)
});

test('When a authenticated access allows some url with wildcard, any authenticated should have access', async t => {
  acl.add(['any'], 'any' , '.*', 'deny');
  acl.add(['authenticated'], 'GET' , '/api/cases/.*/comments/.*', 'allow');

  const user = {
    roles: ['authenticated']
  };

  t.is(acl.can(user, 'GET', '/api/cases/123-abc/comments/456-abc'), true)
});

test('When a authenticated access allows some url with wildcard, any authenticated should NOT have access', async t => {
  acl.add(['any'], 'any' , '.*', 'deny');
  acl.add(['authenticated'], 'GET' , '/api/cases/.*/comments/.*', 'deny');

  const user = {
    roles: ['authenticated']
  };

  t.is(acl.can(user, 'GET', '/api/cases/123-abc/comments/456-abc'), false)
});

test('When a admin access allows all, any admin should have access', async t => {
  acl.add(['any'], 'any' , '.*', 'deny');
  acl.add(['admin'], 'GET' , '.*', 'allow');

  const user = {
    roles: ['admin', 'authenticated']
  };

  t.is(acl.can(user, 'GET', '/api/cases'), true)
});

test('When a admin access allows all, any admin with other role should have access', async t => {
  acl.add(['any'], 'any' , '.*', 'deny');
  acl.add(['admin'], 'GET' , '/api/.*', 'allow');

  const user = {
    roles: ['admin', 'authenticated']
  };

  t.is(acl.can(user, 'GET', '/api/cases'), true)
});

test('When a admin access allows all, any user other than admin should NOT have access', async t => {
  acl.add(['any'], 'any' , '.*', 'deny');
  acl.add(['admin'], 'GET' , '.*', 'allow');

  const user = {
    roles: ['authenticated']
  };

  t.is(acl.can(user, 'GET', '/api/cases'), false)
});

test('When a custom roles getter is specified, the user is admin, any admin should have access', async t => {
  acl.setRolesGetter(user => {
    return user.customRoles;
  });

  acl.add(['any'], 'any' , '.*', 'deny');
  acl.add(['admin'], 'GET' , '/api/.*', 'allow');

  const user = {
    customRoles: ['admin', 'authenticated']
  };

  t.is(acl.can(user, 'GET', '/api/cases'), true)
});

test('When a custom roles getter is specified, the user is admin, any admin should NOT have access', async t => {
  acl.setRolesGetter(user => {
    return user.customRoles;
  });

  acl.add(['any'], 'any' , '.*', 'deny');
  acl.add(['authenticated'], 'GET' , '/api/.*', 'allow');

  const user = {
    customRoles: ['anonymous']
  };

  t.is(acl.can(user, 'GET', '/api/cases'), false)
});


test('When a custom roles getter is specified, the user is admin, any admin should have access', async t => {
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

  acl.add(['any'], 'any' , '.*', 'deny');
  acl.add(['admin'], 'GET' , '/api/.*', 'allow');

  const user = {
    admin: true,
    developer: true,
  };

  t.is(acl.can(user, 'GET', '/api/cases'), true)
});


test('When no access is specified, an user with NO role should have access', async t => {
  const user = {};

  t.is(acl.can(user, 'GET', '/api/cases'), true)
});

test('When all access is denied, an user with NO role should NOT have access', async t => {
  const user = {};
  acl.denyAll();
  t.is(acl.can(user, 'GET', '/api/cases'), false)
});