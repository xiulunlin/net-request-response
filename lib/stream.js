/**
 * Created by allenshow on 7/4/15.
 */

var Buffer = require('buffer').Buffer;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Packet = require('./packet');

var Stream = function () {
    this.buffer = null;
    this.currPacket = {};
    this.isNewPacket = true;
}

util.inherits(Stream, EventEmitter);

Stream.prototype.pipe = function (buf) {

    this.buffer = this.buffer ? Buffer.concat([this.buffer, buf]) : buf;

    this.parse();

}

Stream.prototype.parse = function () {
    var _stream = this;

    var buffer = _stream.buffer;
    var length = buffer.length;

    if (_stream.isNewPacket) {
        if (length < 2) {
            return;
        }

        _stream.isNewPacket = false;
        _stream.isHeaderFinished = false;
        _stream.remainingLength = 0;
        _stream.type=buffer[0]>>>7;
        _stream.sequenceNumber = buffer.readUInt16BE(0) % 32768;

        for (var i = 2; i < length; i++) {
            if (_stream.cookHeader(buffer, i, length)) {
                break;
            }
        }
    } else {
        for (var i = _stream.currIndex; i < length; i++) {
            if (_stream.cookHeader(buffer, i, length)) {
                break;
            }
        }
    }
}

Stream.prototype.cookHeader = function (buffer, i, length) {
    var _stream = this;
    if (_stream.isHeaderFinished === false) {
        if (!_stream.getRemainingFlag(buffer[i])) {
            _stream.isHeaderFinished = true;
        }
        _stream.remainingLength = _stream.remainingLength * 128 + (_stream.getRemainingLength(buffer[i]));
    } else {

        var rest = length - i;

        if (rest >= _stream.remainingLength) {
            var packet = new Packet({
                type:_stream.type,
                sequenceNumber: _stream.sequenceNumber,
                remainingLength: _stream.remainingLength,
                payload: _stream.buffer.slice(i, i + _stream.remainingLength)
            })

            _stream.emit('message', packet);

            _stream.isNewPacket = true;
            _stream.buffer = _stream.buffer.slice(i + _stream.remainingLength);
            _stream.parse();
        } else {
            _stream.currIndex = i;
        }

        return true;
    }
}

Stream.prototype.getRemainingFlag = function (byte) {
    return (byte >>> 7);
}

Stream.prototype.getRemainingLength = function (byte) {
    return (byte & 0x7F);
}


module.exports = Stream;