var stampit = require('stampit'),
    Q       = require('q'),
    Put     = require('put');


module.exports = stampit()
    .init(function () {
    
        var init = function () {
        
            this.addResponseHandler(40, onResponse);
        
        }.bind(this);
    
        var onResponse = function (pdu, request) {
 
            this.log.debug("handling multiple registers response.");

            var fc              = pdu.readUInt8(0),
                startAddress    = pdu.readUInt16BE(1),
                quantity        = pdu.readUInt16BE(3);
    
            var resp = {
                fc              : fc,
                startAddress    : startAddress,
                quantity        : quantity
            };

            if (fc !== 40) {
                request.defer.reject();
                return;
            }

            request.defer.resolve(resp);

       
        }.bind(this);

        this.writeFileData = function (startAddress, register) {
 
            var defer = Q.defer();

            //if (register.length > 0x007b) {

            //    defer.reject();
            //    return;

            //}

            var fc          = 40,
                byteCount   = Math.ceil(register.length),
                curByte     = 0,
                pdu         = Put()
                                .word8(fc)
                                .word16be(startAddress)
                                .word16be(register.length)
                                .word8(byteCount);

            //for (var i = 0; i < register.length; i += 1) {

                pdu.put(new Buffer(register, 'ascii'));
            
            //}

            pdu = pdu.buffer();
            

            this.queueRequest(fc, pdu, defer);


            return defer.promise;

        };

        init();
    
    });
