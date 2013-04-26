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
'app/WebCamManager'],
function(doc, Stats, GlobalEventBus, ViewManager, WebCamManager){

	var geb = new GlobalEventBus();
	var vm = new ViewManager(doc, window);
	var wcm = new WebCamManager(doc, navigator ,window, vm.videoEl);
	wcm.init();
	vm.start();


});