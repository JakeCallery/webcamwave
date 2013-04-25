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
         * @extends {EventDispatcher}
         * @constructor
         */
        function ViewManager($document){
            //super
            EventDispatcher.call(this);

	        var self = this;

	        this.videoEl = $document.getElementById('camvideo');
			this.startButtonEl = $document.getElementById('startButtonEl');
	        this.stopButtonEl = $document.getElementById('stopButtonEl');
			this.startButtonEl.disabled = true;
	        this.stopButtonEl.disabled = true;

	        //Button Events
	        EventUtils.addDomListener(this.startButtonEl, 'click', EventUtils.bind(self, self.handleStartClick));
	        EventUtils.addDomListener(this.stopButtonEl, 'click', EventUtils.bind(self, self.handleStopClick));

	        //GEB Events
	        this.geb = new GEB();
			this.geb.addHandler(WCMEvent.CONNECTED, EventDispatcher.bind(self, self.handleConnected));
			this.geb.addHandler(WCMEvent.CONNECT_FAIL, EventDispatcher.bind(self, self.handleConnectFail));
			this.geb.addHandler(WCMEvent.STREAM_ENDED, EventDispatcher.bind(self, self.handleStreamEnded));
        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(ViewManager,EventDispatcher);

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
	    };

	    /**
	     * handleConnectFailed
	     * @param {JacEvent} $e
	     * @private
	     */
	    ViewManager.prototype.handleConnectFailed = function($e){
			this.stopButtonEl.disabled = true;
			this.startButtonEl.disabled = false;
	    };

	    /**
	     * handleStreamEnded
	     * @param {JacEvent} $e
	     * @private
	     */
	    ViewManager.prototype.handleStreamEnded = function($e){
		    this.stopButtonEl.disabled = true;
		    this.startButtonEl.disabled = false;
	    };

        //Return constructor
        return ViewManager;
    })();
});
