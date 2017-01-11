
var loki = require('lokijs');
var EventEmitter = require('events');
var util = require('util');
var logger = require('./eris-logger');
var chain = require('./hello-chain');

(function() {

    var log = logger.getLogger('eris.hello.db');

    // Set up event emitter
    var events = {NEW_SEMINAR: 'newSeminar'};
    function DbEventEmitter() {
        EventEmitter.call(this);
    }
    util.inherits(DbEventEmitter, EventEmitter);
    var dbEventEmitter = new DbEventEmitter();

    // Set up Loki DB
    _db = new loki();
    _collection = _db.addCollection('seminars', {indices: ['id', 'buyer', 'seller', 'amount']});
    _collection.ensureUniqueIndex('contractAddress');

    // Register for events from chain module
    chain.listen.on(chain.events.NEW_SEMINAR, function (address, id, buyer, seller, amount) {
        log.info('New seminar detected ('+id+':'+buyer+':'+seller+':'+amount+') with address: '+address);
        // Loading seminar freshly from chain as there might be more data than conveyed in the event
        chain.getSeminarAtAddress(address, function(err, seminar) {
            if(err) { throw err; }
            log.debug('Performing DB insert for new seminar with address '+seminar.contractAddress)
            _collection.insert(seminar);
            // emit two events! One carries the ID of the seminar, so it can be specifically detected
            dbEventEmitter.emit(events.NEW_SEMINAR, seminar);
            dbEventEmitter.emit(events.NEW_SEMINAR+'_'+seminar.id, seminar);
        });
    })

    /**
     * @param library
     * @param callback
     */
    function loadSeminars(callback) {
        chain.getSeminars( function(error, seminars) {
            log.info('Storing '+seminars.length+' seminars from chain in DB.');
            _collection.removeDataOnly();
            _collection.insert(seminars);
            callback(null);
        });
    }

    /**
     * Refreshes the DB
     * @param callback
     */
    function refresh(callback) {
        loadSeminars(callback);
    }

    function getSeminar(id) {
        log.debug('Retrieving seminar from DB for ID: ' + id);
        return _collection.findOne({'id': id});
    }

    function getSeminars(buyer, seller) {
        log.debug('Retrieving seminars from DB using parameters buyer: '+buyer+', seller: '+seller);
        var queryParams = createQuery(buyer, seller);
        // Use AND for multiple query params
        if (queryParams.length > 1) {
            return _collection.find({'$and': queryParams});
        }
        else if (queryParams.length == 1) {
            return _collection.find(queryParams[0]);
        }
        else {
            // for 'undefined' query all documents in the collection are returned
            return _collection.find();
        }
    }

    function addSeminar(seminar, callback) {
        // TODO check if seminar exists in DB
        chain.addSeminar(seminar, callback);
    }

    /*
        Helper method to create a query object for LokiJS' search
     */
    function createQuery(buyer, seller) {
        var queryParams = [];
        if (buyer) {
            queryParams.push({'buyer': buyer});
        }
        if (seller) {
            queryParams.push({'seller': seller});
        }
        return queryParams;
    }

    module.exports = {
        'events': events,
        'listen': dbEventEmitter,
        'refresh': refresh,
        'getSeminar': getSeminar,
        'getSeminars': getSeminars,
        'addSeminar': addSeminar
    };

}());
