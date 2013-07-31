module.exports = (grunt)->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    coffee:
      options:
        bare: on
      main:
        files: [
          {
            expand: on
            cwd: 'src'
            src: '**/*.coffee'
            dest: 'dest/'
            ext: '.js'
          }
        ]
    copy:
      main:
        files: [
          {
            expand: on
            cwd: 'src'
            src: [
              '**/*'
              '!**/*.coffee'
              '!**/*.js'
            ]
            dest: 'dest/'
          }
        ]
      common:
        files: [
          {
            expand: on
            cwd: 'dest/lib'
            src: 'common/**/*'
            dest: 'dest/data/'
          }
        ]
      js:
        files: [
          {
            expand: on
            cwd: 'src'
            src: [
              'lib/beautify.js'
            ]
            dest: 'dest/'
          }
        ]
    unicode:
      main:
        files:[
          expand: on
          src: 'dest/**/*.js'
        ]
    watch:
      coffee:
        files: "<%= coffee.main.files.0.src %>"
        tasks: [
          'generate'
        ]
    clean:
      js: 'dest/**/*.js'
      xpi: 'dest/<%= pkg.name %>.xpi'
      dest: 'dest/'
    shell:
      options:
        stdout: on
        stderr: on
        execOptions:
          cwd: 'dest'
      xpi:
        command: 'cfx xpi'
      run:
        command: 'cfx run -p ../.tmp/profile'
      init:
        options:
          execOptions:
            cwd: '.'
        command: [
          'ln -s ../package.json src/package.json'
          'ln -s ../README.md src/README.md'
        ].join '&&'

  require('matchdep').filterDev('grunt-*').forEach grunt.loadNpmTasks
  
  grunt.registerTask 'init', ['shell:init']

  grunt.registerTask 'generate', [
    'clean:js'
    'coffee'
    'copy:common'
    'copy:js'
    'unicode'
  ]

  grunt.registerTask 'default', [
    'clean:dest'
    'copy:main'
    'generate'
    'shell:run'
  ]