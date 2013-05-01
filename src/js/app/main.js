/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 * Date: 4/19/13
 * Time: 5:10 PM
 * To change this template use File | Settings | File Templates.
 */
require([
'libs/domReady!',
'stats',
'jac/events/GlobalEventBus',
'app/ViewManager',
'app/WebCamManager',
'jac/polyfills/RequestAnimationFrame',
'app/VideoGrid',
'jac/utils/BrowserUtils'],
function(doc, Stats, GlobalEventBus, ViewManager, WebCamManager, RequestAnimationFrame, VideoGrid, BrowserUtils){

	var config = {};
	config.cols = 20;
	config.delay = 2;
	config.fps = 0;

	var params = BrowserUtils.getURLParams(window);

	for(var prop in params){
		if(params.hasOwnProperty(prop)){
			config[prop] = params[prop];
		}
	}

	var geb = new GlobalEventBus();
	var vm = new ViewManager(doc, window, navigator, config);
	var wcm = new WebCamManager(vm.vmd);
	var videoGrid = new VideoGrid(vm.vmd, parseInt(config.cols), parseInt(config.delay));
	wcm.init();
	vm.start();
});