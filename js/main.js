// Generated by CoffeeScript 1.3.3
var $steps, Router, active_step, get_step_index_pos, mtween, navigate_to_step, router, scroll_active, scroll_to, steps_pos, total, tween, _height, _margin, _time, _width;

_width = 780;

_height = 370;

_margin = 40;

_time = 0.7;

$steps = null;

total = null;

steps_pos = [];

active_step = null;

tween = null;

mtween = null;

router = null;

scroll_active = true;

scroll_to = function(pos, callback) {
  var options;
  scroll_active = false;
  if (tween) {
    tween.kill();
  }
  options = {
    scrollTo: {
      x: pos - ($(window).width() / 2),
      y: 0
    },
    onComplete: function() {
      scroll_active = true;
      if (callback != null) {
        return callback();
      }
    }
  };
  return tween = TweenMax.to(window, 1, options);
};

get_step_index_pos = function(index) {
  return $steps.eq(index).offset().left + _width / 2;
};

Router = Backbone.Router.extend({
  step: function(index, callback) {
    if (index == null) {
      index = 1;
    }
    $.colorbox.close();
    index = parseInt(index) - 1;
    scroll_to(get_step_index_pos(index), callback);
    return false;
  },
  modal: function(index) {
    var cb;
    if (index == null) {
      index = 1;
    }
    index = parseInt(index);
    cb = function() {
      $.colorbox({
        html: $('#steps').find('.step').eq(index - 1)[0].outerHTML,
        onClosed: function() {
          if (scroll_active) {
            return navigate_to_step(index - 1, {
              trigger: false,
              replace: true
            });
          }
        }
      });
      return $('#cboxLoadedContent').css({
        backgroundColor: index % 2 === 0 ? '#d52b1a' : '#eb4f13'
      });
    };
    if ((active_step != null) && active_step === (index - 1)) {
      return cb();
    } else {
      return this.step(index, cb);
    }
  },
  routes: {
    '': 'step',
    'lesa': 'modal',
    's:index': 'step',
    's:index/lesa': 'modal'
  }
});

navigate_to_step = function(index, options) {
  if (options == null) {
    options = {
      trigger: true,
      replace: true
    };
  }
  index = parseInt(index) + 1;
  if (index === 1) {
    return router.navigate('', options);
  } else {
    return router.navigate('s' + index, options);
  }
};

$(function() {
  var get_margin_top;
  $steps = $('#steps').find('.step');
  total = $steps.size();
  $('#steps').find('.lesa-meira').on('click', function(event) {
    var href;
    event.preventDefault();
    href = $(this).attr('href');
    router.navigate(href, {
      trigger: true
    });
    return false;
  });
  $(window).resize(function() {
    var pos;
    pos = $('#steps-wrapper').offset().left;
    $('#steps').css('padding-right', pos);
    steps_pos.splice(0, steps_pos.length);
    $steps.each(function(index) {
      return steps_pos.push($(this).offset().left);
    });
    return steps_pos.reverse();
  }).resize();
  $steps.each(function(index) {
    TweenMax.to($(this), _time, {
      marginTop: (total - index) * _margin
    });
    return $(this).find('.shadow').animate({
      borderWidth: _margin / 2
    }, _time * 1000);
  });
  $(window).on('mousewheel', function(event, delta) {
    var pos;
    event.preventDefault();
    if (!scroll_active) {
      return false;
    }
    if (tween) {
      tween.kill();
    }
    pos = $(this).scrollLeft() - (delta * 30);
    $(this).scrollLeft(pos);
    return false;
  });
  get_margin_top = function(i) {
    return -(i * _margin) + (($(window).height() / 2) - (_height / 2));
  };
  router = new Router();
  Backbone.history.start({
    pushState: true,
    hashChange: true
  });
  $(window).scroll(function(event) {
    var $step, i, mid, spos, _i, _len, _results;
    mid = $(this).scrollLeft() + ($(window).width() / 2);
    _results = [];
    for (i = _i = 0, _len = steps_pos.length; _i < _len; i = ++_i) {
      spos = steps_pos[i];
      if (Math.floor(spos) <= Math.floor(mid)) {
        active_step = steps_pos.length - i - 1;
        $steps.removeClass('active');
        $step = $steps.eq(active_step);
        $step.addClass('active');
        if (mtween) {
          mtween.kill();
        }
        mtween = TweenMax.to($('#steps'), 0.3, {
          marginTop: get_margin_top(i + 1)
        });
        if (scroll_active) {
          navigate_to_step(active_step, {
            trigger: false,
            replace: true
          });
        }
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  }).scroll();
  $('.step').on('click', function(e) {
    return navigate_to_step($(this).index());
  });
  $('#menu').find('ul li').on('click', function(e) {
    return navigate_to_step($(this).index());
  });
  return $(document).on('keydown', function(event) {
    var arrow, index, keyCode;
    keyCode = event.keyCode || event.which;
    arrow = {
      left: 37,
      up: 38,
      right: 39,
      down: 40
    };
    switch (keyCode) {
      case arrow.up:
      case arrow.left:
        index = active_step - 1;
        if (index >= 0) {
          navigate_to_step(index);
        }
        return event.preventDefault();
      case arrow.down:
      case arrow.right:
        index = active_step + 1;
        if (index < total) {
          navigate_to_step(index);
        }
        return event.preventDefault();
    }
  });
});
