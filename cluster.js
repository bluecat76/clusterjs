(function($, window){

	function Point(id, x, y, size, dx, dy)
	{
		this.id = id;
		this.x = x;
		this.y = y;
		this.size = size;
		this.dx = dx;
		this.dy = dy;
	};
	
	function SortableX(point, distance)
	{
		var cluster = [point],
			
			sq = function(num) {
					return (num * num);
				},
			
			getClusterPoint = function(ptarray) {
				// cluster points to one
				var id= "cl",
					x_sum = 0,
					y_sum = 0,
					num = ptarray.length,
					size = 0;
					
				$.each(ptarray, function(index, pt) {
						id += "_" + pt.id;
						x_sum += pt.x;
						y_sum += pt.y;
						size += pt.size;
					});

				return new Point(id, x_sum/num, y_sum/num, size);
			},
			
			sqdist = sq(distance);

		this.value = point;
		this.prev = null;
		this.next = null;
		
		this.contains = function(element) {
				return (sq(element.value.x - this.value.x) + sq(element.value.y - this.value.y) < sqdist);
			};
		
		this.larger = function(element) {
				return (this.value.x > element.value.x);
			};
		
		this.add = function(element) {
				cluster.push(element.value);
				this.value = getClusterPoint(cluster);
			};
		
		this.getValues = function() {
				var result = [ this.value ];
				if (this.prev)
				{
					result.push.apply(result, this.prev.getValues());
				}
				if (this.next)
				{
					result.push.apply(result, this.next.getValues());
				}
				return result;
			};
	};
	
	function PointsCluster(points, distance)
	{
		var start = null,
			addPoint = function(element) {
				var item = start,
					steps = 0;
				
				if (!item)
				{
					start = element;
					return;
				}
				while (item)
				{
					if (item.contains(element))
					{
						item.add(element);
						return;
					}
					if (item.larger(element))
					{
						// insert in linked list
						if (!item.next)
						{
							item.next = element;
							return;
						}
						item = item.next;
					}
					else
					{
						if (!item.prev)
						{
							item.prev = element;
							return;
						}
						item = item.prev;
					}
					steps ++;
				}
				// this would be an error condition!
				alert("does not happen, or does it?");
			};
		
		this.getPoints = function() {
				return start.getValues();
			};
			
		// init cluster list
		$.each(points, function(index, point) {
				addPoint(new SortableX(point, distance));
			});
		
	};
	
	function Cluster(container, options)
	{
		var _this = this,
			$cont = $(container),
			width = $cont.width(),
			height = $cont.height(),
			
			px = function(number) {
					return parseInt(number, 10) + "px";
				},
			
			create = function(count, max_speed, size) {
					var index,
							speed = 2 * max_speed,
							ptlist = [];
					// create Points array
					for(index = 0; index < count; index++)
					{
						ptlist.push(new Point("pt" + index,
								Math.random() * width, 
								Math.random() * height, 
								size,
								(0.5 - Math.random()) * speed,
								(0.5 - Math.random()) * speed
							));
					}
					return ptlist;
				},
				
			move = function(ptlist) {
					$.each(ptlist, function(index, point) {
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
			
			cluster = function(ptlist) {
					var blob = new PointsCluster(ptlist, options.distance);
					return blob.getPoints();
				};
			
			clear = function() {
					$("div", $cont).remove();
				};
			
			draw = function(ptlist) {
					$.each(ptlist, function(index, point) {
							var ptsize = point.size;
								size = 2 * ptsize + 1;
							$('<div class="pt" id="' + point.id + '">')
								.css({
										left: px(point.x - ptsize), 
										top: px(point.y - ptsize), 
										"width": px(size),
										"height": px(size)
									})
								.appendTo($cont);
						});
				},
				
			points = create(options.count, options.speed, options.size),
			
			run = function() {
					clear();
					draw(cluster(points));
					move(points);
					window.setTimeout(function() { run(); }, 40);
				};
		
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
