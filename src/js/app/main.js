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
'app/VideoGrid'],
function(doc, Stats, GlobalEventBus, ViewManager, WebCamManager, RequestAnimationFrame, VideoGrid){
	var geb = new GlobalEventBus();
	var vm = new ViewManager(doc, window, navigator);
	var wcm = new WebCamManager(vm.vmd);
	var videoGrid = new VideoGrid(vm.vmd, 11);
	wcm.init();
	vm.start();
});