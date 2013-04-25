({
    baseUrl: '../src/js',
    mainConfigFile: '../src/js/app/main.js',
    name: 'app/main',
    out: '../src/js/compiled/compiled.js',
    preserveLicenseComments: false,
    generateSourceMaps: false,
    optimize: 'uglify2',
    paths: {
        requireLib: 'libs/require'
    },
    include: 'requireLib'
})