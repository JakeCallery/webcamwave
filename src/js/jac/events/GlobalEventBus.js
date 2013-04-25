/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define(['jac/events/EventDispatcher','jac/utils/ObjUtils'],
function(EventDispatcher,ObjUtils){
    return (function(){
        /**
         * Creates a GlobalEventBus Singleton object
         * @extends {EventDispatcher}
         * @constructor
         */
        function GlobalEventBus(){
	        if(GlobalEventBus.prototype._singletonInstance){
		        return GlobalEventBus.prototype._singletonInstance;
	        }

	        //super
	        EventDispatcher.call(this);
	        GlobalEventBus.prototype._singletonInstance = this;
        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(GlobalEventBus,EventDispatcher);
        
        //Return constructor
        return GlobalEventBus;
    })();
});
