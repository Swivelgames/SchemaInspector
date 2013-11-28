var SchemaItem = (function(){
	var Constructor = function(dom) {
		this.dom = dom;
		this.init();
		return;
	};

	Constructor.prototype = {
		dom: null,
		type: null,
		schema: null,
		props: null,
		init: function(){
			var thisDom = this.dom,
				schemaUrl = thisDom.getAttribute('itemtype');

			if(!schemaUrl) {
				SchemaUtilities.log('error','Missing itemtype. May cause unexpected issues.');
			}

			this.setSchema(schemaUrl);

			this.props = {};
			this.initProperties();

			return this;
		},
		setSchema: function(schemaUrl) {
			this.schema = schemaUrl;
			this.type = schemaUrl.split(/\//).pop();
			return this;
		},
		initProperties: function() {
			var thisDom = this.dom,
				itemNodeList = thisDom.querySelectorAll('[itemprop]');

			for(var x=0;x<itemNodeList.length;x++) {
				var dom = itemNodeList[x],
					inScope = SchemaUtilities.isPropInScope(dom, this),
					name = dom.getAttribute('itemprop');

				if(inScope!==true) continue;

				var curValue = this.props[name],
					newValue = this.parseProperty(dom);

				if(curValue instanceof Array) {
					this.props[name].push(newValue);
				} else if(!!curValue) {
					this.props[name] = [curValue,newValue];
				} else {
					this.props[name] = newValue;
				}
			}

			return this;
		},
		parseProperty: function(dom) {
			if(dom.getAttribute('itemscope')!==null){
				return SchemaInspector.parseItem(dom);
			}
			return SchemaUtilities.getPropertyValue(dom);
		}
	};

	return Constructor;
})();