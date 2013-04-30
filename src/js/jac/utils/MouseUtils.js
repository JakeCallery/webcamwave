/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define([],
function(){
    return (function(){
        var MouseUtils = {};

	    /**
	     * Returns and object with x and y properties that contain the relative x/y coords of the click
	     * @param {Object} $domTarget
	     * @param {Event} $clickEvent
	     * @returns {Object} this object has .x and .y props
	     */
	    MouseUtils.getRelCoords = function($domTarget, $clickEvent){
	        if($clickEvent.offsetX !== undefined && $clickEvent.offsetY !== undefined){
		        return {x:$clickEvent.offsetX, y:$clickEvent.offsetY}
	        } else {
			    var totalOffsetX = 0;
			    var totalOffsetY = 0;
			    var currentElement = $domTarget;

			    do{
				    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
				    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
			    }
			    while(currentElement = currentElement.offsetParent);

			    var targetX = $clickEvent.pageX - totalOffsetX;
			    var targetY = $clickEvent.pageY - totalOffsetY;

			    return {x:targetX, y:targetY};
	        }
	    };
        
        
        //Return constructor
        return MouseUtils;
    })();
});
