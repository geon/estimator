
// Inspired by http://anthonydel.com/my-personal-gruntfile-for-front-end-experiments/

module.exports = function(grunt) {

	grunt.initConfig({

		// running `grunt less` will compile once
		less: {
			development: {
				options: {
					paths: ['./css'],
					yuicompress: false
				},
				files: {
					'./css/style.css': './css/style.less'
				}
			}
		},

		// configure autoprefixing for compiled output css
		autoprefixer: {
			build: {
				// expand: true,
				// cwd: BUILD_DIR,
				src: ['./css/style.css'],
				// dest: BUILD_DIR
			}
		},

		jade: {
			compile: {
				options: {
					data: {
						pretty: true,
						debug: true,
						apiBaseUrl: 'http://estimator.topmost.se:8084'
					}
				},
				files: {
					'index.html': 'index.jade'
				}
			}
		}		
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-jade');
};

