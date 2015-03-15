//The build will inline common dependencies into this file.

//For any third party dependencies, like jQuery, place them in the lib folder.

//Configure loading modules from the lib directory,
//except for 'app' ones, which are in a sibling
//directory.
requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',	// Go up 1 level, because lib is the base
        /*
        All files named something.js will be made available
        either on js/lib or ../app.
        If you have minified files,
        you should either rename them, or load them using:
        
        jquery: 'jquery.min',
        Masonry: 'masonry.pkgd.min'
        */
    }
});
