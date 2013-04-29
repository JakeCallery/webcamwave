/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define([],
function(){
    return (function(){
       var MathUtils = {};

	    MathUtils.rgbToHex = function($red, $green, $blue){
			return MathUtils.toHex($red) + MathUtils.toHex($green) + MathUtils.toHex($blue);
	    };

	    MathUtils.toHex = function($num){
		    $num = parseInt($num,10);
		    if (isNaN($num)) return "00";
		    $num = Math.max(0,Math.min($num,255));
		    return "0123456789ABCDEF".charAt(($num-$num%16)/16)
			    + "0123456789ABCDEF".charAt($num%16);
	    };
        
        //Return constructor
        return MathUtils;
    })();
});
