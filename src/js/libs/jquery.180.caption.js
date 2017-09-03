/**
 * 180° Caption plugin
 * 
 * This is a part of the 180° Framework
 * 
 * @author  Karine Do, Laurent Le Graverend
 * @license Copyright (c) 2011 Asiance (http://www.asiance.com), Licensed under the MIT License.
 * @updated 2011-12-28
 * @link    https://github.com/Asiance/180/
 * @version 2.0
 */
(function($) {

	var methods = {

		init : function(options) {
			var $caption = $(this);
			var image = $caption.prev('img');
			var imagealign = image.css('float');
			$caption.prev('img').andSelf().wrapAll('<div>');
			$caption.parent('div').css({
				'width' : image.outerWidth(true),
				'height' : image.outerHeight(true),
				'float' : imagealign,
				'position' : 'relative',
				'overflow' : 'hidden'
			});
		}
	};

	$.fn._180_caption = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist');
		}
	};
})(jQuery);