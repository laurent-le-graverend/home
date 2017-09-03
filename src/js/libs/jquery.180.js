/**
 * 180° Core module
 * 
 * This is a part of the 180° Framework
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

	"180° JQuery Framework by Karine Do & Laurent Le Graverend";
})(jQuery);