/**
 * Created by allenshow on 7/4/15.
 */

var Buffer = require('buffer').Buffer;

var Packet = function (options) {

    this.type=options.type;
    this.sequenceNumber=options.sequenceNumber;
    this.remainingLength=options.remainingLength;
    this.payload=options.payload;
};

module.exports = Packet;