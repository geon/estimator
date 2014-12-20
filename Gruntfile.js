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

		jade: {
			compile: {
				options: {
					data: {
						pretty: true,
						debug: true
					}
				},
 				files: {
 					'index.html': 'index.jade'
 				}
 			}
		},

		// running `grunt watch` will watch for changes
		watch: {
			stylesless: {
				options: { livereload: false },
				files: ['./css/style.less'],
				tasks: ['less:development']
			},

			jade: {
				options: { livereload: false },
				files: ['index.jade'],
				tasks: ['jade']
			}
		},
		
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-watch');
};

