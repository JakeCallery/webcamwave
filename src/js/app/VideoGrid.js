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
'jac/utils/MathUtils',
'jac/utils/MouseUtils'],
function(EventDispatcher,ObjUtils, GEB, VMEvent, VMData, ArrayBufferGC, AppData, WCMEvent, MathUtils, MouseUtils){
    return (function(){
        /**
         * Creates a VideoGrid object
         * @param {VMData} $vmd
         * @param {int} $numCols
         * @param {int} $delayPerColor
         * @extends {EventDispatcher}
         * @constructor
         */
        function VideoGrid($vmd, $numCols, $delayPerColor){
            //super
            EventDispatcher.call(this);

	        this.arrayBufferGC = new ArrayBufferGC();
	        this.numCols = $numCols;
	        this.vmd = $vmd;
	        this.delayPerColor = $delayPerColor;
	        this.geb = new GEB();
	        this.ad = new AppData();
	        this.finalCanvas = this.vmd.finalCanvas;
	        this.finalContext = this.vmd.finalCanvasContext;
	        this.contextReadyCount = 0;
	        this.randomBlueMax = 60;
	        this.stampCanvas = this.vmd.document.createElement('canvas');
			this.stampContext = this.stampCanvas.getContext('2d');
	        this.frameData = null;
	        this.gradientStyle = null;
	        this.pastFrames = [];

	        this.finalW = this.finalCanvas.width;
	        this.finalH = this.finalCanvas.height;
	        this.videoW = this.vmd.videoEl.width;
	        this.videoH = this.vmd.videoEl.height;

	        this.isWebCamConnected = false;

	        //set up grid
	        var cellWidth = Math.floor(this.finalW / this.numCols);
	        var percent = cellWidth / this.videoW;
	        var cellHeight = Math.floor(this.videoH * percent);
			this.numRows = Math.floor(this.finalH / cellHeight);
	        this.stampWidth = cellWidth;
	        this.stampHeight = cellHeight;

	        //Set up gradient canvas
	        this.gradientCanvas = this.vmd.document.createElement('canvas');
	        this.gradientCanvas.width = this.numCols;
	        this.gradientCanvas.height = this.numRows;
	        this.gradientCtx = this.gradientCanvas.getContext('2d');

	        //Debug gradient canvas
	        var el = this.vmd.document.getElementById('circleDebugDiv');
	        el.appendChild(this.gradientCanvas);

	        //set up default pattern
	        var centerX = Math.floor(this.numCols/2);
	        var centerY = Math.floor(this.numRows/2);
	        this.setupCircleGradient(centerX, centerY);

	        var self = this;
	        this.geb.addHandler(VMEvent.FRAME_UPDATE, EventDispatcher.bind(self, self.handleFrameUpdate));
	        this.geb.addHandler(WCMEvent.CONNECTED, EventDispatcher.bind(self, self.handleWebCamConnect));
	        this.geb.addHandler(WCMEvent.STREAM_ENDED, EventDispatcher.bind(self, self.handleWebCamNotConnected));
	        this.geb.addHandler(WCMEvent.CONNECT_FAILED, EventDispatcher.bind(self, self.handleWebCamNotConnected));
	        this.geb.addHandler(VMEvent.GRID_CLICKED, EventDispatcher.bind(self, self.handleGridClick));
	        this.geb.addHandler(VMEvent.REQUEST_CIRCLE_PATTERN, EventDispatcher.bind(self, self.handleCirclePattern));
	        this.geb.addHandler(VMEvent.REQUEST_HORIZ_PATTERN, EventDispatcher.bind(self, self.handleHorizPattern));
	        this.geb.addHandler(VMEvent.REQUEST_VERT_PATTERN, EventDispatcher.bind(self, self.handleVertPattern));
	        this.geb.addHandler(VMEvent.REQUEST_RANDOM_PATTERN, EventDispatcher.bind(self, self.handleRandomPattern));

        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(VideoGrid,EventDispatcher);

	    VideoGrid.prototype.handleCirclePattern = function($e){
		    var centerX = Math.floor(this.numCols/2);
		    var centerY = Math.floor(this.numRows/2);
		    this.setupCircleGradient(centerX, centerY);
	    };

	    VideoGrid.prototype.handleHorizPattern = function($e){
			this.setupHorizontalGradient(Math.floor(this.numRows/2));
	    };

	    VideoGrid.prototype.handleVertPattern = function($e){
			this.setupVerticalGradient(Math.floor(this.numCols/2));
	    };

	    VideoGrid.prototype.handleRandomPattern = function($e){
			this.setupRandomGradient(this.randomBlueMax);
	    };

	    VideoGrid.prototype.setupHorizontalGradient = function($baseRow){
		    this.neededFrames = (this.numCols/2) * this.delayPerColor;

		    var topRows = $baseRow - 1;
		    var bottomRows = this.numRows - $baseRow;

		    var finalBlueTop = topRows * this.delayPerColor;
		    var finalBlueBottom = bottomRows * this.delayPerColor;

		    //Clear
		    this.gradientCtx.fillStyle = '#FF0000';
		    this.gradientCtx.fillRect(0,0,this.numCols, this.numRows);

		    //Top
		    for(var t = 0; t < topRows; t++){
			    this.gradientCtx.fillStyle = '#' + MathUtils.rgbToHex(0,0,(finalBlueTop - t));
			    this.gradientCtx.fillRect(0,t,this.numCols,1);
		    }

		    //Bottom
		    for(var b = this.numRows - 1, c = 0; b >= $baseRow; b--, c++){
			    this.gradientCtx.fillStyle = '#' + MathUtils.rgbToHex(0,0,finalBlueBottom - c);
			    this.gradientCtx.fillRect(0,b,this.numCols,1);
		    }

		    this.gradientStyle = 'horiz';
		    this.isGradientDataDirty = true;

	    };

	    VideoGrid.prototype.setupVerticalGradient = function($baseCol){
		    this.neededFrames = (this.numCols/2) * this.delayPerColor;

		    var leftCols = $baseCol - 1;
		    var rightCols = this.numCols - $baseCol;

		    var finalBlueLeft = leftCols * this.delayPerColor;
		    var finalBlueRight = rightCols * this.delayPerColor;

		    //Clear
		    this.gradientCtx.fillStyle = '#FF0000';
		    this.gradientCtx.fillRect(0,0,this.numCols, this.numRows);

		    //left side
			for(var l = 0; l < leftCols; l++){
				this.gradientCtx.fillStyle = '#' + MathUtils.rgbToHex(0,0,(finalBlueLeft - l));
				this.gradientCtx.fillRect(l,0,1,this.numRows);
			}

		    //right side
			for(var r = this.numCols- 1, c = 0; r >= $baseCol; r--, c++){
				this.gradientCtx.fillStyle = '#' + MathUtils.rgbToHex(0,0,finalBlueRight-c);
				this.gradientCtx.fillRect(r,0,1,this.numRows);
			}

		    this.gradientStyle = 'vert';

		    this.isGradientDataDirty = true;

	    };

	    VideoGrid.prototype.setupRandomGradient = function($maxBlue){

		    var highestBlue = 0;

		    for(var r = 0; r < this.numRows; r++){
			    for(var c = 0; c < this.numCols; c++){
				    var blue = Math.round(Math.random() * $maxBlue);
				    highestBlue = (blue > highestBlue)?blue:highestBlue;
				    this.gradientCtx.fillStyle = '#' + MathUtils.rgbToHex(0,0,blue);
				    this.gradientCtx.fillRect(c,r,1,1);
			    }
		    }

		    this.neededFrames = highestBlue * this.delayPerColor;
		    this.gradientStyle = 'random';
		    this.isGradientDataDirty = true;

	    };

	    VideoGrid.prototype.setupCircleGradient = function($centerX, $centerY){
		    //Set up circle gradient
		    var circleDiam = Math.ceil(Math.sqrt((this.numCols * this.numCols)+(this.numRows * this.numRows))) * 2;
		    this.neededFrames = circleDiam * this.delayPerColor;

		    var blue = 0;
		    var green = 0;
		    var red = 0;

		    this.gradientCtx.fillStyle = '#0000FF';
		    this.gradientCtx.fillRect(0,0,this.numCols, this.numRows);

		    for(var i = circleDiam; i >= 0; i--){
			    blue = i;
			    var color = '#' + MathUtils.rgbToHex(red, green, blue);
			    this.gradientCtx.beginPath();
			    this.gradientCtx.arc($centerX, $centerY, i/2, 0, 2*Math.PI,false);
			    this.gradientCtx.fillStyle = color;
			    this.gradientCtx.fill();
		    }

		    //Force 0 delay in center
		    //this.gradientCtx.fillStyle = '#000000';
		    //this.gradientCtx.fillRect($centerX-1, $centerY-1, 1, 1);
		    this.gradientStyle = 'circle';
		    this.isGradientDataDirty = true;
	    };

	    VideoGrid.prototype.handleFrameUpdate = function($e){

		    if(!this.isWebCamConnected){
			    return;
		    }

		    if(this.isGradientDataDirty){
			    this.circleData = this.gradientCtx.getImageData(0,0,this.numCols, this.numRows);
			    this.isGradientDataDirty = false;
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
		    var data = this.circleData.data;
		    for(var r = 0; r < this.numRows; r++){
			    for(var c = 0; c < this.numCols; c++){
				    var idx = (r * this.circleData.width * 4) + (c * 4);
				    var blueColor = data[idx+2];
				    var frameIndexFromColor = parseInt(blueColor) * this.delayPerColor;
				    if((this.pastFrames.length - frameIndexFromColor - 1) >= 0){
					    this.finalContext.putImageData(this.pastFrames[this.pastFrames.length - frameIndexFromColor - 1], c*this.stampWidth, r*this.stampHeight);
				    }
			    }
		    }
	    };

	    VideoGrid.prototype.handleGridClick = function($e){
		    var tmp = MouseUtils.getRelCoords(this.finalCanvas, $e.data);
		    var clickX = tmp.x;
		    var clickY = tmp.y;

		    var centerX = Math.floor(((this.numCols * this.stampWidth) - clickX) / this.stampWidth);
			if(((this.numCols * this.stampWidth) - clickX) % this.stampWidth != 0){
				centerX += 1;
			}

		    centerX = this.numCols - centerX;

		    var centerY = Math.floor(((this.numRows * this.stampHeight) - clickY) / this.stampHeight);
		    if(((this.numRows * this.stampHeight) - clickY) % this.stampHeight != 0){
			    centerY += 1;
		    }

		    centerY = this.numRows - centerY;

		    switch (this.gradientStyle){
			    case 'circle':
				    this.setupCircleGradient(centerX, centerY);
				    break;

			    case 'vert':
				    this.setupVerticalGradient(centerX);
				    break;

			    case 'horiz':
				    this.setupHorizontalGradient(centerY);
				    break;

			    case 'random':
				    this.setupRandomGradient(this.randomBlueMax);
				    break;

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
