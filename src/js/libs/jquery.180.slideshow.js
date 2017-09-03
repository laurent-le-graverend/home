/**
 * 180° Slideshow plugin
 * 
 * This is a part of the 180° Framework
 * 
 * @author  Karine Do, Laurent Le Graverend
 * @license Copyright (c) 2011 Asiance (http://www.asiance.com), Licensed under the MIT License.
 * @updated 2011-12-28
 * @link    https://github.com/Asiance/180/
 * @version 2.1
 */
(function($){
	
	var methods = {
		
		init : function(options) {
			var $slider = $(this);

			var settings = $.extend({
				"width":"500",
				"height":"300",
				"loop":true,
				"paginate":false,
				"display":"1",
				"prev":"Previous",
				"next":"Next"
			}, $slider.data('options'), options);

			var item = $slider.children('ul').children('li');

			var slider_width_value = parseInt(settings.width);
			
			var slider_width_unit = 'px';
			if (settings.width != slider_width_value) {
				slider_width_unit = settings.width.replace(new RegExp('[0-9]*'), '');
			}
							
			var current_slide = 1;
			
			if (settings.display > 1) {
				slider_width_value = parseInt(slider_width_value/settings.display);
			}
			var inner_width = slider_width_value * item.length;
			
			if (slider_width_unit === '%') {
				slider_item = slider_width_value / item.length * settings.display + slider_width_unit;
				move_left = slider_width_value;
			} else {
				slider_item = slider_width_value;
				slider_width_unit = 'px';
				move_left = slider_width_value;
			}
			
			if(item.length >= 2) {
				$('<div class="buttons"><a href="#" class="prev"><span>' + settings.prev + '</span></a><a href="#" class="next"><span>' +  settings.next + '</span></a></div>').insertAfter($slider);
			}
			
			$slider
				.css({'width' : settings.width, 'height' : settings.height})
				.children('ul').css({'width' : inner_width + slider_width_unit})
				.end()
				.children('ul').children('li').css({'width' : slider_item});

			if(settings.loop === false) {
				$slider.next().children('.prev').hide();
				$slider.next().children('.prev').bind('click._180 touchstart._180', function(e) {
					var $this = $(this);
					current_slide--;
					if (current_slide === 1) {
						$this.hide();
					}
					if (current_slide <= 0) {
						current_slide = 1;
						e.preventDefault();
					} else {
						$this.parent('.buttons').prev().children('ul').animate({'left' : slider_width_value * -(current_slide-1) + slider_width_unit}, 600);
						$('.activestep').removeClass('activestep').prev().addClass('activestep');
						$this.siblings().show();
					}
					return false;
				});
				
				$slider.next().children('.next').bind('click._180 touchstart._180', function(e) {
					var $this = $(this);
					current_slide++;
					if (current_slide === item.length) {
						$this.hide();
					}
					if (current_slide > item.length) {
						current_slide = item.length;
						e.preventDefault();
					} else {
						$this.parent('.buttons').prev().children('ul').animate({'left' : slider_width_value * -(current_slide-1) + slider_width_unit}, 600);
						$('.activestep').removeClass('activestep').next().addClass('activestep');
						$this.siblings().show();
					}
					return false;
				});
			} else {
				$slider
					.children('ul').children('li:first').before($slider.children('ul').children('li:last'))
					.end()
					.css({'left' : '-' + slider_width_value  + slider_width_unit});

				$slider.next().children('.prev').bind('click._180 touchstart._180', function() {
					var $this = $(this);
					current_slide--;
					$this.parent('.buttons').prev().children('ul').animate({'left' : '+=' + slider_width_value  + slider_width_unit}, 600, function(){
						$slider
							.children('ul').children('li:first').before($slider.children('ul').children('li:last'))
							.end()
							.css({'left' : '-' + slider_width_value + slider_width_unit});
					});
					return false;
				});
				
				$slider.next().children('.next').bind('click._180 touchstart._180', function() {
					var $this = $(this);
					current_slide++;
					$this.parent('.buttons').prev().children('ul').animate({'left' : '-=' + slider_width_value  + slider_width_unit}, 600, function() {
						$slider
							.children('ul').children('li:last').after($slider.children('ul').children('li:first'))
							.end()
							.css({'left' : '-' + slider_width_value + slider_width_unit});
					});
					return false;
				});
			}
			if(settings.paginate === true && settings.loop === false) {
				$('<div class="pages"></div>').insertBefore($slider.next().children('.next'));
				for (var i = 0; i < item.length; i ++) {
					var $link = $('<a href="#"></a>');
					$link
						.addClass('page link'+(i+1))
						.data('slider-number', i+1)
						.append((i + 1));
					$link.appendTo('.pages');
				}
				$('.pages a:first').addClass('activestep');
				$('.page').bind('click._180 touchstart._180', function(e) {
					var $this = $(this);
					current_slide = $(this).data('slider-number');
					$('.activestep').removeClass('activestep');
					$this.addClass('activestep');
					if(current_slide <= "1") {
						$slider.next().children('.prev').hide();
						$slider.next().children('.next').show();
					} else if (current_slide == item.length) {
						$slider.next().children('.next').hide();
					} else {
						$slider.next().children('.prev').show();
						$slider.next().children('.next').show();
					}
					move_left = slider_width_value * -(current_slide-1);
					$this.parent('.pages').parent('.buttons').prev().children('ul').animate({'left' : move_left + slider_width_unit}, 600);
					return false;
				});
			}
		}
	};
	
	$.fn._180_slideshow = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error( 'Method ' +  method + ' does not exist' );
		}
	};
})(jQuery);