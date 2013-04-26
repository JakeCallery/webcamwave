/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define([],
function(){
    return (function(){
        /**
         * Creates a VMData object
         * @constructor
         */
        function VMData(){
	        this.document = null;
	        this.window = null;
	        this.navigator = null;
	        this.videoEl = null;
	        this.finalCanvas = null;
	        this.finalCanvasContext = null;
	        this.startButtonEl = null;
	        this.stopButtonEl = null;
	        this.stats = null;
        }


        //Return constructor
        return VMData;
    })();
});
