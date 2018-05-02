/**
 *
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */
/**
 * Boot Script for attaching workflow on boot
 * @author Mandeep Gill(mandeep6ill), Prem Sai(premsai-ch)
 */
var logger = require('oe-logger');
var log = logger('workflow-recovery.boot');
var recoveryConfig = require('../wf-recovery-config.json');

module.exports = function attachWorkFlows(app) {
  var ProcessInstance = app.models.ProcessInstance;
  var workflowMonitor = app.models.WorkflowMonitor;
  var BATCH_SIZE = 500;
  var BATCH_TIME = 100000;
  var updateInterval = recoveryConfig.updateInterval;

  var options = {
    ctx: {},
    ignoreAutoScope: true,
    fetchAllScopes: true
  };
  // Trying to create an entry in the workflow monitor model
  // This will ensure that this node will run the boot script and does the
  // recovery process of all the process instances.
  // If error in creating the entry because it is already existing , we will
  // just return and will not continue to the boot recovery process.
  workflowMonitor.create({'id': 'node'}, options, function acquireLock(err, inst) {
    if (err) {
      log.error(options, err);
      return;
      // Check the error
    }
    ProcessInstance.find({
      where: {
        'and': [{
          '_status': 'running'
        }, {
          'passive-wait': false
        }]
      },
      fields: {
        'id': true
      }
    }, options, function fetchPendingPI(err, processes) {
      if (err) {
        log.error(options, err);
        return;
      }

      var buildFilter = function buildFilter(start, end) {
        let filter = {
          where: {
            or: []
          }
        };
        for (let idx = start; idx < end; idx++) {
          filter.where.or.push({
            id: processes[idx].id
          });
        }
        return filter;
      };

      var NUM_PROCESSES = processes.length;
      var iter = 0;
      var interval = setInterval(function cb() {
        let start = iter * BATCH_SIZE;
        let end = (iter + 1) * BATCH_SIZE;
        if (end >= NUM_PROCESSES) {
          clearInterval(interval);
          end = NUM_PROCESSES;
        }

        let filter = buildFilter(start, end);
        ProcessInstance.find(filter, options, function fetchPendingPI(err, processes) {
          if (err) {
            log.error(options, err);
            return;
          }
          for (var i = 0; i < processes.length; i++) {
            var process = processes[i];
            var processVersion = process._version;
            setTimeout((function setTimeoutCb(process, ProcessInstance, options, processVersion) {
              return function wrappedFn() {
                ProcessInstance.find({'where': {'id': process.id}}, options, function fetchPI(err, pInstance) {
                  if (err) {
                    log.error(options, err);
                    return;
                  }
                  if (processVersion === pInstance[0]._version) {
                    return pInstance[0].recover();
                  } else if (processVersion !== pInstance[0]._version) {
                    // Do nothing some other node is handling the process Instance.
                  }
                });
              };
            }(process, ProcessInstance, options, processVersion)), updateInterval);
          }
        });
        iter += 1;
      }, BATCH_TIME);
    });
    setTimeout((function setTimeoutCb(inst, workflowMonitor, options) {
      return function wrappedFn() {
        workflowMonitor.destroyById(inst.id, options, function destroyWMI(err, inst) {
          if (err) {
            log.error(err);
            return;
          }
        });
      };
    }(inst, workflowMonitor, options)), 2 * updateInterval);
  });
};
