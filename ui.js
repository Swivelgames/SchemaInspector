var SchemaUI = (function(){
	var Constructor = function(){
		this.init();
		return;
	};

	Constructor.prototype = {
		tplDir: "./ui/",
		xhrCache: {},
		schemaContext: "/github/SchemaInspector/",
		inspectorDom: null,
		initialized: (function(){
			var f=function(){};
			return (f.prototype={
				'vals':{},
				'watchers':{},
				'set': function(key, val) {
					this.vals[key] = val;

					if(!this.watchers[key]) {
						this.watchers[key] = [];
					}

					this.trigger(key);
				},
				'watch': function(key, callback) {
					this.watchers[key].push(callback);
				},
				'trigger': function(key) {
					var watchers = this.watchers[key];
					if(!watchers) return;
					for(var w=0;w<watchers.length;w++) {
						watchers[w].call(this, key, this.vals[key]);
					}
					return;
				}
			}),(new f());
		})(),
		init: function(){
			this.initStyles();

			var that = this,
				tplDir = this.getTplDir();

			this.initialized.set('inspector', false);
			this.loadResource(tplDir+"inspector.html", function(nodes, xhr, url){
				this.inspectorDom = nodes[0];
				that.initInspector();
			});

			this.initialized.set('details', false);
/*			this.loadResource(tplDir+"details.html", function(nodes, xhr, url){
				that.initDetails(nodes[0]);
			});*/

			this.initialized.set('list', false);
			this.loadResource(tplDir+"list.html", function(nodes, xhr, url){
				this.initList(nodes[0]);
			});

			return;
		},
		displayInspector: function() {
			if(!document.body.querySelector('#schemaspacer')) {
				var spacer = document.createElement('div');
				spacer.setAttribute('id','schemaspacer');
				document.body.appendChild(spacer);
			}
			document.body.appendChild(this.inspectorDom);
		},
		initInspector: function(){
			var that = this,
				dom = this.inspectorDom;

			this.initialized.watch('list',function(key, val){
				if(!val) return;
				var listPH = dom.querySelector('[data-placeholder-list]');
				listPH.parentNode.replaceChild(val, listPH);

/*				if(!!this.vals.details) {*/
					that.displayInspector();
/*				}*/
			});

			this.initialized.watch('details',function(key, val){
				if(!val) return;
				var detailsPH = dom.querySelector('[data-placeholder-details]');
				detailsPH.parentNode.replaceChild(val, detailsPH);

				if(!!this.vals.list) {
					that.displayInspector();
				}
			});

			dom.querySelector('[data-button-hide]').addEventListener('click', function(){
				dom.parentNode.removeChild(dom);
			}, false);

			this.initialized.set('inspector', true);
			return;
		},
		initList: function(dom) {
			this.setContent(dom, 'main', SchemaInspector, function(e, context){
				var that = this;
				this.loadResource(this.getTplDir()+"details.html", function(nodes){
					that.initDetails(nodes[0], context);
				});
			});

			this.initialized.set('list', dom);
			return;
		},
		initDetails: function(dom, context) {
			this.setContent(dom, 'details', context);
			this.initialized.set('details', dom);
			return;
		},
		setContent: function(dom, prefix, obj, liClick) {
			this.elementAttrMap(dom, prefix, 'prop', function(el, attrVal){
				this.setElementValue(el, this.getPropFromStr(obj, attrVal));
			});

			this.elementAttrMap(dom, prefix, 'list', function(el, attrVal){
				this.populateList(
					el, this.getPropFromStr(obj, attrVal), liClick
				);
			});
		},
		populateList: function(dom, list, liClick, liDom, arrKeyName) {
			var that = this,
				prefix = 'list',
				contDom = dom.querySelector('[data-list-container]') || dom;

			if(!liDom) {
				liDom = dom.querySelector('[data-list-item]');
				liDom.parentNode.removeChild(liDom);
			}

			for(var propName in list) {
				var prop = list[propName],
					nLi = liDom.cloneNode(true, false);

				if(prop instanceof Array) {
					this.populateList(dom, prop, liClick, liDom, propName);
					continue;
				}

				this.elementAttrMap(nLi, prefix, 'key',function(el){
					this.setElementValue(el, arrKeyName || propName);
				});

				this.elementAttrMap(nLi, prefix, 'prop',function(el, attrVal){
					this.setElementValue(
						el, this.getPropFromStr(prop, attrVal)
					);
				});

				if(liClick instanceof Function) {
					nLi.addEventListener('click',function(){
						var args = Array.prototype.splice.apply(arguments,[0]);
						liClick.apply(that,args.concat([
							prop, propName, list, nLi, contDom, dom, liClick
						]));
					});
				}

				contDom.appendChild(nLi);
			}
		},
		elementAttrMap: function(dom, prefix, suffix, callback) {
			var attrName = 'data-'+prefix+'-'+suffix,
				elems = dom.querySelectorAll('['+attrName+']');

			if(!elems || elems.length<1) {
				if(dom.getAttribute(attrName)!==null) {
					elems = [dom];
				} else {
					return;
				}
			}

			for(var x=0;x<elems.length;x++) {
				var el = elems[x],
					attrVal = el.getAttribute(attrName);

				if(attrVal===null) continue;

				callback.call(this, el, attrVal);
			}
		},
		elementAttrObjMap: function(dom, prefix, context) {
			for(var propName in context) {
				var prop = context[propName];

				this.elementAttrMap(dom, prefix, 'key',function(el){
					this.setElementValue(el, propName);
				});

				this.elementAttrMap(dom, prefix, 'prop',function(el, attrVal){
					this.setElementValue(
						el, this.getPropFromStr(prop, attrVal)
					);
				});
			}
		},
		setElementValue: function(dom, value) {
			var attr = SchemaUtilities.determineValueAttr(dom);
			return dom[attr] = value;
		},
		getPropFromStr: function(context, str){
			var dims = str.split(/\s+/),
				ret = context;

			if(!(context instanceof Object)) {
				return context;
			}

			for(var i=0;i<dims.length;i++) {
				ret = ret[dims[i]];
			}

			return ret;
		},
		getTplDir: function() {
			return this.schemaContext+this.tplDir;
		},
		initStyles: function() {
			/*<link href="styles.css" rel="stylesheet">*/
			var styles = document.createElement('link');

			styles.setAttribute('rel','stylesheet');
			styles.setAttribute('href',this.getTplDir()+'schema.css');

			return document.querySelector('head').appendChild(styles);
		},
		loadResource: function(url, callback){
			var ajax = this.newXmlHttpRequest();
			if (!ajax) return false;

			var that = this;
			ajax.onreadystatechange = function() {
				that.__tplResponseCallback.call(that, ajax, url, callback);
			};

			ajax.open("GET", url, true);
			ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			ajax.send();

			return false;
		},
		__tplResponseCallback: function(ajax, url, callback) {
			if (ajax.readyState == 4) {
				if(ajax.status == 200) {
					this.xhrCache[url] = ajax.responseText;
					var tmp = document.createElement('div');

					tmp.innerHTML = ajax.responseText;

					callback.call(this,tmp.childNodes,ajax,url);
				} else {
					throw new Error("Error retrieving modal template. Response: "+ajax.status);

				}
			}
		},
		newXmlHttpRequest: function() {
			try {
				return new XMLHttpRequest();
			} catch (e) {
				try {
					return new ActiveXObject("Msxml2.XMLHTTP");
				} catch (e) {
					try {
						return new ActiveXObject("Microsoft.XMLHTTP");
					} catch (failed) {
						return false;
					}
				}
			}
		}
	};

	return Constructor;
})();