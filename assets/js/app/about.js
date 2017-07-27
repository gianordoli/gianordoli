/* Your code starts here */

define(['./common'], function (common) {

	console.log('Loaded about.js');

	common.init(function(data){		
		common.appendSidebar(JSON.parse(data.projects));
		common.appendFooter();
	});
});