
// Address the contract is deployed with.
var address = 'AA45292750908DC73A7EB54BDE748327AD3167FF';
// Path to accounts.json file of the chain
var accountsPath = '/Users/RetinaObst/.eris/chains/foo_chain/accounts.json';

var fs = require('fs');
var EventEmitter = require('events');
var util = require('util');
var async = require('async');
var erisC = require('eris-contracts');

var logger = require(__libs+'/eris-logger');
var eris = require(__libs+'/eris-wrapper');

(function() {

    var log = logger.getLogger('eris.hello.chain');

    var events = {NEW_MESSAGE: "newMessage"};

    // Set up event emitter
    function ChainEventEmitter() {
        EventEmitter.call(this);
    }
    util.inherits(ChainEventEmitter, EventEmitter);
    var chainEvents = new ChainEventEmitter();

    // ##############
    // The following part depends on local files that are generated during contract deployment via EPM
    // ##############
    var epmData = require(__contracts+'/epm.json');
    var messageFactoryAbi = JSON.parse(fs.readFileSync(__contracts+'/abi/SeminarManager'));
    var messageAbi = JSON.parse(fs.readFileSync(__contracts+'/abi/Seminar'));

    // Instantiate connection
    var erisWrapper = new eris.NewWrapper( (__settings.eris.chain.host || 'localhost'), (__settings.eris.chain.port || '1337'), accountsPath);
    // Create contract objects
    var seminarManager = erisWrapper.createContract(messageFactoryAbi, address);//, epmData['SeminarManager']);
    var seminarContract = erisWrapper.createContract(messageAbi, address);//, epmData['Seminar']);

    // Event Registration
    seminarManager.NewSeminar(
        function (error, eventSub) {
            if(error) { throw error; }
            //eventSubNew = eventSub; // ignoring this for now
        },
        function (error, event) {
            if(event) {
                chainEvents.emit(events.NEW_DEAL, event.args.contractAddress, eris.hex2str(event.args.id),
                    eris.hex2str(event.args.name), eris.hex2str(event.args.member));
            }
        });

    /**
     * The init function can be used to perform further configuration on contracts
     * @param callback
     */
    var init = function(callback) {
        // nothing to do here
        callback(null);
    }

    /**
     * Adds a single seminar to the chain
     * @param seminar
     * @param callback
     */
    var addSeminar = function(seminar, callback) {
        seminarManager.addSeminar(eris.str2hex(seminar.id), eris.str2hex(seminar.name),
                        eris.str2hex(seminar.member), function(error, result) {
            log.debug('Created new seminar id: '+seminar.id+'name:'+seminar.name+', member: '+seminar.member);
            callback(error);
        });
    };

    /**
     * Retrieves all registered seminars from the SeminarManager contract.
     * This function is very expensive and might not perform well for large numbers of seminars
     * @param callback
     */
    var getSeminars = function(callback) {

        var idx = 0;
        var addresses = [];
        function collectSeminarAddresses () {
            seminarManager.valueAtIndexHasNext(idx, function(error, result) {
                if (error) { throw error; }
                if(result[0] != 0) {
                    addresses.push(result[0]);
                }
                idx = result[1];
                // keep reading ...
                if(idx > 0) { collectSeminarAddresses(); }
                // ... or hand over to start collecting data
                else {
                    log.info('Found '+addresses.length+' seminar addresses.');
                    createSeminarObjects(addresses)
                }
            });
        }
        collectSeminarAddresses();

        function createSeminarObjects(addresses) {
            var seminars = [];
            async.each(addresses, function iterator(addr, callback) {
                log.debug('Retrieving seminar data for address: ' + addr);
                seminarContract.at(addr, function(error, contract) {
                    if (error) {
                        // ignoring error for now in order to continue with other contracts
                        log.error('Failure to access contract at address '+addr+': '+error);
                    }
                    else {
                        createSeminarFromContract(contract, function (err, seminar) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                seminars.push(seminar);
                                callback();
                            }
                        });
                    }
                });
            }, function(err) {
                if(err) {
                    log.error('Reading of seminar data aborted due to unexpected error: '+err);
                }
                else {
                    callback(err, seminars);
                }
            });
        }
    };

    /**
     * Returns a seminar object to the callback initialized with the data from the contract at the given address
     * @param address
     * @param callback
     */
    var getSeminarAtAddress = function(address, callback) {
        seminarContract.at(address, function(error, contract) {
            if (error) { throw error; }
            createSeminarFromContract(contract, callback);
        });
    }

    /**
     * Initializes a seminar object from the given contract
     * @param contract
     * @param callback
     */
    function createSeminarFromContract(contract, callback) {
        var seminar = {};
        async.parallel({
            id: function(callback){
                    contract.id( eris.convertibleCallback(callback, eris.hex2str) );
                },
            name: function(callback){
                contract.name( eris.convertibleCallback(callback, eris.hex2str) );
            },
            member: function(callback){
                contract.member( eris.convertibleCallback(callback, eris.hex2str) );
            }
        },
        function(err, results) {
            if(err) { callback(err, seminar) }
            seminar = results;
            seminar.contractAddress = contract.address;
            callback(null, seminar);
        });
    }

    module.exports = {
        'init': init,
        'events': events,
        'listen': chainEvents,
        'addSeminar': addSeminar,
        'getSeminars': getSeminars,
        'getSeminarAtAddress': getSeminarAtAddress
    }

}());
