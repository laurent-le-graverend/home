$('#salut').each() 

(function ($) {

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
      $slideshow = $('.carrousel').first();

      $('.carrousel>ol>li').hover(

      function () {
        $(this).find('article').stop(true, true).fadeIn('slow');
      }, function () {
        $(this).find('article').stop(true, true).fadeOut('fast');
      });

      var $carrousel = $($slideshow);
      var slider_width = parseInt($carrousel.attr('data-slider-width'));
      var slider_height = parseInt($carrousel.attr('data-slider-height'));
      var total = parseInt($carrousel.find('li').length);
      var distance = 10;
      var distanceH = 10;

      // Preload the current, next and previous pictures
      self.replace_picture($carrousel.find('ol:first>li:nth-child(1)>img').first());
      self.replace_picture($carrousel.find('ol:first>li:nth-child(2)>img').first());
      self.replace_picture($carrousel.find('ol:first>li:last>img').first());

      $carrousel.append('<div class="buttons"><a href="#" class="prev">&darr;</a><a href="#" class="next">&uarr;</a></div>');

      $carrousel.width((slider_width)).height((slider_height + total * distance));
      $carrousel.find('ol:first').width((slider_width)).height((slider_height));

      $carrousel.find('ol:first>li').each(function () {
        $(this).css({
          'left': (slider_width - (slider_width * (1 - ($(this).index() / 10)))) / 2 + $(this).index() * distanceH + 'px',
          'bottom': $(this).index() * distance + 'px',
          'width': slider_width / (1 - (-$(this).index() / 10)),
          'height': slider_height / (1 - (-$(this).index() / 10)),
          'z-index': '-' + $(this).index(),
          'opacity': (1 - ($(this).index() / 10))
        });
      });

      $carrousel.find('.next').click(function () {

        // Preload the next picture
        self.replace_picture($carrousel.find('ol:first>li:nth-child(3)>img').first());

        $carrousel.find('ol:first>li:first').stop(true).animate({
          'left': '-=' + (((($(window).width() * 0.8) - slider_width) / 2)) + 'px',
          'bottom': '-' + $(window).height() + 'px',
          'width': ($(window).width() * 0.8),
          'height': $(window).height(),
          'opacity': 0
        }, 'slow').appendTo($('.carrousel').find('ol:first'));
        $carrousel.find('ol:first>li').each(function () {
          $(this).animate({
            'left': (slider_width - (slider_width * (1 - ($(this).index() / 10)))) / 2 + $(this).index() * distanceH + 'px',
            'bottom': $(this).index() * distance + 'px',
            'width': slider_width / (1 - (-$(this).index() / 10)),
            'height': slider_height / (1 - (-$(this).index() / 10)),
            'opacity': (1 - ($(this).index() / 10))
          }, 'slow', function () {
            $(this).css({
              'z-index': '-' + $(this).index()
            });
          });
        });
        $carrousel.find('ol:first>li:last').fadeIn('slow');
        return false;
      });

      $carrousel.find('.prev').click(function () {
        $carrousel.find('ol:first>li:last').stop(true).animate({
          'opacity': 0
        }).animate({
          'left': '-=' + $(window).width() * 0.8 / 2 + 'px',
          'bottom': '-' + $(window).height() + 'px',
          'width': ($(window).width() * 0.8),
          'height': $(window).height()
        }, 'fast').prependTo($('.carrousel').find('ol:first')).animate({
          'z-index': 0
        }, 'slow');
        $carrousel.find('ol:first>li').each(function () {
          $(this).stop(true).animate({
            'left': (slider_width - (slider_width * (1 - ($(this).index() / 10)))) / 2 + $(this).index() * distanceH + 'px',
            'bottom': $(this).index() * distance + 'px',
            'width': slider_width / (1 - (-$(this).index() / 10)),
            'height': slider_height / (1 - (-$(this).index() / 10)),
            'opacity': (1 - ($(this).index() / 10))
          }, 'fast', function () {
            $(this).css({
              'z-index': '-' + $(this).index()
            });
          });
        });

        // Preload the previous picture
        self.replace_picture($carrousel.find('ol:first>li:last>img').first());
        return false;
      });

      self.bind_keydown_navigation();
      self.loaded = true;
    },

    bind_keydown_navigation: function () {
      $(document).bind('keydown', function (event) {
        if (window._180.browser.activePage === 'portfolio') {
          if (event.which == 40) {
            $('#portfolio a.prev').trigger('click');
          } else if (event.which == 38) {
            $('#portfolio a.next').trigger('click');
          }
        }
      });
      $(document).bind('mousewheel', function (event, delta) {
        if (window._180.browser.activePage === 'portfolio') {
          if (delta === -1) {
            $('#portfolio a.prev').trigger('click');
          } else if (delta == 1) {
            $('#portfolio a.next').trigger('click');
          }
        }
      });
    },

    // To win some time for loading...
    replace_picture: function (img) {
      var src = $(img).attr('src');
      src = src.replace('_LQ', '');
      $(img).attr('src', src);
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