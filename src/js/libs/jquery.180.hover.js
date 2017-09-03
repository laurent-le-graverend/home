/**
 * 180° Hover plugin
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
			$(this).css({'width': $(this).find('img').width(), 'height': $(this).find('img').height()});
			
			$(this).hover(function() {
				$(this).find('.hovertext').stop(true,true).fadeIn('slow');
				if ($(this).find('.caption').length) {
					$(this).find('.caption').stop().hide();
				}
				//$(this).find('img').stop(false,true).animate({'width':$(this).width()*1.2, 'height':$(this).height()*1.2, 'top':'-'+$(this).width()*0.1, 'left':'-'+$(this).height()*0.1}, {duration:200});
			}, function() {
				$(this).find('.hovertext').hide();
				if ($(this).find('.caption').length) {
					$(this).find('.caption').stop().show();
				}
				//$(this).find('img').stop(false,true).animate({'width':$(this).width(), 'height':$(this).height(), 'top':'0', 'left':'0'}, {duration:100});
			});
		}
	};

	$.fn._180_hover = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist');
		}
	};
})(jQuery);