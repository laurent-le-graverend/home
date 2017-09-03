/**
 * 180° Lightbox plugin
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
			var settings = $.extend({
				container : $('#container')
			}, options);
			
			this.bind('click._180 touchstart._180', function() {
				var lightboxID = $(this).data('lightbox-name');
				var lightboxWidth = parseInt($(this).data('lightbox-width'));
				var lightboxMargTop = ($('#' + lightboxID).height()) / 2;
				var lightboxMargLeft = lightboxWidth/2;
				
				$('body').append('<div id="overlay" onclick=""></div>');
				
				$('#overlay').css({'filter' : 'alpha(opacity=80)', 'width': settings.container.width()}).stop().fadeIn();
				
				// TODO, something is wrong here
				// See with Karine if this is usefull
				//$(document).off('keydown._180', jQuery.fn._180('keyboardNavigation')).on('keydown._180', function(e) {e.preventDefault(); });
				
				$('#' + lightboxID)
					.insertAfter('#overlay')
					.stop().fadeIn()
					.css({ 'width': lightboxWidth })
					.prepend('<a href="#" class="close"><span><span></a>')
					.css({'margin-top' : -lightboxMargTop, 'margin-left' : -lightboxMargLeft});
				
				return false;
			});
			
			$('a.close, #overlay').live('click._180 touchstart._180', function() {
				$('#overlay , .lightbox_content').stop(true, true).fadeOut();
				$('#overlay, .close').remove();
				//$(document).on('keydown._180', jQuery.fn._180('keyboardNavigation')).off('keydown._180', function(e) {e.preventDefault(); });
				return false;
			});
		}
	};

	$.fn._180_lightbox = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist');
		}
	};
})(jQuery);