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
'app/VMData',
'jac/utils/DOMUtils'],
function(EventDispatcher,ObjUtils, GEB, WCMEvent, EventUtils, VMEvent, VMData, DOMUtils){
    return (function(){
        /**
         * Creates a ViewManager object
         * @param {Document} $document
         * @param {Window} $window
         * @param {navigator} $navigator
         * @param {object} $config
         * @extends {EventDispatcher}
         * @constructor
         */
        function ViewManager($document, $window, $navigator, $config){
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
	        this.vmd.circleButtonEl = $document.getElementById('circleButtonEl');
	        this.vmd.horizButtonEl = $document.getElementById('horizButtonEl');
	        this.vmd.vertButtonEl = $document.getElementById('vertButtonEl');
	        this.vmd.randomButtonEl = $document.getElementById('randomButtonEl');
	        this.vmd.glowButtonEl = $document.getElementById('glowButtonEl');

	        this.vmd.stats = null;
			this.updateDelegate = EventUtils.bind(self, self.update);
	        this.frameUpdateEvent = new VMEvent(VMEvent.FRAME_UPDATE);

	        this.vmd.isGlowing = false;

	        //check for canvas support
			if(!!window.CanvasRenderingContext2D){
				//Set up stats
				this.vmd.stats = new Stats();
				this.vmd.stats.setMode(0);
				if($config.fps == 1){
					this.vmd.document.getElementById('statsDiv').appendChild(this.vmd.stats.domElement);
				}

				this.vmd.finalCanvasContext = this.vmd.finalCanvas.getContext('2d');

				//Button Events
				EventUtils.addDomListener(this.vmd.startButtonEl, 'click', EventUtils.bind(self, self.handleStartClick));
				EventUtils.addDomListener(this.vmd.stopButtonEl, 'click', EventUtils.bind(self, self.handleStopClick));
				EventUtils.addDomListener(this.vmd.finalCanvas, 'click', EventUtils.bind(self, self.handleGridClick));
				EventUtils.addDomListener(this.vmd.circleButtonEl, 'click', EventUtils.bind(self, self.handleCircleClick));
				EventUtils.addDomListener(this.vmd.horizButtonEl, 'click', EventUtils.bind(self, self.handleHorizClick));
				EventUtils.addDomListener(this.vmd.vertButtonEl, 'click', EventUtils.bind(self, self.handleVertClick));
				EventUtils.addDomListener(this.vmd.randomButtonEl, 'click', EventUtils.bind(self, self.handleRandomClick));
				EventUtils.addDomListener(this.vmd.glowButtonEl, 'click', EventUtils.bind(self, self.handleGlowButtonClick));

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

	    ViewManager.prototype.handleGlowButtonClick = function($e){
		    this.vmd.isGlowing = !this.vmd.isGlowing;
		    this.geb.dispatchEvent(new VMEvent(VMEvent.GLOW_UPDATE, this.vmd.isGlowing));

		    if(this.vmd.isGlowing !== true){
			    var boxShadowProp = DOMUtils.getSupportedProp(['boxShadow', 'MozBoxShadow', 'WebkitBoxShadow']);
			    this.vmd.finalCanvas.style[boxShadowProp] = 'none';
		    }
	    };

	    ViewManager.prototype.handleGridClick = function($e){
		    this.geb.dispatchEvent(new VMEvent(VMEvent.GRID_CLICKED, $e));
	    };

	    ViewManager.prototype.handleCircleClick = function($e){
		    this.geb.dispatchEvent(new VMEvent(VMEvent.REQUEST_CIRCLE_PATTERN, $e));
	    };

	    ViewManager.prototype.handleHorizClick = function($e){
		    this.geb.dispatchEvent(new VMEvent(VMEvent.REQUEST_HORIZ_PATTERN, $e));
	    };

	    ViewManager.prototype.handleVertClick = function($e){
		    this.geb.dispatchEvent(new VMEvent(VMEvent.REQUEST_VERT_PATTERN, $e));
	    };

	    ViewManager.prototype.handleRandomClick = function($e){
		    this.geb.dispatchEvent(new VMEvent(VMEvent.REQUEST_RANDOM_PATTERN, $e));
	    };

	    ViewManager.prototype.start = function(){
	        this.update();
	    };

	    ViewManager.prototype.update = function(){
		    var self = this;
		    this.vmd.window.requestAnimationFrame(self.updateDelegate);

			this.geb.dispatchEvent(this.frameUpdateEvent);

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
		   //this.showError('Please Allow Access To WebCam, press start');
	    };

	    /**
	     * handleStreamEnded
	     * @param {JacEvent} $e
	     * @private
	     */
	    ViewManager.prototype.handleStreamEnded = function($e){
		    this.vmd.stopButtonEl.disabled = true;
		    this.vmd.startButtonEl.disabled = false;
		   // this.showError('Camera Disconnected');
	    };

        //Return constructor
        return ViewManager;
    })();
});
