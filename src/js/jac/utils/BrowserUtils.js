/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define([],
function(){
    return (function(){
        var BrowserUtils = {};

	    /**
	     * Returns a supported property from a list, or empty string if not found
	     * @param {array} $propList list of strings to find as props
	     * @param {document} [$doc = document]
	     * @returns {String} the name of the supported prop or empty string if not found
	     */
	    BrowserUtils.getSupportedProp = function($propList, $doc){
		    var doc = $doc || document;
			var root = doc.documentElement;

		    for(var i = 0; i < $propList.length; i++){
			    if($propList[i] in root.style){
				    return $propList[i];
			    }
		    }
		    return '';

	    };
        
        //Return constructor
        return BrowserUtils;
    })();
});
