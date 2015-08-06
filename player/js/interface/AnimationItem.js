var AnimationItem = function (options) {
	
	if (!options) {
		options = {};
	}

	this.element = options.element;
	this.src = options.src;

	this._init();

}

// -------------------------------------------------------------------o Public

AnimationItem.prototype.trigger = function(eventName, args){

	var delay = (this.callbacks.length === 0) ? true : false;
	var that = this;

	if (delay){
		setTimeout(function(){
			that.callbacks[eventName](args);
		}, 0);
	}
	else {
		this.callbacks[eventName](args);
	}
};

AnimationItem.prototype.addEventListener = function(eventName, callback){

	this.callbacks[eventName] = callback;

};

// -------------------------------------------------------------------o Init

AnimationItem.prototype._init = function () {

	this.animationID = randomString(10);
	this.renderer = null;
	this.path = '';
	this.animationData = {};
	this.layers = [];
	this.assets = [];
	this.scaleMode = 'fit';

	this.currentFrame = 0;
	this.currentRawFrame = 0;
	this.totalFrames = 0;
	this.frameRate = 0;
	this.frameMult = 0;
	this.playSpeed = 1;
	this.playDirection = 1;
	this.pendingElements = 0;
	this.playCount = 0;
	this.prerenderFramesFlag = true;
	this.renderedFrameCount = 0;

	this.isLoaded = false;
	this.isPaused = false;

	this.setData(this.element);

}

AnimationItem.prototype._initEvents = function () {



}

// -------------------------------------------------------------------o Private



// -------------------------------------------------------------------o Public

AnimationItem.prototype.play = function () {

	this._changeState(BodyMovin.PLAYING);

}

AnimationItem.prototype.pause = function () {

	this._changeState(BodyMovin.PLAYING);

}

AnimationItem.prototype.pause = function () {

	this._changeState(BodyMovin.PAUSED);

}

AnimationItem.prototype.seek = function (frame) {

	

}

AnimationItem.prototype.timeUpdate = function (frame) {



	this.trigger(BodyMovin.TIMEUPDATE);

}

AnimationItem.prototype.render = function (elapsedTime) {


	this.animItem.advanceTime(elapsedTime);

}



// -------------------------------------------------------------------o Getters

AnimationItem.prototype.getDuration = function () {

	return this.duration;

}

AnimationItem.prototype.getCurrentFrame = function () {

	return this.currentFrame;

}

// -------------------------------------------------------------------o Setters

/*AnimationItem.prototype.setData = function (data) {

	this.data = data;

}*/

AnimationItem.prototype.setParams = function (params) {

	var self = this;

    if (params.context) {
        this.context = params.context;
    }

    if (params.wrapper) {
        this.wrapper = params.wrapper;
    }

    var animType = params.animType ? params.animType : 'canvas';

    switch (animType) {
        case 'canvas':
            this.renderer = new CanvasRenderer(this, params.renderer);
            break;
        case 'svg':
            this.renderer = new SVGRenderer(this, params.renderer);
    }

    this.animType = animType;

    if (params.loop === '' || params.loop === null) {

    }
    else if (params.loop === false){
        this.loop = false;
    } else if (params.loop === true){
        this.loop = true;
    } else {
        this.loop = parseInt(params.loop);
    }

    this.name = params.name ? params.name :  '';
    this.prerenderFramesFlag = 'prerender' in params ? params.prerender : true;

    if (params.animationData) {
        self.configAnimation(params.animationData);
    } else if (params.path) {

        if (params.path.substr(-4) != 'json') {
            if (params.path.substr(-1, 1) != '/') {
                params.path += '/';
            }
            params.path += 'data.json';
        }

        var xhr = new XMLHttpRequest();
        this.path = params.path.substr(0,params.path.lastIndexOf('/')+1);
        xhr.open('GET', params.path, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    self.configAnimation(JSON.parse(xhr.responseText));
                } else {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        self.configAnimation(response);
                    } 
                    catch(err) {

                    }
                }
            }
        };
    }

}

AnimationItem.prototype.setData = function (wrapper) {

    var params = {
        wrapper: wrapper
    };

    var wrapperAttributes = wrapper.attributes;

    params.path = wrapperAttributes.getNamedItem('data-animation-path') ? wrapperAttributes.getNamedItem('data-animation-path').value : wrapperAttributes.getNamedItem('data-bm-path') ? wrapperAttributes.getNamedItem('data-bm-path').value :  wrapperAttributes.getNamedItem('bm-path') ? wrapperAttributes.getNamedItem('bm-path').value : '';
    params.animType = wrapperAttributes.getNamedItem('data-anim-type') ? wrapperAttributes.getNamedItem('data-anim-type').value : wrapperAttributes.getNamedItem('data-bm-type') ? wrapperAttributes.getNamedItem('data-bm-type').value : wrapperAttributes.getNamedItem('bm-type') ? wrapperAttributes.getNamedItem('bm-type').value :  'canvas';

    params.path = this.src;

    var loop = wrapperAttributes.getNamedItem('data-anim-loop') ? wrapperAttributes.getNamedItem('data-anim-loop').value :  wrapperAttributes.getNamedItem('data-bm-loop') ? wrapperAttributes.getNamedItem('data-bm-loop').value :  wrapperAttributes.getNamedItem('bm-loop') ? wrapperAttributes.getNamedItem('bm-loop').value : '';
    if (loop === '') {

    } else if (loop === 'false') {
        params.loop = false;
    } else if(loop === 'true') {
        params.loop = true;
    } else {
        params.loop = parseInt(loop);
    }

    params.name = wrapperAttributes.getNamedItem('data-name') ? wrapperAttributes.getNamedItem('data-name').value :  wrapperAttributes.getNamedItem('data-bm-name') ? wrapperAttributes.getNamedItem('data-bm-name').value : wrapperAttributes.getNamedItem('bm-name') ? wrapperAttributes.getNamedItem('bm-name').value :  '';
    var prerender = wrapperAttributes.getNamedItem('data-anim-prerender') ? wrapperAttributes.getNamedItem('data-anim-prerender').value :  wrapperAttributes.getNamedItem('data-bm-prerender') ? wrapperAttributes.getNamedItem('data-bm-prerender').value :  wrapperAttributes.getNamedItem('bm-prerender') ? wrapperAttributes.getNamedItem('bm-prerender').value : '';

    if (prerender === 'false') {
        params.prerender = false;
    }

    this.setParams(params);

}


AnimationItem.prototype.configAnimation = function (animData) {

    this.renderer.configAnimation(animData);

    this.animationData = animData;
    this.animationData._id = this.animationID;
    this.animationData._animType = this.animType;
    this.layers = this.animationData.animation.layers;
    this.assets = this.animationData.assets;
    this.totalFrames = this.animationData.animation.totalFrames;
    this.frameRate = this.animationData.animation.frameRate;
    this.firstFrame = Math.round(this.animationData.animation.ff*this.frameRate);
    /*this.firstFrame = 38;
    this.totalFrames = 2;*/
    this.frameMult = this.animationData.animation.frameRate / 1000;
    dataManager.completeData(this.animationData);
    this.renderer.buildItems(this.animationData.animation.layers);
    this.updaFrameModifier();
    this.checkLoaded();

}

AnimationItem.prototype.elementLoaded = function () {

    this.pendingElements--;
    this.checkLoaded();

}


AnimationItem.prototype.checkLoaded = function () {

    if (this.pendingElements === 0) {
        this.renderer.buildStage(this.container, this.layers);
        if (this.prerenderFramesFlag) {
            this.prerenderFrames(0);
            dataManager.renderFrame(this.animationID,this.currentFrame + this.firstFrame);
            this.renderer.renderFrame(this.currentFrame + this.firstFrame);
        } else {
            this.isLoaded = true;
            this.gotoFrame();
            // autoplayed
        }
    }
};

AnimationItem.prototype.prerenderFrames = function (count) {

    if (!count) {
        count = 0;
    }

    if (this.renderedFrameCount === Math.floor(this.totalFrames)) {
        //TODO Need polyfill for ios 5.1
        this.isLoaded = true;
        this.gotoFrame();
        // autoplayed
    } else {
        dataManager.renderFrame(this.animationID,this.renderedFrameCount + this.firstFrame);
        this.renderedFrameCount+=1;

        if (count > 10) {
            setTimeout(this.prerenderFrames.bind(this),0);
        } else {
            count += 1;
            this.prerenderFrames(count);
        }
    }
};

AnimationItem.prototype.resize = function () {

    this.renderer.updateContainerSize();

};
AnimationItem.prototype.gotoFrame = function () {

    if (subframeEnabled){
        this.currentFrame = Math.round(this.currentRawFrame*100)/100;
    } else {
        this.currentFrame = Math.floor(this.currentRawFrame);
    }

    this.renderFrame();

};

AnimationItem.prototype.renderFrame = function () {

    if(this.isLoaded === false){
        return;
    }

    dataManager.renderFrame(this.animationID,this.currentFrame + this.firstFrame);
    this.renderer.renderFrame(this.currentFrame + this.firstFrame);

};

AnimationItem.prototype.play = function (name) {

    if (this.isPaused === true) {
        this.isPaused = false;
    }

};

AnimationItem.prototype.pause = function (name) {

    if (this.isPaused === false) {
        this.isPaused = true;
    }

};

AnimationItem.prototype.togglePause = function (name) {

    if (this.isPaused === true) {
        this.isPaused = false;
        this.play();
    } else {
        this.isPaused = true;
        this.pause();
    }

};

AnimationItem.prototype.stop = function (name) {

    this.isPaused = true;
    this.currentFrame = this.currentRawFrame = 0;
    this.playCount = 0;
    this.gotoFrame();

};

AnimationItem.prototype.goToAndStop = function (value, isFrame, name) {

    if (isFrame) {
        this.setCurrentRawFrameValue(value);
    } else {
        this.setCurrentRawFrameValue(value * this.frameModifier);
    }

    this.isPaused = true;

};

AnimationItem.prototype.advanceTime = function (value) {

    if (this.isPaused === true || this.isLoaded === false) {
        return;
    }

    this.setCurrentRawFrameValue(this.currentRawFrame + value * this.frameModifier);

};

AnimationItem.prototype.updateAnimation = function (perc) {

    this.setCurrentRawFrameValue(this.totalFrames * perc);

};

AnimationItem.prototype.moveFrame = function (value, name) {

    this.setCurrentRawFrameValue(this.currentRawFrame + value);

};

AnimationItem.prototype.setCurrentRawFrameValue = function(value){

    this.currentRawFrame = value;
    if (this.currentRawFrame >= this.totalFrames) {
        if(this.loop === false){
            this.currentRawFrame = this.totalFrames - 1;
            this.gotoFrame();
            this.pause();
            return;
        } else {
            this.playCount += 1;

            if (this.loop !== true) {
                if(this.playCount == this.loop){
                    this.currentRawFrame = this.totalFrames - 1;
                    this.gotoFrame();
                    this.pause();
                    return;
                }
            }
        }
    } else if (this.currentRawFrame < 0) {
        this.playCount -= 1;

        if (this.playCount < 0) {
            this.playCount = 0;
        }

        if (this.loop === false) {
            this.currentRawFrame = 0;
            this.gotoFrame();
            this.pause();
            return;
        } else {
            this.currentRawFrame = this.totalFrames + this.currentRawFrame;
            this.gotoFrame();
            return;
        }
    }

    this.currentRawFrame = this.currentRawFrame % this.totalFrames;
    this.gotoFrame();

};

AnimationItem.prototype.setSpeed = function (val) {

    this.playSpeed = val;
    this.updaFrameModifier();

};

AnimationItem.prototype.setDirection = function (val) {

    this.playDirection = val < 0 ? -1 : 1;
    this.updaFrameModifier();

};

AnimationItem.prototype.updaFrameModifier = function () {

    this.frameModifier = this.frameMult * this.playSpeed * this.playDirection;

};

AnimationItem.prototype.getPath = function () {

    return this.path;

};

AnimationItem.prototype.getAssets = function () {

    return this.assets;

};