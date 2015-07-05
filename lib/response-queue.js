/**
 * Created by allenshow on 6/23/15.
 */

var ResponseQueue=function(){
    this._queue=[];
    this.sequenceNumber=-1;
};

module.exports=ResponseQueue;

ResponseQueue.prototype.getSeqNumber=function(){
    var _this=this;
    if(_this._queue.length>=32767){
        return null;
    }
    _this.sequenceNumber++;
    if(_this.sequenceNumber>32767){
        _this.sequenceNumber=0;
    }
    return _this.sequenceNumber;
}

ResponseQueue.prototype.enQueue=function(func){
    var _this=this;
    if(func) {
        _this._queue.push({
            sequenceNumber: _this.sequenceNumber,
            func: func,
            timestamp: (new Date()).valueOf()
        });
    }
};

ResponseQueue.prototype.exec=function(sequenceNumber,payload){
    //var timestamp=(new Date()).valueOf();
    var sequenceNumber=parseInt(sequenceNumber);
    for(var i=0;i<this._queue.length;i++){
        if(this._queue[i].sequenceNumber === sequenceNumber){

            this._queue[i].func.call(null, null ,payload);

            this._queue.splice(i, 1);

            break;
        }
    }
};