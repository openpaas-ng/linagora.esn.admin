'use strict';

var conf_path = './test/config/';
var servers = require(conf_path + 'servers-conf');
var GruntfileUtils = require('./tasks/utils/Gruntfile-utils');

module.exports = function(grunt) {
  var gruntfileUtils = new GruntfileUtils(grunt, servers);
  var runGrunt = gruntfileUtils.runGrunt();
  var shell = gruntfileUtils.shell();
  var command = gruntfileUtils.command();

  grunt.initConfig({
    eslint: {
      all: {
        src: ['Gruntfile.js', 'Gruntfile-tests.js', 'tasks/**/*.js', 'test/**/**/*.js', 'backend/**/*.js', 'frontend/js/**/*.js']
      },
      quick: {
        src: [],
        options: {
          quiet: true
        }
      },
      options: {
        quiet: true
      }

    },
    jscs: {
      options: {
        config: '.jscsrc'
      },
      all: {
        src: ['<%= eslint.all.src %>']
      },
      quick: {
        src: ['<%= eslint.quick.src %>']
      }
    },
    lint_pattern: {
      options: {
        rules: [
          { pattern: /(describe|it)\.only/, message: 'Must not use .only in tests' }
        ]
      },
      all: {
        src: ['<%= eslint.all.src %>']
      },
      css: {
        options: {
          rules: [
            { pattern: /important;(\s*$|(?=\s+[^\/]))/, message: 'CSS important rules only allowed with explanatory comment' }
          ]
        },
        src: [
          'frontend/css/**/*.less'
        ]
      },
      quick: {
        src: ['<%= eslint.quick.src %>']
      }
    },

    shell: {
      mongo: shell.newShell(command.mongo(false), new RegExp('connections on port ' + servers.mongodb.port), 'MongoDB server is started.'),
      redis: shell.newShell(command.redis, /on port/, 'Redis server is started'),
      elasticsearch: shell.newShell(command.elasticsearch, /started/, 'Elasticsearch server is started.')
    },
    run_grunt: {
      midway_backend: runGrunt.newProcess(['test-midway-backend']),
      unit_backend: runGrunt.newProcess(['test-unit-backend']),
      unit_frontend: runGrunt.newProcess(['test-frontend'])
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-lint-pattern');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-continue');
  grunt.loadNpmTasks('grunt-run-grunt');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-wait-server');

  grunt.loadTasks('tasks');

  grunt.registerTask('linters', 'Check code for lint', ['eslint:all', 'jscs:all', 'lint_pattern:all']);
  grunt.registerTask('linters-dev', 'Check changed files for lint', ['prepare-quick-lint', 'eslint:quick', 'jscs:quick', 'lint_pattern:quick']);
  grunt.registerTask('spawn-servers', 'spawn servers', ['shell:mongo', 'shell:redis', 'shell:elasticsearch']);
  grunt.registerTask('kill-servers', 'kill servers', ['shell:mongo:kill', 'shell:redis:kill', 'shell:elasticsearch:kill']);
  grunt.registerTask('setup-environment', 'create temp folders and files for tests', gruntfileUtils.setupEnvironment());
  grunt.registerTask('clean-environment', 'remove temp folder for tests', gruntfileUtils.cleanEnvironment());
  grunt.registerTask('setup-servers', ['spawn-servers', 'continue:on']);
  grunt.registerTask('test-midway-backend', ['setup-environment', 'setup-servers', 'run_grunt:midway_backend', 'kill-servers', 'clean-environment']);
  grunt.registerTask('test-unit-backend', 'Test backend code', ['run_grunt:unit_backend']);
  grunt.registerTask('test-unit-frontend', 'Test frontend code', ['run_grunt:unit_frontend']);
  grunt.registerTask('test', ['linters', 'test-unit-frontend', 'test-unit-backend', 'test-midway-backend']);
  grunt.registerTask('default', ['test']);
};