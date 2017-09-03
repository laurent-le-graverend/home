/**
 * 180° Scrollarea plugin
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
			var defaults = {"width":"500","height":"300"};
					var options = $.extend(true, defaults, $(this).data('options'));
					$(this)
						.css({'width': options.width, 'height': options.height})
						.jScrollPane({showArrows: false});
		}
	};

	$.fn._180_scrollarea = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist');
		}
	};
})(jQuery);