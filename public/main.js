class Tools{
	static makeID(n){ // generate random base64 string
		var out = "";
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

		for (var i = 0; i < n; i++)
			out += chars.charAt(Math.floor(Math.random() * chars.length));

		return out;
	}
}

var Templates = {
	Prompt: function(data){
		this.id = Tools.makeID(4)

		this.header = data.header
		this.content = data.content
		this.footer = data.footer

		this.onSubmit = data.onSubmit

		this.$elem = undefined

		this.add = function(){

			if(this.$elem) return
			$("body").append(
				$("<div></div>")
					.addClass("promptWrapper")
					.append(
						this.$elem = $("<div></div>")
							.addClass("hiddenTop")
							.addClass("prompt")
							.prop("id", this.id)
							.append(
								$("<div></div>")
									.addClass('promptHeader')
									.append(this.header)
							)
							.append(
								$("<div></div>")
									.addClass('promptContent')
									.append(this.content)
							)
							.append(
								$("<div></div>")
									.addClass('promptFooter')
									.append(this.footer)
							)
							.data("self", this)
					)
					.append(
						this.$dimm = $("<div></div>")
							.addClass('dimm')
					)
					.data("self", this)
			)

			this.$elem.ready(
				(function(prompt){
				    return function(){
				        prompt.show()
				    }
				})(this)
			)
			this.$elem.on("click", "button[type=submit]", this.submit)
			this.$dimm.click(this.submit)

			return this

		}

		this.show = function(){

			this.$elem.removeClass("hiddenTop")
			this.$elem.siblings(".dimm").removeClass("dimmhide")

			return this

		}

		this.hide = function(){

			this.$elem.addClass("hiddenTop")
			this.$elem.siblings(".dimm").addClass("dimmhide")

			return this

		}

		this.remove = function(){

			this.$elem.parent().remove()

			return this

		}

		this.submit = function(e){

			var prompt = $(this).closest(".promptWrapper").data("self")
			prompt.onSubmit({
				$elem: prompt.$elem, // whole prompt element
				$trigger: $(this) // submit button that triggered closing
			})
			prompt.hide()

			return this

		}

	},
	windows: {
		prompttest: {
			content: $("<button></button>")
				.click(function(){new Templates.Prompt({header: "Nagłówek", content:"<span>Zgadzam sie na przestrzeganie zasad regulaminu którego jeszcze nie napisałem<input id='ok' type='checkbox'/></span>", footer:"<button>test</button>", onSubmit: function(e){console.log(e.$elem.find("input#ok").prop("checked"))}}).add()})
				.append("Prompt")
				.append("<img src='img/placeholder150x150.png' alt='app logo'>")
				,
			get: function(){
				var w = this
				return new Promise((resolve, reject) => {
					var req = new XMLHttpRequest();
					req.onreadystatechange = function() {
						if (req.readyState == XMLHttpRequest.DONE) {
							w.content = req.responseText
							resolve()
						}
					}
					req.open('GET', 'https://baconipsum.com/api/?type=all-meat', true);
					req.send();
				});
			}
		},
		windowMap: {
			content: undefined,
			get: function(){
				var w = this
				return new Promise((resolve, reject) => {
					w.content = "okno mapy"
					resolve()
				});
			}
		},
		windowPlan: {
			content: undefined,
			get: function(){
				var w = this
				return new Promise((resolve, reject) => {
					w.content = "okno planu"
					resolve()
				});
			}
		},
		windowUser: {
			content: undefined,
			get: function(){
				var w = this
				return new Promise((resolve, reject) => {
					w.content = "okno konta użytkownika"
					resolve()
				});
			}
		},
		windowSettings: {
			content: undefined,
			get: function(){
				var w = this
				return new Promise((resolve, reject) => {
					w.content = "okno ustawień"
					resolve()
				});
			}
		},
	}
}

var Elements = {}

var Data = {}

var Sensors = {
	data: {
		orientation: {
			alpha: undefined,
			beta: undefined,
			gamma: undefined
		}
	},
	tryOrientation(){
		if(window.DeviceOrientationEvent){
		  window.addEventListener("deviceorientation", function(){
			  Sensors.data.orientation.alpha = event.alpha
			  Sensors.data.orientation.beta = event.beta
			  Sensors.data.orientation.gamma = event.gamma
		  }, false);
		}else{
		  console.log("DeviceOrientationEvent is not supported");
		}
	}
}

function swipedetect($el, callback){

    var touchsurface = $el[0],
    swipedir,
    startX,
    startY,
    distX,
    distY,
    threshold = 75, //required min distance traveled to be considered swipe
    restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime = 300, // maximum time allowed to travel that distance
    elapsedTime,
    startTime,
    handleswipe = callback || function(swipedir){}

    touchsurface.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0]
        swipedir = 'none'
        dist = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface
        // e.preventDefault()
    }, false)

    // touchsurface.addEventListener('touchmove', function(e){
    //     e.preventDefault() // prevent scrolling when inside DIV
    // }, false)

    touchsurface.addEventListener('touchend', function(e){
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        if (elapsedTime <= allowedTime){ // first condition for awipe met
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
                swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
            }
            else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
                swipedir = (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
            }
        }
        handleswipe(swipedir)
        // e.preventDefault()
    }, false)
}

function getWindow(w){
	var wind = Templates.windows[w]
	Elements.loading.start()
	wind.get()
		.then(function(data){
			$("#content").append(
				Elements.windows[w] = $("<div></div>")
					.prop("id", w)
					.addClass("contentWindow")
					.append(wind.content)
			)
			$("#content").ready((function(){
				return function(){
					openWindow(w)
					Elements.loading.stop()
				}
			})())
		})
}

function openWindow(wind){
	if(Elements.windows[wind]){
		$("#content").stop().animate({scrollTop:($("#content").height()*$("#"+wind).index())}, 300, 'swing')
	}else{
		getWindow(wind)
	}
}

$(document).ready(function(){

	$("noscript").remove() // removes useless 'noscript' tag

	// grabs main app elements
	Elements = {
		$burger: $("#burger"),
		$content: $("#content"),
		$dimm: $("#drawerDimm"),
		wait: $("<div></div>")
			.addClass("loading")
			.append("Loading"),
		drawer: {
			$self: $("#drawer"),
			$header: $("#drawerHeader"),
			toggle(){
				$("#drawer").toggleClass("active")
			},
			open(){
				$("#drawer").addClass("active")
			},
			close(){
				$("#drawer").removeClass("active")
			},
			sections: {
				windowMap: {
					click: function() {
						alert("click")
					}
				},
				windowPlan: {
					click: function() {
						alert("plan")
					}
				}
			}
		},
		loading: {
			$self: $("#loading"),
			toggle(){
				this.$self.ready((function($loading){
					return function(){
						$loading.toggleClass("hiddenRight")
					}
				})(this.$self))
			},
			start(){
				this.$self.ready((function($loading){
					return function(){
						$loading.removeClass("hiddenRight")
					}
				})(this.$self))
			},
			stop(){
				this.$self.ready((function($loading){
					return function(){
						$loading.addClass("hiddenRight")
					}
				})(this.$self))
			}
		},
		windows: {}
	}

	// main events
	Elements.$burger.on("click", Elements.drawer.toggle)

	Elements.$dimm.on("click", Elements.drawer.toggle)

	$(".drawerList").on("click", "li", function(){
		$(".drawerList>li").removeClass("active")
		$(this).addClass("active")
		Elements.drawer.close()
		openWindow($(this).prop("id"))
	})

	swipedetect(Elements.$dimm, function(dir){
		if(dir=="left") Elements.drawer.close()
	})

	swipedetect($('body'), function(dir){
		if(dir=="right") Elements.drawer.open()
	})

	openWindow("windowMap")

});
