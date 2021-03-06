'use strict';

angular.module('linagora.esn.admin')

.controller('adminModulesController', function(
  _,
  $stateParams,
  adminModulesService,
  adminDomainConfigService,
  asyncAction,
  ADMIN_DEFAULT_NOTIFICATION_MESSAGES,
  ADMIN_LOADING_STATUS
) {
  var self = this;
  var domainId = $stateParams.domainId;
  var HOMEPAGE_VALUE = 'unifiedinbox';
  var HOMEPAGE_KEY = 'homePage';
  var MODULES_KEY = 'modules';

  self.$onInit = $onInit;
  self.saveModuleEnabledState = saveModuleEnabledState;

  function $onInit() {
    self.status = ADMIN_LOADING_STATUS.loading;

    adminDomainConfigService.get(domainId, HOMEPAGE_KEY).then(function(data) {
      self.homePage = data || HOMEPAGE_VALUE;
    });

    adminModulesService.get(domainId)
      .then(setModuleEnabledState)
      .then(function(modules) {
        self.modules = modules;
        self.status = ADMIN_LOADING_STATUS.loaded;
      })
      .catch(function() {
        self.status = ADMIN_LOADING_STATUS.error;
      });

    function setModuleEnabledState(modules) {
      return adminDomainConfigService.get(domainId, MODULES_KEY).then(function(modulesConfig) {
        _.forEach(modules, function(module) {
          var predicate = { id: module.id };
          var moduleConfig = _.find(modulesConfig, predicate) || {};

          module.enabled = _.has(moduleConfig, 'enabled') ? moduleConfig.enabled : true;
        });

        return modules;
      });
    }
  }

  function saveModuleEnabledState(module, value) {
    return adminDomainConfigService.get(domainId, MODULES_KEY)
      .then(function(modulesConfig) {
        modulesConfig = modulesConfig || [];

        var predicate = { id: module.id };
        var moduleConfig = _.find(modulesConfig, predicate) || predicate;

        if (!_.find(modulesConfig, predicate)) {
          modulesConfig.push(moduleConfig);
        }

        moduleConfig.enabled = value;

        return adminDomainConfigService.set(domainId, MODULES_KEY, modulesConfig);
      });
  }
});
