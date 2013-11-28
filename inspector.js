var SchemaInspector = (function(){
	var Constructor = function(options){
		this.options = options || {};
		return;
	};

	Constructor.prototype = {
		options: null,
		items: null,
		run: function(){
			this.items = [];
			return this.getItems();
		},
		getItems: function(){
			if(this.items!==null && this.items instanceof Array && this.items.length>0) {
				return this.items;
			}

			var itemNodeList = document.querySelectorAll('[itemscope][itemtype]:not([itemtype=""])');

			for(var x=0;x<itemNodeList.length;x++) {
				var dom = itemNodeList[x],
					hasNoParent = SchemaUtilities.itemHasNoParent(dom);

				if(hasNoParent!==true) continue;

				this.items.push(
					this.parseItem(dom)
				);
			}

			return this.items;
		},
		parseItem: function(dom){
			return new SchemaItem(dom);
		},

		getOption: function(name) {
			return this.options[name] || null;
		},

		setOption: function(name, value) {
			return this.options[name] = value;
		}
	};

	return new Constructor;
})();