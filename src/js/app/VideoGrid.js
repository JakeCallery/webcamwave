/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define(['jac/events/EventDispatcher',
'jac/utils/ObjUtils',
'jac/events/GlobalEventBus',
'app/events/VMEvent',
'app/VMData'],
function(EventDispatcher,ObjUtils, GEB, VMEvent, VMData){
    return (function(){
        /**
         * Creates a VideoGrid object
         * @param {VMData} $vmd
         * @param {int} $numCols
         * @param {int} $numRows
         * @extends {EventDispatcher}
         * @constructor
         */
        function VideoGrid($vmd, $numCols, $numRows){
            //super
            EventDispatcher.call(this);

	        this.numCols = $numCols;
	        this.numRows = $numRows;
	        this.vmd = $vmd;
	        this.geb = new GEB();
	        this.finalCanvas = this.vmd.finalCanvas;
	        this.finalContext = this.vmd.finalCanvasContext;
	        this.stampCanvas = this.vmd.document.createElement('canvas');
			this.stampContext = this.stampCanvas.getContext('2d');
	        this.frameData = null;

	        this.finalW = this.finalCanvas.width;
	        this.finalH = this.finalCanvas.height;
	        this.stampWidth = Math.floor(this.finalW / this.numCols);
	        this.stampHeight = Math.floor((this.finalH / this.numRows));

	        var self = this;
	        this.geb.addHandler(VMEvent.FRAME_UPDATE, EventDispatcher.bind(self, self.handleFrameUpdate));
        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(VideoGrid,EventDispatcher);

	    VideoGrid.prototype.handleFrameUpdate = function($e){
		    this.stampContext.drawImage(this.vmd.videoEl, 0, 0, 640, 480, 0, 0, this.stampWidth, this.stampHeight);
			this.frameData = this.stampContext.getImageData(0,0,320,240);

			//make stamps
		    for(var r = 0; r < this.numRows; r++)
		    {
			    for(var c = 0; c < this.numCols; c++){
				    this.finalContext.drawImage(this.stampCanvas, 0, 0, this.stampWidth, this.stampHeight,
					    (c * this.stampWidth),(r * this.stampHeight), this.stampWidth, this.stampHeight);
			    }
		    }

	    };

        //Return constructor
        return VideoGrid;
    })();
});
