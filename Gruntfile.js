module.exports = function(grunt) {

    'use strict';

    //loads all grunt tasks from package.json
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        //get meta data
        pkg: grunt.file.readJSON('package.json'),

        //set paths and files
        scssPath:                   'scss/',
        scssFile:                   '<%= scssPath %>styles.scss',
        scssIncludePath:            '<%= scssPath %>scss/',
        scssIncludeFiles:           '<%= scssIncludePath %>**/*.scss',

        jsPath:                     'js/',
        jsFiles:                    '<%= jsPath %>*.js',
        qunitFiles:                 '<%= testPath %>qunit/unit/*.js',

        docPath:                    'doc/',

        distPath:                   'dist/',
        distCSSFile:                '<%= distPath %>styles.css',
        distCSSFileMin:             '<%= distPath %>styles.min.css',
        distJSFile:                 '<%= distPath %>scripts.js',
        distJSFileMin:              '<%= distPath %>scripts.min.js',


        // ---------------- //
        // CSS CODE QUALITY //
        // ---------------- //

        //perhaps add https://npmjs.org/package/grunt-csscomb

        //lint CSS
        //https://github.com/stubbornella/csslint/wiki/Rules
        //https://npmjs.org/package/grunt-contrib-csslint
        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },
            all: {
                src: [
                    '<%= distCSSFile %>'
                ]
            }
        },


        // ----------------- //
        // CSS DOCUMENTATION //
        // ----------------- //

        //css auto-documentation
        //http://jacobrask.github.io/styledocco/
        //https://github.com/jacobrask/styledocco
        //https://www.npmjs.org/package/grunt-styledocco
        styledocco: {
          dist: {
            options: {
              name: 'My Project'
            },
            files: {
              '<%= docPath %>': '<%= scssPath %>'
            }
          }
        },


        // -------------- //
        // CSS MANAGEMENT //
        // -------------- //

        //scss precompilation with Node
        //https://github.com/sindresorhus/grunt-sass
        //https://github.com/andrew/node-sass
        sass: {
            single: {
                files: {
                    '<%= distCSSFile %>': '<%= scssFile %>'
                }
            }
        },
        //minify css
        //https://github.com/gruntjs/grunt-contrib-cssmin
        cssmin: {
            options: {
                banner: '/* styles.css version <%= pkg.version %>: CMS. Copyright Dan DeRose */'
            },
            style: {
                files: {
                    '<%= distCSSFileMin %>': [ '<%= distCSSFile %>' ]
                }
            }
        },


        // --------------------------- //
        // JAVASCRIPT ASSET MANAGEMENT //
        // --------------------------- //

        //optimize and concat JS assets
        // https://www.npmjs.org/package/grunt-contrib-uglify
        uglify: {
            options: {
                banner: '/* scripts.js version <%= pkg.version %>: CMS. Copyright Dan DeRose */',
                sourceMap: false
            },
            unmin: {
                options: {
                    beautify: true,
                    compress: false,
                    mangle: false
                },
                files: {
                    '<%= distJSFile %>': [ '<%= jsFiles %>' ]
                }
            },
            min: {
                files: {
                    '<%= distJSFileMin %>': [ '<%= jsFiles %>' ]
                }
            }
        },


        // --------------- //
        // JS CODE QUALITY //
        // --------------- //

        // lint all js files
        // https://www.npmjs.org/package/grunt-contrib-jshint
        jshint: {
           all: [ 'Gruntfile.js', '<%= jsFiles %>', '<%= qunitFiles %>' ]
        },


        // ---------- //
        // JS TESTING //
        // ---------- //
        //qunit tests
        qunit: {
            files: [ 'test/qunit/index.html' ]
        },

        // blanket qunit: the build enforcer
        // https://www.npmjs.org/package/grunt-blanket-qunit
        // https://github.com/ModelN/grunt-blanket-qunit
        blanket_qunit: {
            all: {
                options: {
                    urls: ['test/qunit/index.html?coverage=true&gruntReport'],
                    threshold: 90,
                    globalThreshold: 90
                }
            }
        },


        // --------------------- //
        // DEVELOPER CONVENIENCE //
        // --------------------- //

        //watch files and do stuff
        watch: {
            scss: {
                files: [ '<%= scssFile %>', '<%= scssIncludeFiles %>' ],
                tasks: [ 'sass:single' ]
            },
            css: {
                files: '<%= distCSSFile %>',
                tasks: [ 'newer:csslint', 'cssmin' ]
            },
            styledocco: {
                files: [ '<%= scssPath %>' ],
                tasks: [ 'styledocco:dist' ]
            },
            js: {
                files: [ '<%= jsFiles %>', '<%= qunitFiles %>', 'Gruntfile.js' ],
                tasks: [ 'newer:jshint', 'newer:uglify'/*, 'testqunit'*/ ]
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    '<%= distCSSFileMin %>',
                    '<%= distJSFileMin %>'
                    // '<%= fixtureTemplate %>'
                ]
            }
        },
        //serve up docs and fixtures
        //https://github.com/gruntjs/grunt-contrib-connect
        connect: {
            docs: {
                options: {
                    //visit http://localhost:9000 when running
                    port: 9000,
                    keepalive: true,
                    base: './',
                    hostname: '*',
                    open: {
                        target: 'http://localhost:9000/doc/index.html'
                    }
                }
            },
            fixtures: {
                options: {
                    //visit http://localhost:9001 when running
                    port: 9001,
                    //keepalive: true,
                    base: './',
                    hostname: '*'
                }
            },
            tests: {
                options: {
                    //visit http://localhost:9002 when running
                    port: 9002,
                    keepalive: true,
                    base: './',
                    hostname: '*',
                    open: {
                        target: 'http://localhost:9002/test/qunit/index.html?coverage=true'
                    }
                }
            }
        },
        //run multiple processes at one time
        concurrent: {
            styledocco: {
                tasks:[ 'styledocco:dist' ],
                options: {
                    logConcurrentOutput: false
                }
            }
        },
        //clean up compiled css and minified-versioned css
        clean: {
            dist: [ '<%= distPath %>' ],
            docs: ['index.html']
        },

        copy: {
            //copy distributable files into namespaced-versioned directory
            dist: {
                expand: true,
                cwd: '<%= distPath %>',
                src: '**',
                dest: '<%= distPath %><%= pkg.name %>-<%= pkg.version %>/',
                flatten: true,
                filter: 'isFile'
            },
            // creates a distributable styleguide package with latest and archive version of the styleguide
            docs: {
                files: [
                    {expand: true, src: ['<%= distPath %>/*'], dest: 'history/<%= pkg.version %>'},

                    {expand: true, src: ['<%= docPath %>*.html','<%= docPath %>public/**', '<%= docPath %>images/**'], dest: 'history/<%= pkg.version %>'},

                    {expand: true, cwd:'<%= docPath %>' , src: ['index.html'], dest: 'history/<%= pkg.version %>'},
                    {expand: true, cwd:'<%= docPath %>' , src: ['index.html'], dest: '.'}
                ]
            }
        },

        replace: {
            docIndex: {
                src: ['index.html', 'history/<%= pkg.version %>/index.html' ],
                overwrite: true,
                replacements: [{
                    from: /="public\//g, // 1
                    to: '="doc/public/'
                },{
                    from: /="\.\.\/dist\//g, // 2
                    to: '="dist/'
                },{
                    from: /href="section/g, // 3
                    to: 'href="doc/section'
                }]
            },
            deployProps: {
                src: [ 'deployment.properties' ],
                overwrite: true,
                replacements: [{
                    from: /(ARTIFACT_ID=)(.*)/, // 1
                    to: '$1<%= pkg.name %>'
                }, {
                    from: /(VERSION=)(.*)/, // 2
                    to: '$1<%= pkg.version %>'
                }]
            }
        },

        release: {
            options: {
                bump: true,
                file: 'package.json',
                add: false,
                commit: false,
                tag: false,
                push: false,
                pushTags: false,
                npm: false,
                npmTag: false,
                tagName: '<%= version %>',
                commitMessage: 'Bumping version to <%= version %>',
                tagMessage: 'Tagging version <%= version %>'
            }
        }
    });

    //default task
    grunt.registerTask('default',       [ ] );

    //development-based tasks
    grunt.registerTask('devscss',       [ 'sass:single', 'watch:scss' ] );
    grunt.registerTask('dev',           [ 'sass:single', 'newer:csslint', 'newer:jshint', 'newer:uglify', 'watch' ] );

    //build/deploy tasks
    grunt.registerTask('build',         [ 'clean:dist', 'clean:docs', 'sass:single', 'csslint', 'cssmin', 'createdocs', 'jshint', 'uglify', 'testqunit' ] );

    // deploy tasks
    grunt.registerTask('deployDev',     [ 'build', 'copy:docs', 'copy:dist', 'replace:deployProps' ] );
    grunt.registerTask('deployRelease', [ 'build', 'copy:docs', 'copy:dist', 'replace:docIndex', 'replace:deployProps', 'release' ] );

    //testing JS tasks
    grunt.registerTask('testqunit',      ['connect:fixtures', 'qunit'] );
    grunt.registerTask('viewtests',      [ 'connect:tests' ] );

    //documentation tasks
    grunt.registerTask('createdocs',    [ 'concurrent:styledocco' ] );
    grunt.registerTask('viewdocs',      [ 'createdocs', 'connect:docs' ] );

};
