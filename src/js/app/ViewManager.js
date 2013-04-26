/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define([
'jac/events/EventDispatcher',
'jac/utils/ObjUtils',
'jac/events/GlobalEventBus',
'app/events/WCMEvent',
'jac/utils/EventUtils',
'app/events/VMEvent',
'app/VMData'],
function(EventDispatcher,ObjUtils, GEB, WCMEvent, EventUtils, VMEvent, VMData){
    return (function(){
        /**
         * Creates a ViewManager object
         * @param {Document} $document
         * @param {Window} $window
         * @param {navigator} $navigator
         * @extends {EventDispatcher}
         * @constructor
         */
        function ViewManager($document, $window, $navigator){
            //super
            EventDispatcher.call(this);

	        var self = this;
			this.vmd = new VMData();

	        this.vmd.document = $document;
	        this.vmd.window = $window;
	        this.vmd.navigator = $navigator;
	        this.vmd.videoEl = $document.getElementById('camvideo');
	        this.vmd.finalCanvas = $document.getElementById('finalCanvas');
	        this.vmd.finalCanvasContext = null;
	        this.vmd.startButtonEl = $document.getElementById('startButtonEl');
	        this.vmd.stopButtonEl = $document.getElementById('stopButtonEl');
	        this.vmd.startButtonEl.disabled = false;
	        this.vmd.stopButtonEl.disabled = true;
	        this.vmd.stats = null;

	        //check for canvas support
			if(!!window.CanvasRenderingContext2D){
				//Set up stats
				this.vmd.stats = new Stats();
				this.vmd.stats.setMode(0);
				this.vmd.document.getElementById('statsDiv').appendChild(this.vmd.stats.domElement);

				this.vmd.finalCanvasContext = this.vmd.finalCanvas.getContext('2d');

				//Button Events
				EventUtils.addDomListener(this.vmd.startButtonEl, 'click', EventUtils.bind(self, self.handleStartClick));
				EventUtils.addDomListener(this.vmd.stopButtonEl, 'click', EventUtils.bind(self, self.handleStopClick));

				//GEB Events
				this.geb = new GEB();
				this.geb.addHandler(WCMEvent.CONNECTED, EventDispatcher.bind(self, self.handleConnected));
				this.geb.addHandler(WCMEvent.CONNECT_FAIL, EventDispatcher.bind(self, self.handleConnectFail));
				this.geb.addHandler(WCMEvent.STREAM_ENDED, EventDispatcher.bind(self, self.handleStreamEnded));
				this.geb.addHandler(WCMEvent.NO_WEB_CAM, EventDispatcher.bind(self, self.handleNoWebCam));
			} else {
				this.showError('Canvas not supported by browser');
			}
        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(ViewManager,EventDispatcher);

	    ViewManager.prototype.start = function(){
	        this.update();
	    };

	    ViewManager.prototype.update = function(){
		    var self = this;
		    this.vmd.window.requestAnimationFrame(EventUtils.bind(self, self.update));

			this.geb.dispatchEvent(new VMEvent(VMEvent.FRAME_UPDATE));

		    this.vmd.stats.update();
	    };

	    ViewManager.prototype.showError = function($errorMsg){
		    var el = this.vmd.document.getElementById('errorPEl');
		    el.innerHTML = $errorMsg;
	    };

	    ViewManager.prototype.handleNoWebCam = function($e){
		    this.showError('No Web Cam Found');
		    this.vmd.startButtonEl.disabled = false;
	    };

	    /**
	     * handleStartClick
	     * @param {JacEvent} $e
	     * @private
	     */
	    ViewManager.prototype.handleStartClick = function($e){
			this.geb.dispatchEvent(new VMEvent(VMEvent.REQUEST_CAM_START));
	    };

	    /**
	     * handleStopClick
	     * @param {JacEvent} $e
	     * @private
	     */
	    ViewManager.prototype.handleStopClick = function($e){
		    this.geb.dispatchEvent(new VMEvent(VMEvent.REQUEST_CAM_STOP));
	    };

	    /**
	     * handleConnected
	     * @param {JacEvent} $e
	     * @private
	     */
	    ViewManager.prototype.handleConnected = function($e){
			this.vmd.stopButtonEl.disabled = false;
		    this.vmd.startButtonEl.disabled = true;
		    this.showError('OK');
	    };

	    /**
	     * handleConnectFailed
	     * @param {JacEvent} $e
	     * @private
	     */
	    ViewManager.prototype.handleConnectFail = function($e){
			this.vmd.stopButtonEl.disabled = true;
			this.vmd.startButtonEl.disabled = false;

		    this.showError('Please Allow Access To WebCam, press start');
	    };

	    /**
	     * handleStreamEnded
	     * @param {JacEvent} $e
	     * @private
	     */
	    ViewManager.prototype.handleStreamEnded = function($e){
		    this.vmd.stopButtonEl.disabled = true;
		    this.vmd.startButtonEl.disabled = false;
		    this.showError('Camera Disconnected');
	    };

        //Return constructor
        return ViewManager;
    })();
});
