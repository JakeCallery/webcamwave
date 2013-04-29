/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define([
'jac/events/EventDispatcher',
'jac/utils/ObjUtils',
'jac/events/GlobalEventBus',
'jac/utils/EventUtils',
'jac/webCam/WebCam',
'jac/webCam/events/WebCamEvent',
'app/events/WCMEvent',
'app/events/VMEvent',
'app/VMData'],
function(EventDispatcher,ObjUtils,GEB, EventUtils, WebCam, WebCamEvent, WCMEvent, VMEvent, VMData){
    return (function(){
        /**
         * Creates a WebCamManager object
         * @param {VMData} $vmd
         * @extends {EventDispatcher}
         * @constructor
         */
        function WebCamManager($vmd){
            //super
            EventDispatcher.call(this);

	        var self = this;
			this.vmd = $vmd;

	        this.webCam = null;
	        this.geb = new GEB();

	        //GEB
	        this.geb = new GEB();
	        this.geb.addHandler(VMEvent.REQUEST_CAM_STOP,EventDispatcher.bind(self, self.handleReqCamStop));
	        this.geb.addHandler(VMEvent.REQUEST_CAM_START,EventDispatcher.bind(self, self.handleReqCamStart));

        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(WebCamManager,EventDispatcher);

	    /**
	     * init
	     */
	    WebCamManager.prototype.init = function(){
		    var self = this;

			if(WebCam.checkSupport(self.vmd.navigator, self.vmd.window) === true){
				self.webCam = new WebCam(self.vmd.document, self.vmd.navigator, self.vmd.window, self.vmd.videoEl);
				self.webCam.addHandler(WebCamEvent.STREAM_ENDED, EventUtils.bind(self, self.handleStreamEnded));
				self.webCam.addHandler(WebCamEvent.CONNECT_SUCCESS, EventUtils.bind(self, self.handleConnectSuccess));
				self.webCam.addHandler(WebCamEvent.CONNECT_FAIL, EventUtils.bind(self, self.handleConnectFail));
				self.webCam.init(true, false);
			} else {
				this.geb.dispatchEvent(new WCMEvent(WCMEvent.NO_WEB_CAM));
			}
	    };

	    /**
	     * handleReqCamStop
	     * @param {Event} $e
	     * @private
	     */
	    WebCamManager.prototype.handleReqCamStop = function($e){
			if(this.webCam){
				this.webCam.stop();
			}
	    };

	    /**
	     * handleReqCamStart
	     * @param {Event} $e
	     * @private
	     */
	    WebCamManager.prototype.handleReqCamStart = function($e){
			if(this.webCam){
				this.webCam.init(true, true);
			}
	    };

	    /**
	     * handleStreamEnded
	     * @param {Event} $e
	     * @private
	     */
	    WebCamManager.prototype.handleStreamEnded = function($e){
		    console.log('Caught STream Ended');
			this.geb.dispatchEvent(new WCMEvent(WCMEvent.STREAM_ENDED, $e));
	    };

	    /**
	     * handleConnectSuccess
	     * @param {Event} $e
	     * @private
	     */
	    WebCamManager.prototype.handleConnectSuccess = function($e){
		    this.geb.dispatchEvent(new WCMEvent(WCMEvent.CONNECTED, $e));
	    };

	    /**
	     * handleConnectFail
	     * @param {Event} $e
	     * @private
	     */
	    WebCamManager.prototype.handleConnectFail = function($e){
		    this.geb.dispatchEvent(new WCMEvent(WCMEvent.CONNECT_FAIL, $e));
	    };

        //Return constructor
        return WebCamManager;
    })();
});
