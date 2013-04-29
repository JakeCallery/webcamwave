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
'app/events/WCMEvent',
'jac/utils/MathUtils'],
function(EventDispatcher,ObjUtils, GEB, VMEvent, VMData, ArrayBufferGC, AppData, WCMEvent, MathUtils){
    return (function(){
        /**
         * Creates a VideoGrid object
         * @param {VMData} $vmd
         * @param {int} $numCols
         * @param {int} $delayPerRing
         * @extends {EventDispatcher}
         * @constructor
         */
        function VideoGrid($vmd, $numCols, $delayPerRing){
            //super
            EventDispatcher.call(this);

	        this.arrayBufferGC = new ArrayBufferGC();
	        this.numCols = $numCols;
	        this.vmd = $vmd;
	        this.delayPerRing = $delayPerRing;
	        this.geb = new GEB();
	        this.ad = new AppData();
	        this.finalCanvas = this.vmd.finalCanvas;
	        this.finalContext = this.vmd.finalCanvasContext;
	        this.contextReadyCount = 0;
	        this.stampCanvas = this.vmd.document.createElement('canvas');
			this.stampContext = this.stampCanvas.getContext('2d');
	        this.frameData = null;
	        this.pastFrames = [];

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

	        //Set up circle gradient
	        this.circleCanvas = this.vmd.document.createElement('canvas');
	        var el = this.vmd.document.getElementById('circleDebugDiv');
	        el.appendChild(this.circleCanvas);
	        var circleDiam = Math.floor(this.numCols * 1.5);
	        this.neededFrames = circleDiam * this.delayPerRing;
	        this.circleCanvas.width = this.numCols;
	        this.circleCanvas.height = this.numRows;
	        this.circleCanvasCtx = this.circleCanvas.getContext('2d');
	        var centerX = Math.round(this.circleCanvas.width/2);
	        var centerY = Math.round(this.circleCanvas.height/2);

	        var blue = 0;
	        var green = 0;
	        var red = 0;

	        this.circleCanvasCtx.fillStyle = '#FF0000';
	        this.circleCanvasCtx.fillRect(0,0,this.numCols, this.numRows);

	        for(var i = circleDiam; i >= 0; i--){
		        blue = i * this.delayPerRing;
		        var color = '#' + MathUtils.rgbToHex(red, green, blue);
		        this.circleCanvasCtx.beginPath();
		        this.circleCanvasCtx.arc(centerX, centerY, i/2, 0, 2*Math.PI,false);
		        this.circleCanvasCtx.fillStyle = color;
		        this.circleCanvasCtx.fill();
			}

	        //Force 0 delay in center
	        this.circleCanvasCtx.fillStyle = '#000000';
	        this.circleCanvasCtx.fillRect(centerX, centerY,1,1);

	        this.circleData = this.circleCanvasCtx.getImageData(0,0,this.circleCanvas.width, this.circleCanvas.height);

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
			this.pastFrames.push(this.stampContext.getImageData(0,0,this.stampWidth,this.stampHeight));

		    if(this.pastFrames.length > this.neededFrames){
			    var oldFrame = this.pastFrames.shift();
			    if(!this.ad.isFireFox){
				    this.arrayBufferGC.dispose(oldFrame);
			    }
			    oldFrame = null;
		    }

			//make stamps
		    if(this.pastFrames.length >= this.neededFrames){
			    var data = this.circleData.data;
			    for(var r = 0; r < this.numRows; r++){
				    for(var c = 0; c < this.numCols; c++){
					    var idx = (r * this.circleData.width * 4) + (c * 4);
					    var blueColor = data[idx+2];
					    var frameIndexFromColor = parseInt(blueColor);
					    this.finalContext.putImageData(this.pastFrames[this.pastFrames.length - frameIndexFromColor - 1], c*this.stampWidth, r*this.stampHeight);
				    }
			    }
		    }
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
