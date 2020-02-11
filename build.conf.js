module.exports = {
    module: {
        name: 'pipComposite',
        styles: 'index',
        export: 'pip.composite',
        standalone: 'pip.standalone'        
    },
    build: {
        js: false,
        ts: false,
        tsd: true,
        bundle: true,
        html: true,
        sass: true,
        lib: true,
        images: true,
        dist: false
    },
    browserify: {
        entries: [
            './src/index.ts',
            './temp/pip-suite-composite-html.min.js',
        ]
    }, 
    file: {
        lib: [
            '../node_modules/pip-webui-all/dist/**/*',
            '../pip-suite-rest/dist/**/*',
            '../pip-suite-entry/dist/**/*',
            '../pip-suite-pictures/dist/**/*',
            '../pip-suite-documents/dist/**/*'
        ]
    },
    samples: {
        port: 8120,
        https: false
    },
    api: {
        port: 8121
    }
};
