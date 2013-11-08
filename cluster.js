(function($, window){

	// helper function
	var POINT_SIZE = 3,
		px = function(number)
		{
			return parseInt(number, 10) + "px";
		},
		sq = function(num)
		{
			return (num * num);
		};

	function Point(id, x, y, size, dx, dy)
	{
		this.id = id;
		this.x = x;
		this.y = y;
		this.size = size;
		this.dx = dx;
		this.dy = dy;
	};
	
	function SortedList()
	{
		this.start = null;
	
		this.add = function(element) {
				var item = this.start,
						last = null;
				if (!item)
				{
					this.start = element;
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
						if (last)
						{
							last.next = element;
						}
						else
						{
							this.start = element;
						}
						element.next = item;
						return;
					}
					if (!item.next)
					{
						item.next = element;
						return;
					}
					// progress
					last = item;
					item = item.next;
				}
				// this would be an error condition!
				alert("does not happen, or does it?");
			};
			
		this.getValues = function() {
				var item = this.start,
						result = [];
				while (item)
				{
					result.push.apply(result, item.getValues());
					item = item.next;
				}
				return result;
			};
	};
	
	function SortableY(value, dist)
	{
		this.value = value;
		this.next = null;
		this.cluster = [];
		
		// add own value to the cluster
		this.cluster.push(value);
		
		this.contains = function(element) {
				return (sq(element.value.x - this.value.x) + sq(element.value.y - this.value.y) < sq(dist));
			};
		
		this.larger = function(element) {
				return (this.value.y > element.value.y);
			};
		
		this.add = function(element) {
				this.cluster.push(element.value);
			};
			
		this.getValues = function() {
				// cluster points to one
				var id= "cl",
					x_sum = 0,
					y_sum = 0,
					num = this.cluster.length,
					size = 0,
					result = [];
				$.each(this.cluster, function(index, value) {
						id += "_" + value.id;
						x_sum += value.x;
						y_sum += value.y;
						size += value.size;
					});

				result.push(new Point(id,
					x_sum/num, y_sum/num, size));

				return result;
			};
	};
	
	function SortableX(value, dist)
	{
		this.value = value;
		this.next = null;
		this.listy = new SortedList();
		
		// insert own value to the list
		this.listy.add(new SortableY(value));
		
		this.contains = function(element) {
				return (Math.abs(element.value.x - this.value.x) < dist);
			};
		
		this.larger = function(element) {
				return (this.value.x > element.value.x);
			};
		
		this.add = function(element) {
				this.listy.add(new SortableY(element.value, dist));
			};
			
		this.getValues = function() {
		/*
				// print y-list
				var item = this.listy.start,
					list = [];
				while (item)
				{
					list.push(item.value.x);
					item = item.next;
				}
				
				console.log("List-Y: " + this.listy.start.value.id + " -> " + JSON.stringify(list));
		*/		
				return this.listy.getValues();
			};
	};
	
	function ClusterXY(points, distance)
	{
		var listx = new SortedList(),
				result = [];
				
		$.each(points, function(index, point) {
				// console.log("adding to cluster (" + point.id + "): ");
				listx.add(new SortableX(point, distance));
			});
		
		this.getValues = function() {
				return listx.getValues(result);
			};
	};
	
	function Cluster(container, options)
	{
		var _this = this,
			$cont = $(container),
			width = $cont.width(),
			height = $cont.height(),
			
			create = function(count, speed) {
					var index,
							ptlist = [];
					// create Points array
					for(index = 0; index < count; index++)
					{
						ptlist.push(new Point("pt" + index,
								Math.random() * width, 
								Math.random() * height, 
								POINT_SIZE,
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
					var blob = new ClusterXY(ptlist, POINT_SIZE*3);
					return blob.getValues();
				};
			
			clear = function() {
					$("div", $cont).remove();
				};
			
			draw = function(ptlist, color) {
					$.each(ptlist, function(index, point) {
							var size = point.size;
							$('<div class="pt" id="' + point.id + '">')
								.css({
										left: px(point.x - size), 
										top: px(point.y - size), 
										"background-color": color, 
										"width": px(2*point.size + 1),
										"height": px(2*point.size + 1),
										"opacity": 0.6 
									})
								.appendTo($cont);
						});
				},
				
			points = create(options.count, options.speed),
			
			run = function() {
					clear();
					draw(points, "green");
					draw(cluster(points), "red");
					move(points);
					window.setTimeout(function() { run(); }, 30);
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
