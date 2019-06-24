/**
 *
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */

var fs = require('fs');
var path = require('path');
var request = require('request');

var bootstrap = require('./bootstrap');
var chai = bootstrap.chai;
var expect = chai.expect;
var assert = chai.assert;
var models = bootstrap.models;
var log = bootstrap.log();

var User1Context = {
  ctx: {
    'tenantId': 'default',
    'remoteUser': 'user1',
    'username': 'user1'
  }
};
var User2Context = {
  ctx: {
    'tenantId': 'default',
    'remoteUser': 'user2',
    'username': 'user2'
  }
};
var User3Context = {
  ctx: {
    'tenantId': 'default',
    'remoteUser': 'user3',
    'username': 'user3'
  }
};
var User1Details = {
  'username': 'user1',
  'email': 'user1@oe.com',
  'password': 'user1',
  'id': 'user1'
};
var User2Details = {
  'username': 'user2',
  'email': 'user2@oe.com',
  'password': 'user2',
  'id': 'user2'
};
var User3Details = {
  'username': 'user3',
  'email': 'user3@oe.com',
  'password': 'user3',
  'id': 'user3'
};
var User1Credentials = {
  'username': 'user1',
  'password': 'user1'
};

describe('User Creation', function CB() {
  this.timeout(10000);
  var BaseUser = models.BaseUser;

  it('should create user - user1', function CB(done) {
    BaseUser.create(User1Details, bootstrap.defaultContext, function CB(err, users) {
      if (bootstrap.checkDuplicateKeyError(err)) {
        log.debug(users);
        done();
      } else if (err) {
        log.error(err);
        return done(err);
      } else {
        log.debug(users);
        assert.isNotNull(users);
        done();
      }
    });
  });

  it('should create user - user2', function CB(done) {
    BaseUser.create(User2Details, bootstrap.defaultContext, function CB(err, users) {
      if (bootstrap.checkDuplicateKeyError(err)) {
        log.debug(users);
        done();
      } else if (err) {
        log.error(err);
        return done(err);
      } else {
        log.debug(users);
        assert.isNotNull(users);
        done();
      }
    });
  });
  it('should create user - user3', function CB(done) {
    BaseUser.create(User3Details, bootstrap.defaultContext, function CB(err, users) {
      if (bootstrap.checkDuplicateKeyError(err)) {
        log.debug(users);
        done();
      } else if (err) {
        log.error(err);
        return done(err);
      } else {
        log.debug(users);
        assert.isNotNull(users);
        done();
      }
    });
  });
});

describe('Test case for Trigger on Multi Maker Create OE Workflow [ workflow dependent ] - approved', function CB() {
  this.timeout(15000);
  var modelName = 'TestCWCC1';
  var wfName = 'multi-checker';
  var testVars = {};

  it('should create testing model - ' + modelName, function CB(done) {
    var postData = {
      'name': modelName,
      'base': 'BaseEntity',
      'idInjection': true,
      'options': {
        'validateUpsert': true
      },
      'mixins': {},
      'properties': {
        'luckydraw': {
          'type': 'string',
          'required': true
        },
        '_verifiedBy': {
          'type': 'string',
          'required': false
        }
      },
      'relations': {},
      'validations': []
    };


    models.ModelDefinition.create(postData, User1Context, function CB(err, res) {
      if (err) {
        done(err);
      } else {
        // log.debug(res);
        expect(models[modelName]).not.to.be.null;
        expect(models[modelName].definition.properties).not.to.be.undefined;
        expect(Object.keys(models[modelName].definition.properties)).
          to.include.members(Object.keys(models.BaseEntity.definition.properties));
        testVars.modelDetails = res;
        done();
      }
    });
  });

  it('should read the file', function CB(done) {
    fs.readFile(path.resolve('./test/bpmn-files', wfName + '.bpmn'), 'utf8', (err, data) => {
      testVars.xmldata = data;
      done(err);
    });
  });

  it('deploy the WorkflowDefinition', function CB(done) {
    var defData = { 'name': wfName, 'xmldata': testVars.xmldata };
    models.WorkflowDefinition.create(defData, bootstrap.defaultContext, function CB(err, res) {
      // Code for duplicate keys
      if (bootstrap.checkDuplicateKeyError(err)) {
        done();
      }          else {
        done(err);
      }
    });
  });

  it('should attach workflow to ' + modelName, function CB(done) {
    var attachWorkflowDef = {
      'modelName': modelName,
      'workflowBody': {
        'workflowDefinitionName': wfName
      },
      'operation': 'create',
      'version': 'v2',
      'makersRecall': true
    };

    models.WorkflowManager.attachWorkflow(attachWorkflowDef, bootstrap.defaultContext, function cb(err, res) {
      if (err) {
        log.error(err);
        return done(err);
      }
      log.debug(res);
      done();
    });
  });

  it('create an instance of ' + modelName + ' : author - user1', function CB(done) {
    models[modelName].createX({
      'luckydraw': '00000'
    }, User1Context, function cb(err, instance) {
      if (err) {
        log.error(err);
        return done(err);
      }
      log.debug(instance);
      testVars.instanceId = instance.id;
      setTimeout(done, 2000);
    });
  });

  it('check if workflow instance is up', function CB(done) {
    models[modelName].workflow(testVars.instanceId, User2Context, function CB(err, instance) {
      if (err) {
        log.error(err);
        return done(err);
      } else if (instance === null) {
        var errNoWinstance = new Error('No workflow instance found');
        log.error(errNoWinstance);
        return done(errNoWinstance);
      }
      log.debug(instance);
      setTimeout(done, 1000);
    });
  });

  it('check if checker 1 task instance is created', function CB(done) {
    models[modelName].tasks(testVars.instanceId, User2Context, function CB(err, tasks) {
      if (err) {
        log.error(err);
        return done(err);
      } else if (tasks.length === 0) {
        var errNoWinstance = new Error('No task instance found');
        log.error(errNoWinstance);
        return done(errNoWinstance);
      }
      log.debug(tasks);
      testVars.taskInstance = tasks[0];
      done();
    });
  });

  it('findById - user1', function CB(done) {
    models[modelName].findById(testVars.instanceId, User1Context, function cb(err, instance) {
      if (err) {
        log.error(err);
        return done(err);
      }
      log.debug(instance);
      assert.isNull(instance);
      done();
    });
  });

  it('findById [REST] - user1', function CB(done) {
    bootstrap.login(User1Credentials, function CB(err, login) {
      if (err) {
        return done(err);
      }
      assert.isNotNull(login.id);

      var url = bootstrap.basePath + '/' + modelName + 's/' + testVars.instanceId + '/?access_token=' + bootstrap.token;

      request({ url: url, method: 'GET' }, onGet);

      function onGet(err, response) {
        if (err) {
          return done(err);
        }
        var instance = JSON.parse(response.body);
        assert.strictEqual(response.statusCode, 404);
        log.debug(instance);
        done();
      }
    });
  });

  it('complete user task by checker 1', function CB(done) {
    testVars.taskInstance.complete({
      '__action__': 'approved',
      'pv': {
        'comment_by_checker1': 'sample comment'
      }
    }, User2Context, function cb(err, res) {
      if (err) {
        log.error(err);
        return done(err);
      }
      log.debug(res);
      assert.isNotNull(res);
      setTimeout(done, 2000);
    });
  });

  it('findById - user1', function CB(done) {
    models[modelName].findById(testVars.instanceId, User1Context, function cb(err, instance) {
      if (err) {
        log.error(err);
        return done(err);
      }
      log.debug(instance);
      assert.isNull(instance);
      done();
    });
  });

  it('findById [REST] - user1', function CB(done) {
    bootstrap.login(User1Credentials, function CB(err, login) {
      if (err) {
        return done(err);
      }
      assert.isNotNull(login.id);
      //   var token = login.id;

      var url = bootstrap.basePath + '/' + modelName + 's/' + testVars.instanceId + '?access_token=' + bootstrap.token;

      request({ url: url, method: 'GET' }, onGet);

      function onGet(err, response) {
        if (err) {
          return done(err);
        }
        var instance = JSON.parse(response.body);
        assert.strictEqual(response.statusCode, 404);
        log.debug(instance);
        done();
      }
    });
  });

  it('check if checker 2 task instance is created', function CB(done) {
    models[modelName].tasks(testVars.instanceId, User3Context, function CB(err, tasks) {
      if (err) {
        log.error(err);
        return done(err);
      } else if (tasks.length === 0) {
        var errNoWinstance = new Error('No task instance found');
        log.error(errNoWinstance);
        return done(errNoWinstance);
      }
      log.debug(tasks);
      testVars.checkerTaskInstance = tasks[0];
      done();
    });
  });

  it('complete user task by checker 2', function CB(done) {
    testVars.checkerTaskInstance.complete({
      '__action__': 'approved',
      'pv': {
        'comment_by_checker2': 'sample comment'
      }
    }, User3Context, function cb(err, res) {
      if (err) {
        log.error(err);
        return done(err);
      }
      log.debug(res);
      assert.isNotNull(res);
      setTimeout(done, 2000);
    });
  });

  it('findById - user1', function CB(done) {
    models[modelName].findById(testVars.instanceId, User1Context, function cb(err, instance) {
      if (err) {
        log.error(err);
        return done(err);
      }
      log.debug(instance);
      assert.isNotNull(instance);
      done();
    });
  });

  it('findById [REST] - user1', function CB(done) {
    bootstrap.login(User1Credentials, function CB(err, login) {
      if (err) {
        return done(err);
      }
      assert.isNotNull(login.id);
      //   var token = login.id;

      var url = bootstrap.basePath + '/' + modelName + 's/' + testVars.instanceId + '?access_token=' + bootstrap.token;

      request({ url: url, method: 'GET' }, onGet);

      function onGet(err, response) {
        if (err) {
          return done(err);
        }
        var instance = JSON.parse(response.body);
        assert.strictEqual(response.statusCode, 200);
        log.debug(instance);
        done();
      }
    });
  });

  it('remove model instances [clean-up]', function CB(done) {
    models[modelName].destroyAll({}, User1Context, function cb(err, res) {
      if (err) {
        log.error(err);
        return done(err);
      }
      log.debug(res);
      done();
    });
  });

  it('remove model Definition ' + modelName + ' [clean-up]', function CB(done) {
    var id = testVars.modelDetails.id;
    var version = testVars.modelDetails._version;
    models.ModelDefinition.deleteWithVersion(id, version, User1Context, function CB(err) {
      if (err) {
        done(err);
      } else {
        done();
      }
    });
  });

  it('remove workflow mapping [clean-up]', function CB(done) {
    models.WorkflowMapping.destroyAll({}, User1Context, function cb(err, res) {
      if (err) {
        log.error(err);
        return done(err);
      }
      log.debug(res);
      done();
    });
  });
});