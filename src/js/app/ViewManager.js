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
'app/events/VMEvent'],
function(EventDispatcher,ObjUtils, GEB, WCMEvent, EventUtils, VMEvent){
    return (function(){
        /**
         * Creates a ViewManager object
         * @param {Document} $document
         * @param {Window} $window
         * @extends {EventDispatcher}
         * @constructor
         */
        function ViewManager($document, $window){
            //super
            EventDispatcher.call(this);

	        var self = this;

	        this.document = $document;
	        this.window = $window;
	        this.videoEl = $document.getElementById('camvideo');
			this.finalCanvas = $document.getElementById('finalCanvas');
	        this.startButtonEl = $document.getElementById('startButtonEl');
	        this.stopButtonEl = $document.getElementById('stopButtonEl');
			this.startButtonEl.disabled = false;
	        this.stopButtonEl.disabled = true;
			this.stats = null;

	        //check for canvas support
			if(!!window.CanvasRenderingContext2D){
				//Set up stats
				this.stats = new Stats();
				this.stats.setMode(0);
				this.document.getElementById('statsDiv').appendChild(this.stats.domElement);

				//Button Events
				EventUtils.addDomListener(this.startButtonEl, 'click', EventUtils.bind(self, self.handleStartClick));
				EventUtils.addDomListener(this.stopButtonEl, 'click', EventUtils.bind(self, self.handleStopClick));

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
		    var self = this;
		    self.update();
	    };

	    ViewManager.prototype.update = function(){
		    var self = this;
		    this.window.requestAnimationFrame(EventUtils.bind(self, self.update));
		    this.stats.update();
	    };

	    ViewManager.prototype.showError = function($errorMsg){
		    var el = this.document.getElementById('errorPEl');
		    el.innerHTML = $errorMsg;
	    };

	    ViewManager.prototype.handleNoWebCam = function($e){
		    this.showError('No Web Cam Found');
		    this.startButtonEl.disabled = false;
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
			this.stopButtonEl.disabled = false;
		    this.startButtonEl.disabled = true;
		    this.showError('OK');
	    };

	    /**
	     * handleConnectFailed
	     * @param {JacEvent} $e
	     * @private
	     */
	    ViewManager.prototype.handleConnectFail = function($e){
			this.stopButtonEl.disabled = true;
			this.startButtonEl.disabled = false;

		    this.showError('Please Allow Access To WebCam, press start');
	    };

	    /**
	     * handleStreamEnded
	     * @param {JacEvent} $e
	     * @private
	     */
	    ViewManager.prototype.handleStreamEnded = function($e){
		    this.stopButtonEl.disabled = true;
		    this.startButtonEl.disabled = false;
		    this.showError('Camera Disconnected');
	    };

        //Return constructor
        return ViewManager;
    })();
});
