(function($, window){

	// helper function
	var px = function(number)
		{
			return parseInt(number, 10) + "px";
		};

	function Point(id, x, y, dx, dy)
	{
		this.id = id;
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
	};
	
	function Cluster(container, options)
	{
		var _this = this,
			$cont = $(container),
			width = $cont.width(),
			height = $cont.height(),
			points = [],
			
			create = function(count, speed) {
					var index;
					// create Points array
					for(index = 0; index < count; index++)
					{
						points.push(new Point("pt" + index,
								Math.random() * width, 
								Math.random() * height, 
								(0.5 - Math.random()) * speed,
								(0.5 - Math.random()) * speed
							));
					}
				},
				
			move = function() {
					$.each(points, function(index, point) {
							point.x += point.dx;
							point.y += point.dy;
							
							if (point.x > width)
							{
								point.dx *= -1;
								point.x = 2*width - point.x;
							}
							if (point.x < 0)
							{
								point.dx *= -1;
								point.x = -point.x;
							}
							if (point.y > height)
							{
								point.dy *= -1;
								point.y = 2*height - point.y;
							}
							if (point.y < 0)
							{
								point.dy *= -1;
								point.y = -point.y;
							}
														
							point.$elem;
						});
				};
			
			draw = function() {
					$("div", $cont).remove();
					$.each(points, function(index, point) {
							$('<div class="pt" id="' + point.id + '">')
								.css({ left: px(point.x), top: px(point.y) })
								.appendTo($cont);
						});
				};
			
			run = function() {
					draw();
					move();
					window.setTimeout(function() { run(); }, 30);
				};
		
		create(options.count, options.speed);
		run();
	};

	$.fn.cluster = function(param)
	{
		// main plugin routine
		return this.each(function(){
				var instance = $.data(this, "cluster");
				if (!instance) {
					$.data(this, "cluster", new Cluster(this, param));
				} else {
					instance[param].apply(instance, Array.prototype.slice.call(arguments, 1));
				}
		});
	};
	
})(jQuery, this);
