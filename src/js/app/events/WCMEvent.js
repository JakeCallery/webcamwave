/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define(['jac/events/JacEvent','jac/utils/ObjUtils'],
function(JacEvent,ObjUtils){
    return (function(){
        /**
         * Creates a WCMEvent object
         * @extends {JacEvent}
         * @constructor
         */
        function WCMEvent($type, $data){
            //super
            JacEvent.call(this, $type, $data);
        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(WCMEvent,JacEvent);

	    /** @const */ WCMEvent.NO_WEB_CAM = 'wcmNoWebCamEvent';
	    /** @const */ WCMEvent.CONNECTED = 'wcmConnectedEvent';
	    /** @const */ WCMEvent.CONNECT_FAILED = 'wcmConnectFailedEvent';
	    /** @const */ WCMEvent.STREAM_ENDED = 'wcmStreamStoppedEvent';


        //Return constructor
        return WCMEvent;
    })();
});
