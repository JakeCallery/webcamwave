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
         * @extends {EventDispatcher}
         * @constructor
         */
        function VideoGrid($vmd){
            //super
            EventDispatcher.call(this);

	        this.vmd = $vmd;
	        this.geb = new GEB();

	        var self = this;
	        this.geb.addHandler(VMEvent.FRAME_UPDATE, EventDispatcher.bind(self, self.handleFrameUpdate));
        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(VideoGrid,EventDispatcher);

	    VideoGrid.prototype.handleFrameUpdate = function($e){
		    this.vmd.finalCanvasContext.drawImage(this.vmd.videoEl,0,0,640,480,0,0,320,240);
	    };

        //Return constructor
        return VideoGrid;
    })();
});
