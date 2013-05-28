_width = 300
_height = 300
_margin = 40
_time = 0.7

$steps = null
total = null
steps_pos = []
active_step = null
tween = null
mtween = null
router = null
scroll_active = true


scroll_to = (pos, callback) ->
# Stop tween if in action:
    scroll_active = false
    if tween
        tween.kill()
    
    options =
        scrollTo:
            x: pos - ($(window).width() / 2)
            y: 0

        onComplete: ->
            scroll_active = true
            if callback?
                callback()

    tween = TweenMax.to(window, 1, options)

get_step_index_pos = (index) ->
    $steps.eq(index).offset().left + _width / 2

Router = Backbone.Router.extend
    routes:
        '': ->
            scroll_to(get_step_index_pos(0))
            return false

        's:index': (index) ->
            index = parseInt(index) - 1
            scroll_to(get_step_index_pos(index))
            return false

navigate_to_step = (index, options={trigger:true, replace:true}) ->
    index = parseInt(index) + 1
    if index == 1
        router.navigate('', options)
    else
        router.navigate('s' + index, options)


$ ->    
    $steps = $('#steps').find('.step')
    total = $steps.size()
    
    # Breating room on the right side:
    $(window).resize ->
        pos = $('#steps-wrapper').offset().left
        $('#steps').css('padding-right', pos)
        
        steps_pos.splice(0, steps_pos.length);
        $steps.each (index) ->
            steps_pos.push($(this).offset().left)
        steps_pos.reverse()
    .resize()

    # Position steps:
    $steps.each (index) ->
        TweenMax.to $(this), _time,
            marginTop: (total - index) * _margin
        
        # Using jquery here because of a weird firefox bug:
        $(this).find('.shadow').animate
            borderWidth: _margin / 2
        , _time * 1000
    
    # Mouse wheel:
    $(window).on 'mousewheel', (event, delta) ->
        event.preventDefault()
        if not scroll_active
            return false
        # Stop tween if in action:
        if tween
            tween.kill()
        
        pos = $(this).scrollLeft() - (delta * 30)
        $(this).scrollLeft(pos)
        
        return false
    
    get_margin_top = (i) ->
        -(i * _margin) + (($(window).height() / 2) - (_height / 2))
    
    router = new Router()

    Backbone.history.start
        pushState: true
        hashChange: true

    $(window).scroll (event) ->
        mid = $(this).scrollLeft() + ($(window).width() / 2)
        
        for spos, i in steps_pos
            if Math.floor(spos) <= Math.floor(mid)
                active_step = steps_pos.length - i - 1
                $steps.removeClass('active')
                $step = $steps.eq(active_step)
                $step.addClass('active')
                
                if mtween
                    mtween.kill()
                
                mtween = TweenMax.to $('#steps'), 0.3,
                    marginTop: get_margin_top(i + 1)
                
                if scroll_active
                    navigate_to_step(active_step, {trigger:false, replace:true})
                
                break

    .scroll()

  
    $('.step').on 'click', (e) ->
        navigate_to_step($(this).index())
    

    $('#menu').find('ul li').on 'click', (e) ->
        navigate_to_step($(this).index())
    

    $(document).on 'keydown', (event) ->
        keyCode = event.keyCode or event.which
        arrow = {left: 37, up: 38, right: 39, down: 40}

        switch keyCode
            when arrow.up, arrow.left
                index = active_step - 1
                if index >= 0
                    navigate_to_step(index)
                    
                event.preventDefault()

            when arrow.down, arrow.right
                index = active_step + 1
                if index < total
                    navigate_to_step(index)
                    
                event.preventDefault()