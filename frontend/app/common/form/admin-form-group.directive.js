'use strict';

angular.module('linagora.esn.admin')

.directive('adminFormGroup', function($compile) {
  function link(scope, element, attrs) {
    var AVAILABLE_ERRORS = ['min', 'max', 'minlength', 'maxlength', 'pattern', 'email', 'required', 'url', 'date', 'datetimelocal', 'time', 'week', 'month'];
    var fgLineEle = element.find('.fg-line');
    var formControlEle = element.find('.form-control');

    if (formControlEle.attr('required')) {
      element.addClass('has-required');
    }

    scope.label = attrs.label;

    //  use default css of .fg-line
    // .fg-line:not([class*=has-]):after {
    //    background: #2196F3;
    //  }
    fgLineEle.addClass('has-underline');

    formControlEle.bind('focus', function() {
      fgLineEle.removeClass('has-underline');
      element.addClass('has-focus');
    });

    formControlEle.bind('blur', function() {
      fgLineEle.addClass('has-underline');
      element.removeClass('has-focus');

      if (formControlEle.hasClass('ng-invalid')) {
        element.addClass('has-invalid');
      } else {
        element.removeClass('has-invalid');
      }
    });

    scope.options = {};
    scope.elementForm = scope.form[formControlEle.attr('name')];

    var formControlAttrs = formControlEle[0].attributes;

    angular.forEach(AVAILABLE_ERRORS, function(error) {
      var custom_error = error + 'ErrorMessage';

      scope.options[error] = {
        value: formControlAttrs[error],
        message: {
          error: attrs[custom_error]
        }
      };
    });

    var template = '<div class="admin-form-validate-message-container"><admin-form-validate-message ng-class="elementForm.$pristine && !elementForm.$touched ? \'pristine\' : \'dirty\'" ng-if="elementForm.$error" options="options" error="elementForm.$error" /><div>';
    var validateMessage = $compile(template)(scope);

    element.find('.form-group').append(validateMessage);
  }

  return {
    restrict: 'E',
    templateUrl: '/admin/app/common/form/admin-form-group',
    transclude: true,
    scope: true,
    link: link
  };
});