//The build will inline common dependencies into this file.

//For any third party dependencies, like jQuery, place them in the lib folder.

//Configure loading modules from the lib directory,
//except for 'app' ones, which are in a sibling
//directory.
requirejs.config({
    baseUrl: '/assets/js/lib',
    paths: {
        app: '/assets/js/app',
        /*
        Files inside lib will be made available by
        require('filename') — without the js extension.

        Files inside app will be made availble through:
        require('app/filename')  — without the js extension.

        If you have minified files,
        you should either rename them, or add them here using:
        
        jquery: 'jquery.min',
        Masonry: 'masonry.pkgd.min'
        */
    }
});
