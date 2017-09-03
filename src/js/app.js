/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */
(function(a){function d(b){var c=b||window.event,d=[].slice.call(arguments,1),e=0,f=!0,g=0,h=0;return b=a.event.fix(c),b.type="mousewheel",c.wheelDelta&&(e=c.wheelDelta/120),c.detail&&(e=-c.detail/3),h=e,c.axis!==undefined&&c.axis===c.HORIZONTAL_AXIS&&(h=0,g=-1*e),c.wheelDeltaY!==undefined&&(h=c.wheelDeltaY/120),c.wheelDeltaX!==undefined&&(g=-1*c.wheelDeltaX/120),d.unshift(b,e,g,h),(a.event.dispatch||a.event.handle).apply(this,d)}var b=["DOMMouseScroll","mousewheel"];if(a.event.fixHooks)for(var c=b.length;c;)a.event.fixHooks[b[--c]]=a.event.mouseHooks;a.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=b.length;a;)this.addEventListener(b[--a],d,!1);else this.onmousewheel=d},teardown:function(){if(this.removeEventListener)for(var a=b.length;a;)this.removeEventListener(b[--a],d,!1);else this.onmousewheel=null}},a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})})(jQuery);

/**
 * 180degree Core module
 * 
 * This is a part of the 180� Framework
 * 
 * @author  Karine Do, Laurent Le Graverend
 * @license Copyright (c) 2011 Asiance (http://www.asiance.com), Licensed under the MIT License.
 * @updated 2012-01-03
 * @link    https://github.com/Asiance/180/
 * @version 3.1
 */
(function($){
	// Cache variables
	var $window = $(window),
		$body = $('body'),
		$menu = $('#menu'),
		$menunavlinks = $menu.find('a').not('.customlink, .slidepanel'),
		$header = $('body>header').first(),
		$container = $('#container'),
		$slides = $('.slide'),

		myScroll = null,
		snaptoPage = 0,

		timer_trackPage = null;

	// Detect browser
	if ($.browser.webkit) {
		scrollElement = 'body';
	} else {
		scrollElement = 'html';
	}
	
	// Has it been resized ? (for IE7)
	var resized = 0;

	// To determine container width
	var total_slides = $slides.length;
	
	// Main Object
	window._180 = {

		browser: {
			activePage: null,
			agent: navigator.userAgent.toLowerCase(),
			isMobile: false,
			isTablet: false
		},

		settings: null,

		// Start
		init: function(options) {
			var self = this;
			// Framework options defaults
			self.settings = $.extend({
				showHeader: true,
				headerPosition: 'top',
				menuPosition: 'top',
				menuHeight: 50,
				menuAlign: 'center',
				menuStyle: 'auto',
				menuSpacing: 10,
				sidePadding: 30,
				verticalScrolling: true,
				menuAnimation: true,
				mouseScroll: false,
				mobiles: 'iphone|ipod|mobile|blackberry|mini|windows\sce|palm',
				tablets: 'ipad|playbook|android|hp-tablet',
				tracker: function() {
					_gaq.push(['_trackPageview', '/' + self.browser.activePage]);
				},
				plugins: true,
				before180: $.noop,
				after180: $.noop,
				beforeslide: $.noop,
				afterslide: $.noop,
				portrait: $.noop,
				landscape: $.noop
			}, options);
			
			// Custom init function
			if ($.isFunction(self.settings.before180)) {
				self.settings.before180.call();
			}

			// Test devices
			self.browser.isMobile = new RegExp(self.settings.mobiles, 'i').test(self.browser.agent);
			self.browser.isTablet = new RegExp(self.settings.tablets, 'i').test(self.browser.agent);
			
			if (self.browser.isMobile || self.browser.isTablet) {
				if (self.browser.isMobile && self.browser.isTablet) {
					// Because Android phones user agent contains both "mobile" and "android"
					self.browser.isTablet = false;
				}
				window._180.Utils.include('./js/libs/iscroll.js');
			}

			// Avoid overlap if menu is set to fill and header is in the same position
			if (self.settings.showHeader === true && self.settings.menuStyle === 'fill' && self.settings.headerPosition === self.settings.menuPosition) {
				if (self.settings.headerPosition === 'top') {
					self.settings.menuPosition = 'bottom';
				} else if (self.settings.headerPosition === 'bottom') {
					self.settings.menuPosition = 'top';
				}
			}
			
			// Framework features for all
			$window.bind('load._180', function() {
				// Auto-load plugins?
				if (self.settings.plugins === true) {
					window._180.Plugins.caption();
					window._180.Plugins.hoverEffect();
					window._180.Plugins.slideshow();
					window._180.Plugins.collapsible();
					window._180.Plugins.lightbox();
					window._180.Plugins.scrollarea();
					// sliding panel
					if (!self.browser.isMobile && $('#slidingpanel').length) {
						$('#slidingpanel')._180_slidingpanel();
					}
				}
				// If it can read this, JS is enabled
				$('html').removeClass('no-js').addClass('js');
				
				// Reposition to the current slide
				$(scrollElement).animate({scrollLeft: window.innerWidth*($('div.slide').index($(document.location.hash)))}, 0);

				if ($.isFunction(self.settings.after180)) {
					self.settings.after180.call();
				}
			});

			// If hash, redefine the active page for tracking
			if (document.location.hash != '') {
				self.browser.activePage = $menu.find('a').filter('[href="' + document.location.hash + '"]').addClass('active').data('title');
			} else {
				// Obviously by default the first slide is the one active
				self.browser.activePage = $menunavlinks.filter(':first').addClass('active').data('title');
			}

			self.settings.tracker();
			
			// For portable devices
			if (self.browser.isMobile || self.browser.isTablet) {
				self.init_portable_devices();
			}
			// For browsers
			else {
				self.init_browsers();
			}
		},
		// For desktop browsers
		init_browsers: function() {
			var self = this;

			// Apply style and sizes
			self.style();
			self.sizes();
			
			// Menu and internal links behaviour
			self.menuLinks();
			
			// Framework options
			$window.bind('load._180', function() {
				if (self.settings.verticalScrolling === true) {
					// TODO, @Karine, check for removing
					//$slides.css('overflow','auto');
					$slides.not('.noscroll').wrapInner('<div class="scroll">');
					self.prettyScroll();
				} else if (self.settings.mouseScroll === true) {
					$(scrollElement).bind('mousewheel._180', function(event, delta) {
						if (delta > 0) {
							event.preventDefault();
							$('.active').prev().not('.customlink,.slidepanel').click();
						} else {
							event.preventDefault();
							$('.active').next().not('.customlink,.slidepanel').click();
						}
						return false;
					});
				}
			});
			
			// Actions on window resize
			$window.bind('resize._180', function() {
				self.sizes();
				self.reposition();
			});
			
			// Prevent Firefox from refreshing page on hashchange
			$window.bind('hashchange._180', function(event) {
				event.preventDefault();
				// TODO, we should find a way to detect if hash change is due to click or not
				// If not we should trigger the click on the relative menu
				var thisHashChangeHasBeenMadeManually = false;
				if (thisHashChangeHasBeenMadeManually) {
					// If the menu hash actually exists!
					if ($menunavlinks.index($('a[href="'+document.location.hash+'"]')) != -1) {
						// Trigger click on the menu link, pan!
						$('a[href="'+document.location.hash+'"]').trigger('click._180');
					}
				}
				return false;
			});
			
			// Keyboard nav
			$(document).on('keydown._180', self.keyboardNavigation);
		},
		// For portable devices
		init_portable_devices: function() {
			var self = this;

			if (self.browser.isMobile) {
				self.mobileStyle();
			}
			//TODO @Karine, I guess you can handle that with CSS mediaqueries
			if (self.browser.isTablet) {
				$body.addClass('tablet');
				self.style();
			} else {
				$body.addClass('mobile');
			}
			
			// Orientation ?
			self.detectOrientation();
			
			// To use iScroll
			$container.wrap('<div id="scroller" />');
			
			// Actions on load
			$window.bind('load._180', function() {
				if (self.browser.isMobile) {
					self.mobileSizes();
				} else {
					self.sizes();
				}
				self.mobileBase();

				if (self.settings.verticalScrolling === true) {
					//$slides.css('overflow','auto');
					$slides.not('.noscroll').wrapInner('<div class="scroll">');
					self.prettyScroll();
				}
	
			});
			
			// Actions on resize or orientation change
			$window.bind('resize._180', function() {
				self.detectOrientation();
				if (self.browser.isMobile) {
					self.mobileSizes();
				} else {
					self.sizes();
				}
				myScroll.refresh();
				// Reposition iScroll
				if (snaptoPage != 0) {
					myScroll.scrollToPage(snaptoPage, 0, 200);
				}
			});
			
			$body.bind('touchmove', function(event) {
				event.preventDefault();
			});
		},
		// Apply style options to browser
		style: function() {
			var self = this;
			$slides
				.css('padding-' + self.settings.menuPosition, '+=' + self.settings.menuHeight + 'px')
				.css({'padding-left': self.settings.sidePadding + 'px', 'padding-right': self.settings.sidePadding + 'px', 'padding-top': '+=' + self.settings.sidePadding + 'px', 'padding-bottom': '+=' + self.settings.sidePadding + 'px'});
		
			$menu
				.css(self.settings.menuPosition, '0px')
				.css('height', self.settings.menuHeight + 'px')
				.find('a').css('line-height', self.settings.menuHeight + 'px');
			
			// menu align
			if (self.settings.menuAlign === 'center') {
				$menu.css('text-align','center');
			} else if (self.settings.menuAlign === 'left') {
				$menu.css('text-align','left');
				if ($header.length && self.settings.showHeader === true) {
					$header.css('right', '0px');
				}
			} else if (self.settings.menuAlign === 'right') {
				$menu.css('text-align','right');
			}
			
			// menu style
			if (self.settings.menuStyle === 'fill') {
				$menu.find('a').css('width',(100/$menu.find('a').length) + '%');
			} else if (self.settings.menuStyle === 'auto') {
				$menu.find('a').css('padding-left', self.settings.menuSpacing + 'px').css('padding-right', self.settings.menuSpacing + 'px');
			}
			
			// header
			if ($header.length && self.settings.showHeader === false) {
				$header.hide();
			} else if ($header.length && self.settings.showHeader === true) {
				// If header and menu are on oposite sides
				if (self.settings.headerPosition != self.settings.menuPosition) {
					$slides
						.css('padding-' + self.settings.headerPosition, '+=' + self.settings.menuHeight + 'px');
				}
			
				$header
					.css(self.settings.headerPosition, '0px')
					.css('height', self.settings.menuHeight + 'px')
					.children()
					.css('line-height', self.settings.menuHeight + 'px')
					.bind('click._180', function() {
						$menunavlinks.filter(':first').click();
					});
			}
		},
		// Apply style options to mobile
		mobileStyle: function() {
			var self = this;
			$slides
				.css({'padding-left': self.settings.sidePadding/2 + 'px', 'padding-right': self.settings.sidePadding/2 + 'px', 'padding-top': '+=' + self.settings.sidePadding + 'px', 'padding-bottom': '+=' + self.settings.sidePadding/2 + 'px'});
			// TODO WTF Karine ? if true ?
			if ($header.length && (self.settings.showHeader === true || self.settings.showHeader === false)) {		
				$header
					.css('top', '0px')
					.css('height', self.settings.menuHeight/2 + 'px')
					.children()
					.css('line-height', self.settings.menuHeight/2 + 'px')
					.bind('click._180', function() {
						$menunavlinks.filter(':first').click();
					});
			}
		},
		// Flexible sizes
		sizes: function() {
			var self = this;
			
			var windowH = $window.height(),
				windowW = $window.width();
			
			// Dertermine sizes of slides with or without padding
			if (self.settings.showHeader === false || (self.settings.showHeader === true && self.settings.headerPosition === self.settings.menuPosition)) {
				paddingTB = windowH - self.settings.menuHeight - self.settings.sidePadding*2;
				nopaddingTB = windowH - self.settings.menuHeight;
			} else {
				paddingTB = windowH - self.settings.menuHeight*2 - self.settings.sidePadding*2;
				nopaddingTB = windowH - self.settings.menuHeight*2;
			}
			
			// Set overall container size
			$container.width((windowW * total_slides)).height(windowH);
			
			// IE7 fix, remove scrollbar height on first loading
			if (($.browser.msie && $.browser.version === 7) && (resized === 0)) {
				$container.height(windowH-18);
				$slides.not('.nopadding')
					.width((windowW - self.settings.sidePadding*2)).height((paddingTB - 18));
				if (self.settings.headerPosition === self.settings.menuPosition) {
					$('.nopadding')
						.attr('style', 'height:' + (nopaddingTB-18) + 'px; width:' + windowW + 'px; padding-' + self.settings.menuPosition + ':' + self.settings.menuHeight + 'px !important');
				} else {
					$('.nopadding')
						.attr('style', 'height:' + (nopaddingTB-18) + 'px; width:' + windowW + 'px; padding-' + self.settings.menuPosition + ':' + self.settings.menuHeight + 'px !important; padding-' + self.settings.headerPosition + ':' + self.settings.menuHeight + 'px !important;');
				}
				resized = 1;
			} else {
			// Good people not using IE7
				$slides.not('.nopadding')
					.width((windowW - self.settings.sidePadding*2)).height((paddingTB));
				if (self.settings.showHeader === true && self.settings.headerPosition === self.settings.menuPosition) {
					$('.nopadding')
						.attr('style', 'height:' + nopaddingTB + 'px; width:' + windowW + 'px; padding-' + self.settings.menuPosition + ':' + self.settings.menuHeight + 'px !important');
				} else {
					$('.nopadding')
						.attr('style', 'height:' + nopaddingTB + 'px; width:' + windowW + 'px; padding-' + self.settings.menuPosition + ':' + self.settings.menuHeight + 'px !important; padding-' + self.settings.headerPosition + ':' + self.settings.menuHeight + 'px !important;');
				}
				// For tablets
				if (self.browser.isTablet) {
					$slides.not('.nopadding').find('.verticalscroller').height(paddingTB);
					$('.nopadding').find('.verticalscroller').height(nopaddingTB);			
				}
			}
			// Recalculate magic menu size
			if (self.settings.menuAnimation === true) {
				self.menuAnimation();
			}
		},
		// Flexible sizes for mobile
		mobileSizes: function() {
			var self = this;
			
			var windowH = $window.height(),
				windowW = $window.width();
			
			// Dertermine sizes of slides with or without padding
			if (self.settings.showHeader === false || (self.settings.showHeader === true && self.settings.headerPosition === self.settings.menuPosition)) {
				paddingTB = windowH - self.settings.menuHeight - self.settings.sidePadding*2;
				nopaddingTB = windowH - self.settings.menuHeight;
			} else {
				paddingTB = windowH - self.settings.menuHeight*2 - self.settings.sidePadding*2;
				nopaddingTB = windowH - self.settings.menuHeight*2;
			}
			
			// Set overall container size
			$container.width((windowW * total_slides)).height(windowH);
			
			// For mobiles
			$slides.not('.nopadding')
				.width((windowW - self.settings.sidePadding)).height(windowH - self.settings.sidePadding*1.5 + 70);
			$('.nopadding')
				.attr('style', 'height:' + (windowH - self.settings.menuHeight + 70) + 'px; width:' + windowW + 'px; padding-top:' + self.settings.menuHeight + 'px !important;');
			$('.verticalscroller').height((windowH - self.settings.menuHeight + 70));
			
			setTimeout(function() {
				window.scrollTo(0,1);
			}, 100);
			
		},
		// Reposition if hash is used in URL (Browsers only)
		reposition: function() {
			if (document.location.hash != '') {
				this.scrollSlide(document.location.hash);
				$('.active').removeClass('active');
				$menunavlinks.filter('[href=' + document.location.hash + ']').addClass('active');
			}
		},
		// Animate menu and internal links + track page views
		menuLinks: function() {
			var self = this;
			$menunavlinks.bind('click._180', function(event){				
				event.preventDefault();
				var $this = $(this);
				// Scroll and make active
				self.scrollSlide($this.attr('href'));
				$('.active').removeClass('active');
				$this.addClass('active');
				self.browser.activePage = $(this).data('title');
				// Track pageview
				clearTimeout(timer_trackPage);
				timer_trackPage = setTimeout(self.settings.tracker, 2500);
				// Animate menu if needed
				if (self.settings.menuAnimation === true) {
					var $magicLine = $('#magic');
					leftPos = $this.position().left;
					newWidth = $this.outerWidth(true);
					$magicLine
						.data('origLeft', leftPos)
						.data('origWidth', newWidth);
					$magicLine.stop().animate({
						left: leftPos,
						width: newWidth
					});
				}
				return false;
			});
			// Other internal links
			$('a:not(#menu a, a[href="#"])').filter('[href^="#"]').bind('click._180', function(event) {
				var anchor = $(this).attr('href');
				if ($menu.find('a[href="'+ anchor +'"]').length) {
					event.preventDefault();
					$menu.find('a[href="'+ anchor +'"]').click();
				}
			});
			$('a[href="#"]').bind('click._180', function(event) {
				event.preventDefault();
			});
		},
		// Animate the menu
		menuAnimation: function() {
			var self = this;
			
			var $el, leftPos, newWidth;
			if (!$('#magic').length) {
				$menu.append('<span id="magic"></span>');
			}
			var $magicLine = $('#magic');
			
			$window.bind('load._180', function() {
				$magicLine
					.width($('.active').outerWidth(true))
					.height(self.settings.menuHeight)
					.css('left', $('.active').position().left)
					.data('origLeft', $magicLine.position().left)
					.data('origWidth', $magicLine.width());
			});
			
			$magicLine
				.css('left', $('.active').position().left)
				.data('origLeft', $magicLine.position().left)
				.data('origWidth', $magicLine.width());
			
			$menunavlinks.hover(function() {
				$el = $(this);
				leftPos = $el.position().left;
				newWidth = $el.outerWidth(true);
				$magicLine.stop().animate({
					left: leftPos,
					width: newWidth
				});
			}, function() {
				$magicLine.stop().animate({
					left: $magicLine.data('origLeft'),
					width: $magicLine.data('origWidth')
				});
			});
		},
		// Use pretty scrollbars for non-webkit browsers
		prettyScroll: function() {
			$('.scroll').each(function(){
				$(this).jScrollPane({
					showArrows: false
				});
				var api = $(this).data('jsp');
				var throttleTimeout = null;
				$window.bind('resize._180', function() {
					if ($.browser.msie) {
						if (throttleTimeout === null) {
							throttleTimeout = setTimeout(function() {
								api.reinitialise();
								throttleTimeout = null;
							}, 50);
						}
					} else {
						api.reinitialise();
					}
				});
			});
		},
		// Detect devices orientation
		detectOrientation: function() {
			var self = this;
			if (window.innerHeight > window.innerWidth) {
				$body.addClass('portrait').removeClass('landscape');
				if ($.isFunction(self.settings.portrait)) {
					self.settings.portrait.call();
				}
			} else if (window.innerHeight< window.innerWidth) {
				$body.removeClass('portrait').addClass('landscape');
				if ($.isFunction(self.settings.landscape)) {
					self.settings.landscape.call();
				}
			}
		},
		// Navigation by LR arrows
		keyboardNavigation: function(event) {
			if (event.which === 37) {
				event.preventDefault();
				$('.active').prev().not('.customlink,.slidepanel').click();
			} else if (event.which === 39) {
				event.preventDefault();
				$('.active').next().not('.customlink,.slidepanel').click();
			}
		},
		// Animate scrolling
		scrollSlide: function(page) {
			// do something before?
			var self = this;
			if ($.isFunction(self.settings.beforeslide)) {
				self.settings.beforeslide.call(this, page, self.getScrollDirection(page));
			}

			$(scrollElement).stop(true, true).animate({scrollLeft: $(page).offset().left}, 1000, function() {
				document.location.hash = page;
				// do something after?
				if ($.isFunction(self.settings.afterslide)) {
					self.settings.afterslide.call(this, page, self.getScrollDirection(page));
				}
			});
		},
		// Return the direction where the slides scroll to
		getScrollDirection: function(page) {
			var self = this;
			var j = self.getSlideNumber(page) - self.getSlideNumber(document.location.hash);
			if (j == 0) {
				return direction = 'none';
			} else if (j > 0) {
				return direction = 'right';
			} else {
				return direction = 'left';
			}
		},
		// Return the number of the slide
		getSlideNumber: function(page) {
			return $('div.slide').index($(page)) + 1;
		},
		mobileBase: function() {
			var self = this;
			// init iScroll
			myScroll = new iScroll('scroller', {
				hScrollbar: false,
				vScrollbar: false,
				vScroll: false,
				snap: '.slide',
				snapThreshold: 80,
				momentum: false,
				bounce: false,
				lockDirection: true,
				useTransition: true,
				onScrollEnd: function() {
					$('.active').removeClass('active');
					self.browser.activePage = $('#menu a:nth-child(' + (this.currPageX + 1) + ')').data('title');
					$('#menu a:nth-child(' + (this.currPageX + 1) + ')').addClass('active');
					snaptoPage = (this.currPageX);
					// Track pageview
					clearTimeout(timer_trackPage);
					timer_trackPage = setTimeout(self.settings.tracker, 2000);
					if (self.settings.menuAnimation === true) {
						var $magicLine = $('#magic');
						$magic = $('#menu a:nth-child(' + (this.currPageX + 1) + ')');
						leftPos = $magic.position().left;
						newWidth = $magic.outerWidth(true);
						$magicLine
							.data('origLeft', leftPos)
							.data('origWidth', newWidth);
						$magicLine.stop().animate({
							left: leftPos,
							width: newWidth
						});
					}
				}
			});
			$menunavlinks.bind('click._180', function(event){				
				event.preventDefault();
				var pagenumber = $(this).index();
				myScroll.scrollToPage(pagenumber, 0, 1000);
			});
			// TODO internal links iPad
		},
		mobileVertScroll: function() {
			var myScrolls = [];
			var wrappers = $('.verticalscroller');
			
			for (var i=0; i<wrappers.length; i++) {
				myScrolls[myScrolls.length] = new iScroll(wrappers[i], {
					checkDOMChanges: true,
					hScrollbar: false,
					vScrollbar: true,
					hScroll: false,
					bounce: false,
					lockDirection: true,
					hideScrollbar: false
				});
			}
		}
	};
	
	// Plugins
	window._180.Plugins = {
		collapsible: function() {
			$('.collapsible')._180_collapsible();
		},
		hoverEffect: function() {
			$('.hovereffect').each(function() {
				$(this)._180_hover();
			});
		},
		lightbox: function() {
			$('.lightbox')._180_lightbox();
		},
		slideshow: function() {
			$('.slider').each(function() {
				$(this)._180_slideshow();
			});
		},
		caption: function() {
			$('.caption').each(function() {
				$(this)._180_caption();
			});
		},
		scrollarea: function() {
			$('.scrollarea').each(function() {
				$(this)._180_scrollarea();
			});
		}
	};
	
	window._180.Utils = {
		include: function(src, attributes) {
			try {
				attributes = attributes || {};
				attributes.type = "text/javascript";
				attributes.src = src;

				var script = document.createElement("script");
				for(aName in attributes)
					script[aName] = attributes[aName];

				document.getElementsByTagName("body")[0].appendChild(script);
				return true;
			} catch(e) { return false; }
		}
	};

	"180� JQuery Framework by Karine Do & Laurent Le Graverend";
})(jQuery);

/**
 * 180� Collapsible plugin
 * 
 * This is a part of the 180� Framework
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
			$(this).children('div').hide().end().find('h2').css('cursor', 'pointer');

			$(this).each(function() {
				$(this).find('h2:first').addClass('opened').next().show();
			});

			$(this).find('h2').bind('click._180 touchstart._180',
				function() {
					if ($(this).next().is(':hidden')) {
						$(this).parent('.collapsible').find('h2')
								.removeClass('opened').next().slideUp();
						$(this).toggleClass('opened').next().slideDown();
					} else if ($(this).hasClass('opened')
							&& $(this).next().is(':visible')) {
						$(this).removeClass('opened').next().slideUp();
					}
					return false;
				});
		}
	};

	$.fn._180_collapsible = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist');
		}
	};
})(jQuery);

/**
 * 180� Hover plugin
 * 
 * This is a part of the 180� Framework
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

/**
 * 180� Lightbox plugin
 * 
 * This is a part of the 180� Framework
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

/**
 * 180� Slideshow plugin
 * 
 * This is a part of the 180� Framework
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

;(function ($) {

  window.Laurent = {

    initialize: function () {

      var self = this;

      window._180.init({
        headerPosition: 'top',
        menuHeight: 60,
        portrait: function () {
          alert('To view the website correctly, please hold your device in landscape mode!');
        },
        plugins: false,
        verticalScrolling: false,
        beforeslide: self.check_slide,
        before180: function () {
          self.check_slide(document.location.hash);
        },
        after180: function () {
          window.Laurent.About.load_instagram();
          window.Laurent.Portfolio.resize_timeline();
          window.Laurent.Travel.resize_map();
        }
      });

      $(window).resize(function () {
        if ($(window).width() < 900 || $(window).height() < 500) {
          if ($('html').attr('class').indexOf('small') == -1) {
            $('html').addClass('small');
            $(document.body).append('<div id="lazy"><h2>Sorry... I am lazy.</h2><p>I didn\'t handle your screen resolution.</br>Please increase your size.</p></div>');
          }
        } else {
          $('html').removeClass('small');
          $('#lazy').remove();
        }
      });
    },

    check_slide: function (page, direction) {
      switch (page) {
      case "#about":
        if (window.Laurent.About.loaded === false) {
          window.Laurent.About.initialize();
        }
        break;
      case "#portfolio":
        if (window.Laurent.Portfolio.loaded === false) {
          window.Laurent.Portfolio.initialize();
        }
        break;
      case "#travels":
        if (window.Laurent.Travel.loaded === false) {
          window.Laurent.Travel.initialize();
        }
        break;
      default:
        document.location.hash = "#about";
        if (window.Laurent.About.loaded === false) {
          window.Laurent.About.initialize();
        }
        break;
      }
    }
  };

  window.Laurent.About = {

    loaded: false,
    chart_life: null,
    chart_skills: null,

    initialize: function () {
      var self = this;

      self.draw_chart_of_my_life();
      self.draw_chart_of_my_skills();

      $('#born_since').html(window.Laurent.Utils.days_between(new Date(1986, 2, 17), new Date()));

      $.ajax({
        url: "https://graph.facebook.com/",
        data: {
          id: "http://www.legraverend.fr"
        },
        success: function (data) {
          $('#nb_like').text(data.shares);
        },
        dataType: "json"
      });

      $('aside .slider').first()._180_slideshow({
        paginate: false,
        loop: false,
        prev: "",
        next: ""
      });

      self.loaded = true;
    },

    load_instagram: function () {
      var feed = new google.feeds.Feed("http://followgram.me/laurentlg/rss");
      feed.setNumEntries(10);
      feed.load(function (result) {
        if (!result.error) {
          var $instagram = $("#instagram");
          var $container = $instagram.find("ul").first();
          for (var i = 0; i < result.feed.entries.length; i++) {
            var entry = result.feed.entries[i];
            var title = entry.title;
            if (title === '') {
              title = 'Unknown title';
            }
            var li = $('<li><div class="hovereffect"><div class="hovertext"><h3>' + title + '</h3><p>Picture taken on ' + entry.publishedDate + '</p></div></div></li>').appendTo($container);
            var image = $(entry.content);
            $(image).attr('width', '612');
            $(image).attr('height', '612');
            $(image).height('612');
            $(image).width('612');

            image.insertBefore(li.find('.hovertext'));

            li.find('.hovereffect')._180_hover();
          }

          // Create the slider
          var div = $instagram.children().first('div');
          div._180_slideshow({
            sliderPagination: false,
            sliderTextPrev: "",
            sliderTextNext: ""
          });

          // Create the lightbox
          $('a.instagram').first()._180_lightbox();
        }
      });
    },

    draw_chart_of_my_life: function () {

      var self = this;

      var $chart = $('#chart_my_life');
      var $table = $chart.next();
      // Get the data
      // Create the data table.
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Task');
      data.addColumn('number', 'Hours per year');

      $table.find('th').each(function (index) {
        data.addRow([$(this).text(), parseInt($($table.find('td')[index]).text())]);
      });

      // Set chart options
      var options = {
        //'title' : 'How Much Pizza I Ate Last Night',
        'width': Math.floor((window.outerWidth - 60) * 0.38),
        'height': 280
      };

      // Instantiate and draw our chart, passing in some options.
      self.chart_life = new google.visualization.PieChart(document.getElementById('chart_my_life'));
      self.chart_life.draw(data, options);

      // aaaargg
      /*var chartArea = $chart.children().contents().find('#chartArea');
            var div = $chart.children().contents().find('#chartArea').next();
            chartArea.appendTo($chart);
            div.appendTo($chart);
            $chart.find('iframe').remove();*/
    },

    draw_chart_of_my_skills: function () {

      var self = this;

      var $chart = $('#chart_my_skills');
      var $table = $chart.next();
      // Get the data
      // Create the data table.
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Programming Languages');
      data.addColumn('number', 'Skills');

      $table.find('th').each(function (index) {
        data.addRow([$(this).text(), parseInt($($table.find('td')[index]).text())]);
      });

      // Set chart options
      var options = {
        'width': Math.floor((window.outerWidth - 60) * 0.38),
        'height': 280,
        'legend': 'none'
      };

      // Instantiate and draw our chart, passing in some options.
      self.chart_skills = new google.visualization.BarChart(document.getElementById('chart_my_skills'));
      self.chart_skills.draw(data, options);

      // aaaargg
      /*var chartArea = $chart.children().contents().find('#chartArea');
            var div = $chart.children().contents().find('#chartArea').next();
            chartArea.appendTo($chart);
            div.appendTo($chart);
            $chart.find('iframe').remove();*/
    }
  };

  window.Laurent.Portfolio = {

    loaded: false,

    initialize: function () {
      var self = this;
      self.initialize_timeline();
      self.loaded = true;
    },
    
    initialize_timeline: function () {
      var self = this;
      createStoryJS({
        type:         'timeline',
        width:        "100%",
        height:       "100%",
        debug:        true,
        font:         "DroidSerif-DroidSans",
        start_at_end: true,
        source:       './js/portfolio.jsonp',
        js:           './js/libs/timeline-min.js'
      });
    },
    
    resize_timeline: function () {
      var self = this;
      
    }
  };

  window.Laurent.Travel = {

    loaded: false,
    map: null,
    info_windows: [],

    initialize: function () {
      this.initialize_map();
      this.loaded = true;
    },
    initialize_map: function () {

      var myOptions = {
        center: new google.maps.LatLng(36.738884, 1.0546880),
        navigationControlOptions: {
          style: google.maps.NavigationControlStyle.SMALL
        },
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 3
      };
      this.map = new google.maps.Map(document.getElementById('map'), myOptions);

      this.add_all_markers();
    },
    add_all_markers: function () {
      var self = this;
      //var bounds = new google.maps.LatLngBounds();
      $('.map-location').each(function (index) {
        var location = this;
        var info_window = new google.maps.InfoWindow({
          content: $(location).html(),
          maxWidth: 500
        });
        self.info_windows.push(info_window);
        var lat = $(location).find('meta[itemprop="latitude"]').attr("content");
        var lng = $(location).find('meta[itemprop="longitude"]').attr("content");
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, lng),
          map: self.map,
          icon: "./images/icons/travel.png"
        });
        google.maps.event.addListener(marker, "click", function () {
          $.each(window.Laurent.Travel.info_windows, function (index, iwindow) {
            if (info_window != iwindow) {
              iwindow.close();
            }
          });
          info_window.open(self.map, marker);
        });
        //var ll = new google.maps.LatLng(lat, lng);
        //bounds.extend(ll);
      });
      //self.map.fitBounds(bounds);
    },
    resize_map: function () {
      var self = this;
      if (self.loaded != false) {
        google.maps.event.trigger(self.map, "resize");
		self.map.setCenter(new google.maps.LatLng(36.738884, 1.0546880))
      }
    },
  };

  window.Laurent.Utils = {
    days_between: function (date1, date2) {
      var DSTAdjust = 0;
      // constants used for our calculations below
      oneMinute = 1000 * 60;
      var oneDay = oneMinute * 60 * 24;
      // equalize times in case date objects have them
      date1.setHours(0);
      date1.setMinutes(0);
      date1.setSeconds(0);
      date2.setHours(0);
      date2.setMinutes(0);
      date2.setSeconds(0);
      // take care of spans across Daylight Saving Time changes
      if (date2 > date1) {
        DSTAdjust = (date2.getTimezoneOffset() - date1.getTimezoneOffset()) * oneMinute;
      } else {
        DSTAdjust = (date1.getTimezoneOffset() - date2.getTimezoneOffset()) * oneMinute;
      }
      var diff = Math.abs(date2.getTime() - date1.getTime()) - DSTAdjust;
      return Math.ceil(diff / oneDay);
    }
  };

  "Laurent Le Graverend.";
})(jQuery);