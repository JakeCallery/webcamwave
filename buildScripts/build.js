({
    baseUrl: '../src/js',
    mainConfigFile: '../src/js/app/main.js',
    name: 'app/main',
    out: '../src/js/compiled/compiled.js',
    preserveLicenseComments: false,
    generateSourceMaps: false,
    optimize: 'uglify2',
    paths: {
        requireLib: 'libs/require',
	    modernizr: 'libs/stats',
	    stats: 'libs/Stats'
    },
	shim: {
		modernizr: {
			exports: 'Modernizr'
		},

		stats: {
			exports: 'Stats'
		}
	},
    include: 'requireLib'
})