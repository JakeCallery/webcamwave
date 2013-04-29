/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define([],
function(){
    return (function(){
        /**
         * Creates a AppData Singleton object
         * to use ALWAYS new it up mySingleton = new AppData()
         * @constructor
         */
        function AppData(){
	        if(AppData.prototype._singletonInstance){
		        return AppData.prototype._singletonInstance;
	        }

	        //TODO: remove this when webwork GC hack doesn't crash Firefox
	        this.isFireFox = /Firefox/i.test(navigator.userAgent);
	        //Set first instance
	        AppData.prototype._singletonInstance = this;
        }
        
        //Return constructor
        return AppData;
    })();
});
