/**
 * 180° Sliding Panel plugin
 * 
 * This is a part of the 180° Framework
 * 
 * @author  Karine Do, Laurent Le Graverend
 * @license Copyright (c) 2011 Asiance (http://www.asiance.com), Licensed under the MIT License.
 * @updated 2011-12-29
 * @link    https://github.com/Asiance/180/
 * @version 2.0
 */
(function($) {

	var methods = {

		init : function(options) {
			var settings = $.extend({
				slidingpanelHeight: 400
			}, options);
			var $self = $(this);
			var menuPosition = 'top';
			if ($('#menu').css('top') != "0px") {
				menuPosition = 'bottom';
			}
			$self
				.css(menuPosition, 0 + parseInt($('#menu').css('height')))
				.css({'height' : (settings.slidingpanelHeight) + 'px'}).hide();
			$('.slidepanel').bind('click._180', function() {
				$self.stop().animate({'height':'toggle'});
			});
		}
	};

	$.fn._180_slidingpanel = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist');
		}
	};
})(jQuery);