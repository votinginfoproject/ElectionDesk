'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        options: {
          banner: "/*   ______ _           _   _             _____            _\n" + 
                  " * |  ____| |         | | (_)           |  __ \          | |\n" + 
                  " * | |__  | | ___  ___| |_ _  ___  _ __ | |  | | ___  ___| | __\n" + 
                  " * |  __| | |/ _ \/ __| __| |/ _ \| '_ \\| |  | |/ _ \\/ __| |/ /\n" + 
                  " * | |____| |  __/ (__| |_| | (_) | | | | |__| |  __/\\__ \\   <\n" + 
                  " * |______|_|\\___|\\___|\\__|_|\\___/|_| |_|_____/ \\___||___/_|\\_\n" + 
                  " */\n",
          style: 'compressed'
        },
        files: {
          '<%= pkg.env.src_folder %>/css/style.css': '<%= pkg.env.src_folder %>/sass/style.scss'
        }
      }
    },
    autoprefixer: {
        options: {
          browsers: ['last 2 Chrome versions', 'Firefox >= 28', 'ie 8', 'ie 9']
        },
        dist: {
            files: {
                '<%= pkg.env.css_folder %>/style.css': '<%= pkg.env.src_folder %>/css/style.css'
            }
        }
    },
    jshint: {
      options: {
        jshintrc: true
      },
      all: [
        '<%= pkg.env.src_folder %>/js/*.js'
      ]
    },
    uglify: {
      dist: {
        files: {
          '<%= pkg.env.js_folder %>/script.js': [
            '<%= pkg.env.src_folder %>/js/vendor/*.js',
            '<%= pkg.env.src_folder %>/js/initialize/*.js',
            '<%= pkg.env.src_folder %>/js/*.js'
          ]
        }
      },
      options: {
        beautify: false,
        mangle: false
      }
    },
    watch: {
      sass: {
        files: [
          '<%= pkg.env.src_folder %>/sass/*.scss'
        ],
        tasks: ['sass', 'autoprefixer', 'notify:css']
      },
      js: {
        files: [
          '<%= pkg.env.src_folder %>/js/*.js'
        ],
        tasks: ['jshint', 'uglify', 'notify:js']
      }
    },
    clean: {
      dist: [
        '<%= pkg.env.js_folder %>/script.js',
        '<%= pkg.env.css_folder %>/style.css'
      ]
    },
    notify: {
      css: {
        options: {
          title: 'CSS Preprocessing Complete',
          message: 'LESS compiler finished running'
        }
      },
      js: {
        options: {
          title: 'JS Preprocessing Complete',
          message: 'jshint and uglify finished running'
        }
      }
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-notify');

  // Register tasks
  grunt.registerTask('default', [
    'clean',
    'less',
    'uglify'
  ]);
  grunt.registerTask('dev', [
    'watch'
  ]);
};
