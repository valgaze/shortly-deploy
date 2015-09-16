module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
       options: {
            separator: ';'
        },

      dist1: {
        src: [
            'public/lib/jquery.js', 'public/lib/underscore.js', 'public/lib/handlebars.js', 'public/lib/backbone.js', // All JS in the libs folder
        ],
        dest: 'public/dist/libraries.min.js',
      },
      dist2: {
        src: [
            'public/client/*.js'
        ],
        dest: 'public/dist/webapp.min.js',
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
        options: {
            // the banner is inserted at the top of the output
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
            beautify:{
              quote_keys:true
            }
          },
          dist: {
            files: {
              'public/dist/libraries.min.js': ['<%= concat.dist1.dest %>'],
              'public/dist/webapp.min.js': ['<%= concat.dist2.dest %>'],
            }
          }



          
    },

    jshint: {
      files: [ 'public/client/*.js'
        // Add filespec list here
      ],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ],
        globals: {
          jQuery: true,
          console: true,
          module: true
        }

      }
    },

    cssmin: {
        // Add filespec list here
        target:{
          files: {'public/dist/style.min.css': ['public/style.css']}
        }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', ['jshint', 'concat:dist1', 'concat:dist2', 'uglify', 'cssmin', 'mochaTest'

  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      console.log("dont fire anything we are in production")
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', ['build', 'upload' 
      // add your production server task here'
  ]);


};
