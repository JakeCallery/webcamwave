/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define(['jac/events/EventDispatcher',
'jac/utils/ObjUtils',
'jac/events/GlobalEventBus',
'app/events/VMEvent',
'app/VMData',
'jac/asyncGC/ArrayBufferGC',
'app/AppData',
'app/events/WCMEvent'],
function(EventDispatcher,ObjUtils, GEB, VMEvent, VMData, ArrayBufferGC, AppData, WCMEvent){
    return (function(){
        /**
         * Creates a VideoGrid object
         * @param {VMData} $vmd
         * @param {int} $numCols
         * @extends {EventDispatcher}
         * @constructor
         */
        function VideoGrid($vmd, $numCols){
            //super
            EventDispatcher.call(this);

	        this.arrayBufferGC = new ArrayBufferGC();
	        this.numCols = $numCols;
	        this.vmd = $vmd;
	        this.geb = new GEB();
	        this.ad = new AppData();
	        this.finalCanvas = this.vmd.finalCanvas;
	        this.finalContext = this.vmd.finalCanvasContext;
	        this.contextReadyCount = 0;
	        this.stampCanvas = this.vmd.document.createElement('canvas');
			this.stampContext = this.stampCanvas.getContext('2d');
	        this.frameData = null;

	        this.finalW = this.finalCanvas.width;
	        this.finalH = this.finalCanvas.height;
	        this.videoW = this.vmd.videoEl.width;
	        this.videoH = this.vmd.videoEl.height;
	        //this.stampWidth = Math.floor(this.finalW / this.numCols);
	        //this.stampHeight = Math.floor((this.finalH / this.numRows));

	        this.isWebCamConnected = false;

	        //set up grid
	        var cellWidth = Math.floor(this.finalW / this.numCols);
	        var percent = cellWidth / this.videoW;
	        var cellHeight = Math.floor(this.videoH * percent);
			this.numRows = Math.floor(this.finalH / cellHeight);
	        this.stampWidth = cellWidth;
	        this.stampHeight = cellHeight;

	        var self = this;
	        this.geb.addHandler(VMEvent.FRAME_UPDATE, EventDispatcher.bind(self, self.handleFrameUpdate));
	        this.geb.addHandler(WCMEvent.CONNECTED, EventDispatcher.bind(self, self.handleWebCamConnect));
	        this.geb.addHandler(WCMEvent.STREAM_ENDED, EventDispatcher.bind(self, self.handleWebCamNotConnected));
	        this.geb.addHandler(WCMEvent.CONNECT_FAILED, EventDispatcher.bind(self, self.handleWebCamNotConnected));

        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(VideoGrid,EventDispatcher);

	    VideoGrid.prototype.handleFrameUpdate = function($e){

		    if(!this.isWebCamConnected){
			    return;
		    }

		    //Hack to get around the NS_COMPONENT_NOT_READY error in firefox
		    //try/catch is super slow though, so when we are confident the component is ready, skip the try/catch
		    if(this.contextReadyCount < 10){
			    try{
				    this.stampContext.drawImage(this.vmd.videoEl, 0, 0, this.videoW, this.videoH, 0, 0, this.stampWidth, this.stampHeight);
				    this.contextReadyCount++;
			    } catch(err){
				    this.contextReadyCount = 0;
			    }
		    } else {
			    this.stampContext.drawImage(this.vmd.videoEl, 0, 0, this.videoW, this.videoH, 0, 0, this.stampWidth, this.stampHeight);
		    }

			//Not needed yet for this experiment, will need for future experiments
			//this.frameData = this.stampContext.getImageData(0,0,this.stampWidth,this.stampHeight);

			//make stamps
		    for(var r = 0; r < this.numRows; r++){
			    for(var c = 0; c < this.numCols; c++){
				    this.finalContext.drawImage(this.stampCanvas, 0, 0, this.stampWidth, this.stampHeight,
					    (c * this.stampWidth),(r * this.stampHeight), this.stampWidth, this.stampHeight);
			    }
		    }

		    //Hack to get around FF crashing when using Webworker ArrayBuffer dispose
		    /*
		    if(!this.ad.isFireFox){
			    this.arrayBufferGC.dispose(this.frameData.data.buffer);
		    }
		    */
	    };

	    VideoGrid.prototype.handleWebCamConnect = function($e){
		    this.isWebCamConnected = true;
	    };

	    VideoGrid.prototype.handleWebCamNotConnected = function($e){
		    this.isWebCamConnected = false;
	    };

        //Return constructor
        return VideoGrid;
    })();
});
