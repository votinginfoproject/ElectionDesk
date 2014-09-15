'use strict';
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-autoprefixer');

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
                  " * |______|_|\\___|\\___|\\__|_|\\___/|_| |_|_____/ \\___||___/_|\\_\\n" + 
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
    watch: {
      sass: {
        files: [
          '<%= pkg.env.src_folder %>/sass/*.scss'
        ],
        tasks: ['sass', 'autoprefixer']
      }
    }
  });
};
