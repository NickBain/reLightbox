/*
*	Author: Nicholas Bain
*/

(function(window){
	"use strict"
	
	/* Work around for ie not supporting Object.create */
	if( Object.create === undefined ) {
		Object.create = function( o ) {
		    function F(){}
		    F.prototype = o;
		    return new F();
		};
	}


	var defaultProperties = {
		overlayDiv: 'reLightboxOverlay',
		innerDiv: 'reLightboxPopup',
		imageId: 'reLightboxImg',
		fullscreen: false,
		preload: false,
		keyboardNav : true
	};


	var lightbox = function(elem, customProperites){
		
		return new _lightbox(elem, customProperites);
	};
	
	/**
	 * @constructor
	 */ 
	 var _lightbox = function(elem, customProperites){
		
		this.properties = Object.create(defaultProperties);
		this.element = elem;
		this.currentIndex = false;

		
		var _this = this;
		if(customProperites){
			
			for (var property in customProperites){
				this.properties[property] = customProperites[property];
			}
		}
		this.init();
	};

	_lightbox.prototype = {

		init : function(){

			this.lightboxOverlay = this._getElement( this.properties.overlayDiv );
			this.lightboxInner = this._getElement( this.properties.innerDiv );
			this.lightboxOverlay.className = 'rlb_invisible';
			
			this.imageElement;
			this.nodeList;
			this.keyListener;
			
			this._setInnerHTML(this.lightboxInner);

			var _this = this;
			
			
			var clickEvent = function(event) {
			       _this.hide(event);
			    };
			
			if (this.lightboxInner.addEventListener){
			  		this.lightboxInner.addEventListener("click", clickEvent, false);
			} else if (this.lightboxInner.attachEvent){
					this.lightboxInner.attachEvent("click", clickEvent);
			}

			var elementList =  document.querySelectorAll(this.element);
			
			this.nodeList = elementList;
			if(this.properties.preload)
				this._preload(this.nodeList);
				
			var forEach = Array.prototype.forEach;
			for (var i = 0; i < this.nodeList.length; ++i) {
				var count = i;
			  	this.nodeList[i].addEventListener('click', 
				function(event) {
					event.preventDefault();
				      _this.show( count );
				    }
				, false);

			}
		},

		_getElement : function(elemId){
			var lDiv = document.getElementById(elemId);
			return (lDiv) ? lDiv : this._createElement(elemId);
		},

		_createElement : function(elemId){
			var div = document.createElement("div");
			div.id= elemId;
			document.body.appendChild(div);
			return div;
		},

		_setInnerHTML : function(element){
			var innerhtml = '<img id="'+ this.properties.imageId +'"/>';
			element.innerHTML = innerhtml;
		},
		
		show : function(index , imagesrc ){
			
			var src = (imagesrc)  ? imagesrc : this.nodeList[index].href;
			this.currentIndex = (typeof index ==='undefined') ? false : index;
				
			var imageElem = document.getElementById(this.properties.imageId);
			if(this.lightboxInner){

				this.lightboxOverlay.className = 'rlb_visible';			
				this.lightboxInner.style.visibility = 'visible';
				var img = new Image();

				var _this = this;

				img.onload = function() { 
					imageElem.src = this.src;
				}
				img.onerror = function() {
					console.log('Error fetching image');
					_this.hide();
				};
				img.onabort = function() {
					console.log('Abort loading image');
					_this.hide();
				};
				img.src = src
				this.imageElement = imageElem;

				this.properties.fullscreen && this._goFullscreen();
				
				this._removeKeyBoardListener();
				this._addKeyBoardListener();
				
			}
		},

		hide : function(event){
				
			if(this.lightboxInner){
				this.lightboxOverlay.className = 'rlb_invisible';
				this.lightboxInner.style.visibility = 'hidden';
			}
			
			this.properties.fullscreen && this._exitFullscreen();
		},
		
		_addKeyBoardListener : function(){
			
			if(!this.properties.keyboardNav)return;
			
			var _this = this;
			var myFunct = function(){
				_this._respondToKeyPress(event, _this);
			};
			
			document.addEventListener('keyup', myFunct, false);
			this.keyListener = myFunct;
		},
		_respondToKeyPress : function(event, _this){
			
			if(1 > _this.nodeList.length)
				return;
					
			if(event.keyCode == 39 && _this.currentIndex !== false) {
					if(_this.nodeList[_this.currentIndex+1]){
						_this.show(_this.currentIndex+1);
					}
					else{
						_this.show(0);
					}
			}
			
			if(event.keyCode == 37 && _this.currentIndex !== false) {
					if(_this.nodeList[_this.currentIndex-1]){
						_this.show(_this.currentIndex-1);
					}
					else{
						_this.show(_this.nodeList.length-1)
					}
			}
			
		},
		
		_removeKeyBoardListener : function(){
				if(!this.properties.keyboardNav)return;
				document.removeEventListener("keyup", this.keyListener);
				
		},
		_goFullscreen : function(){
			
			var fsElement =  this.lightboxInner;
			
			if (fsElement.requestFullscreen) {
			    fsElement.requestFullscreen();
			}
			else if ( fsElement.mozRequestFullScreen) {
			    fsElement.mozRequestFullScreen();
			}
			else if (fsElement.webkitRequestFullScreen) {
			    fsElement.webkitRequestFullScreen();
			}
		},
		
		_exitFullscreen : function(){
			
			if (document.exitFullscreen) {
			    document.exitFullscreen();
			}
			else if (document.mozCancelFullScreen) {
			    document.mozCancelFullScreen();
			}
			else if (document.webkitCancelFullScreen) {
			    document.webkitCancelFullScreen();
			}
		},
		
		_preload : function(nodeArray){
				var forEach = Array.prototype.forEach;
				forEach.call(nodeArray, function(node, index){ 
				  	var img = new Image();
						img.onload = function() { 
							console.log('loaded');
						}
					img.src= node.href;
				});
		}
	};

	window.reLightbox = lightbox;

})(window);