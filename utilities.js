var SchemaUtilities = (function(){
	var Constructor = function(){return;};

	Constructor.prototype = {
		itemHasNoParent: function(dom){
			var elem = dom,
				ret = true;

			while(elem && (elem=elem.parentElement)) {
				if(elem.getAttribute('itemtype')!==null) {
					ret = elem;
					elem = null;
				}
			}

			return ret;
		},
		isPropInScope: function(dom, scope){
			var elem = dom,
				ret = false;

			while(elem && (elem=elem.parentElement)) {
				if(elem.getAttribute('itemtype')!==null) {
					if(elem == scope.dom) {
						ret = true;
					} else {
						ret = false;
					}

					elem = null;
				}
			}

			return ret;
		},
		getPropertyValue: function(dom){
			var tagName = dom.tagName.toLowerCase();
			switch(tagName) {
				case "meta":
					return dom.getAttribute('content');
				case "input":
					return dom.getAttribute('value');
				case "link":
				case "a":
					return dom.getAttribute('href');
				default:
					return dom.innerHTML;
			}
		},
		log: function(type) {
			if(console && console[type] instanceof Function) {
				return console[type].apply(
					console,
					Array.prototype.splice.call(
						arguments, 1
					)
				);
			}
			return false;
		}
	};

	return new Constructor;
})();