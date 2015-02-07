
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
					'./css/style.css': './css/style.less',
					'./css/markdown.css': './css/markdown.less'
				}
			}
		},

		// configure autoprefixing for compiled output css
		autoprefixer: {
			build: {
				// expand: true,
				// cwd: BUILD_DIR,
				src: ['./css/style.css', './css/markdown.css'],
				// dest: BUILD_DIR
			}
		},

		jade: {
			compile: {
				options: {
					data: {
						pretty: true,
						debug: true,
						// apiBaseUrl: 'http://estimator.topmost.se:8084'
						apiBaseUrl: 'http://localhost:3000'
					}
				},
				files: {
					'index.html': 'index.jade',
					'manual.html': 'manual.jade',
					'changelog.html': 'changelog.jade'
				}
			}
		},

		// running `grunt watch` will watch for changes
		watch: {

			stylesless: {
				options: { livereload: true },
				files: ['./css/*.less'],
				tasks: ['less:development', 'autoprefixer']
			},

			jade: {
				options: { livereload: true },
				files: ['*.jade'],
				tasks: ['jade']
			}
		},
		
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-watch');
};

