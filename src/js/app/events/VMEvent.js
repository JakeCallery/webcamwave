/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define(['jac/events/JacEvent','jac/utils/ObjUtils'],
function(JacEvent,ObjUtils){
    return (function(){
        /**
         * Creates a VMEvent object
         * @param {String} $type
         * @param {Object} [$data]
         * @extends {JacEvent}
         * @constructor
         */
        function VMEvent($type, $data){
            //super
            JacEvent.call(this, $type, $data);
        }

        //Inherit / Extend
        ObjUtils.inheritPrototype(VMEvent,JacEvent);

	    /** @const */ VMEvent.REQUEST_CAM_STOP = 'vmRequestCamStopEvent';
	    /** @const */ VMEvent.REQUEST_CAM_START = 'vmRequestCamStartEvent';
	    /** @const */ VMEvent.FRAME_UPDATE = 'vmFrameUpdateEvent';
	    /** @const */ VMEvent.GRID_CLICKED = 'vmGridClickedEvent';

        //Return constructor
        return VMEvent;
    })();
});
