(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).standalone = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process,global,setImmediate){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];

        var iter = _keyIterator(object);
        var key, completed = 0;

        while ((key = iter()) != null) {
            completed += 1;
            iterator(object[key], key, only_once(done));
        }

        if (completed === 0) callback(null);

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        arr = arr || [];
        var results = _isArrayLike(arr) ? [] : {};
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    async.transform = function (arr, memo, iterator, callback) {
        if (arguments.length === 3) {
            callback = iterator;
            iterator = memo;
            memo = _isArray(arr) ? [] : {};
        }

        async.eachOf(arr, function(v, k, cb) {
            iterator(memo, v, k, cb);
        }, function(err) {
            callback(err, memo);
        });
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, concurrency, callback) {
        if (typeof arguments[1] === 'function') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = remainingTasks;
        }

        var results = {};
        var runningTasks = 0;

        var hasError = false;

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            if (hasError) return;
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    hasError = true;

                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return runningTasks < concurrency && _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                runningTasks++;
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    runningTasks++;
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback.apply(null, [null].concat(args));
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;

                var removed = false;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    _arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                while(!q.paused && workers < q.concurrency && q.tasks.length){

                    var tasks = q.payload ?
                        q.tasks.splice(0, q.payload) :
                        q.tasks.splice(0, q.tasks.length);

                    var data = _map(tasks, function (task) {
                        return task.data;
                    });

                    if (q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    workersList.push(tasks[0]);
                    var cb = only_once(_next(q, tasks));
                    worker(data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        var has = Object.prototype.hasOwnProperty;
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (has.call(memo, key)) {   
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (has.call(queues, key)) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)

},{"_process":2,"timers":3}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":2,"timers":3}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistDraggEvent = 'onChecklistDrag';
{
    var ChecklistSelected_1 = (function () {
        function ChecklistSelected_1() {
            this.index = 0;
            this.dragId = 0;
            this.isChanged = false;
        }
        return ChecklistSelected_1;
    }());
    var ChecklistEditBindings = {
        ngDisabled: '<?',
        pipChanged: '=?',
        pipDraggable: '<?',
        pipOptions: '=',
        pipScrollContainer: '<?',
        pipRebind: '<?'
    };
    var ChecklistEditBindingsChanges = (function () {
        function ChecklistEditBindingsChanges() {
        }
        return ChecklistEditBindingsChanges;
    }());
    var ChecklistEditController = (function () {
        ChecklistEditController.$inject = ['$element', '$timeout', '$document', '$rootScope'];
        function ChecklistEditController($element, $timeout, $document, $rootScope) {
            "ngInject";
            var _this = this;
            this.$element = $element;
            this.$timeout = $timeout;
            this.$document = $document;
            this.$rootScope = $rootScope;
            $element.addClass('pip-checklist-edit');
            if (!this.pipOptions || !_.isArray(this.pipOptions)) {
                this.pipOptions = [];
            }
            this.selected = new ChecklistSelected_1();
            this.selected.drag = this.pipDraggable;
            this.selected.dragInit = this.pipDraggable;
            this.selected.id = this.now();
            this.generateList(this.pipOptions);
            this._debounceChange = _.debounce(function () {
                _this.onChecklistChange();
            }, 200);
        }
        ChecklistEditController.prototype.$onChanges = function (changes) {
            if (this.toBoolean(this.pipRebind)) {
                if (changes.pipOptions && changes.pipOptions.currentValue) {
                    if (!angular.equals(this.pipOptions, changes.pipOptions.currentValue)) {
                        if (!this.selected.isChanged) {
                            this.generateList(changes.pipOptions.currentValue);
                        }
                        else {
                            this.selected.isChanged = false;
                        }
                    }
                }
                if (changes.pipDraggable && changes.pipDraggable.currentValue) {
                    this.pipDraggable = changes.pipDraggable.currentValue;
                }
            }
        };
        ChecklistEditController.prototype.toBoolean = function (value) {
            if (value == null) {
                return false;
            }
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        ChecklistEditController.prototype.getCaret = function (el) {
            if (el.selectionStart) {
                return el.selectionStart;
            }
            else if (this.$document.selection) {
                el.focus();
                var r = this.$document.selection.createRange();
                if (r == null) {
                    return 0;
                }
                var re = el.createTextRange(), rc = re.duplicate();
                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);
                return rc.text.length;
            }
            return 0;
        };
        ChecklistEditController.prototype.setSelectionRange = function (input, selectionStart, selectionEnd) {
            if (input.setSelectionRange) {
                input.focus();
                input.setSelectionRange(selectionStart, selectionEnd);
            }
            else if (input.createTextRange) {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd('character', selectionEnd);
                range.moveStart('character', selectionStart);
                range.select();
            }
        };
        ChecklistEditController.prototype.setCaretToPos = function (input, pos) {
            this.setSelectionRange(input, pos, pos);
        };
        ChecklistEditController.prototype.addItem = function (text, index) {
            var newItem = this.getNewItem(text, false);
            if (index > -1) {
                this.selected.index = index;
            }
            if (this.checklistContent.length < 2) {
                this.checklistContent.unshift(newItem);
            }
            else {
                this.checklistContent.splice(this.selected.index + 1, 0, newItem);
            }
            this.selected.index += 1;
            this.setFocus(this.selected.index);
            this._debounceChange();
        };
        ChecklistEditController.prototype.updateContents = function () {
            this.selected.isChanged = true;
            var content = [];
            _.each(this.checklistContent, function (item) {
                if (!item.empty) {
                    content.push({
                        checked: item.checked,
                        text: item.text
                    });
                }
            });
            this.pipOptions = content;
        };
        ChecklistEditController.prototype.setFocus = function (index, toPos) {
            var _this = this;
            if (index > -1) {
                setTimeout(function () {
                    var nextElement = angular.element('#check-item-text-' + _this.selected.id + '-' + index);
                    if (nextElement) {
                        nextElement.focus();
                        if (toPos !== undefined && nextElement[0]) {
                            _this.setCaretToPos(nextElement[0], toPos);
                        }
                    }
                }, 50);
            }
        };
        ChecklistEditController.prototype.getNewItem = function (text, isEmpty) {
            var newItem = {
                checked: false,
                text: text || '',
                empty: isEmpty
            };
            return newItem;
        };
        ChecklistEditController.prototype.now = function () {
            return +new Date;
        };
        ChecklistEditController.prototype.clearList = function () {
            this.selected.index = 0;
            this.checklistContent = [];
            this.checklistContent.push(this.getNewItem('', true));
        };
        ChecklistEditController.prototype.generateList = function (content) {
            var _this = this;
            if (!content || content.length < 1) {
                this.clearList();
            }
            else {
                this.checklistContent = [];
                _.each(content, function (item) {
                    _this.checklistContent.push(item);
                });
                this.checklistContent.push(this.getNewItem('', true));
            }
        };
        ChecklistEditController.prototype.setWidth100 = function () {
            var element = angular.element('#check-item-' + +this.selected.id + '-' + this.selected.index);
            element.css("width", 'none');
            element.css("max-width", 'none');
        };
        ChecklistEditController.prototype.setWidth = function () {
            if (this.isWidth)
                return;
            var elementEtalon = angular.element('#check-item-empty-' + this.selected.id);
            var value = elementEtalon.width();
            var element = angular.element('#check-item-' + this.selected.id + '-' + this.selected.index);
            if (element) {
                element.css("width", value + 'px');
                element.css("max-width", value + 'px');
            }
        };
        ChecklistEditController.prototype.onItemFocus = function (index) {
            if (this.ngDisabled)
                return;
            this.selected.index = index;
        };
        ChecklistEditController.prototype.isSelectedItem = function (index) {
            var empty;
            try {
                empty = this.checklistContent[index].empty;
            }
            catch (err) {
                empty = true;
            }
            return this.selected.index == index && this.pipDraggable && !empty;
        };
        ChecklistEditController.prototype.onAddItem = function () {
            this.addItem('', this.selected.index - 1);
        };
        ChecklistEditController.prototype.onChangeItem = function (index) {
            if (index > -1 && this.checklistContent[index] && this.checklistContent[index].empty) {
                if (this.checklistContent[index].empty) {
                    this.checklistContent[index].empty = false;
                    this.checklistContent.push(this.getNewItem('', true));
                }
            }
            this._debounceChange();
        };
        ChecklistEditController.prototype.onClick = function ($event, index) {
            if (this.ngDisabled) {
                return;
            }
            this.selected.index = index;
        };
        ChecklistEditController.prototype.onTextAreaClick = function ($event, index) {
            if (this.ngDisabled) {
                return;
            }
            this.selected.index = index;
        };
        ChecklistEditController.prototype.onDropComplete = function (placeIndex, obj, $event, componentId) {
            if (this.selected.id != componentId) {
                return;
            }
            if (!this.selected.drag) {
                return;
            }
            var index = placeIndex;
            var tmpIndex = this.selected.index;
            var checklist = _.cloneDeep(this.checklistContent);
            if (!(tmpIndex == 0 && placeIndex == 1)) {
                if (tmpIndex > index) {
                    if (index > checklist.length - 1) {
                        index = checklist.length - 1;
                    }
                    for (var i_1 = 0; i_1 < tmpIndex - index; i_1++) {
                        checklist[tmpIndex - i_1] = checklist[tmpIndex - i_1 - 1];
                    }
                    checklist[index] = obj;
                }
                if (tmpIndex < index) {
                    index -= 1;
                    for (var i = 0; i < index - tmpIndex; i++) {
                        checklist[tmpIndex + i] = checklist[tmpIndex + i + 1];
                    }
                    checklist[index] = obj;
                }
                this.selected.index = index;
            }
            this.checklistContent = checklist;
            this._debounceChange();
        };
        ChecklistEditController.prototype.onMove = function () {
            this.setWidth();
            this.isWidth = true;
        };
        ChecklistEditController.prototype.onStop = function (id) {
            var _this = this;
            this.$timeout(function () {
                _this.selected.drag = _this.selected.dragInit;
                _this.selected.dragId = 0;
            }, 50);
            if (this.isWidth) {
                this.setWidth100();
                this.isWidth = false;
            }
        };
        ChecklistEditController.prototype.onStart = function (id) {
            this.selected.isChanged = true;
            if (id && id != this.selected.dragId) {
                this.selected.drag = false;
            }
        };
        ChecklistEditController.prototype.onDownDragg = function (item) {
            if (this.pipDraggable && this.checklistContent.length > 2 && !item.empty) {
                this.$rootScope.$broadcast(exports.ChecklistDraggEvent);
                this.selected.dragId = this.selected.id;
            }
        };
        ChecklistEditController.prototype.onDeleteItem = function (index, item) {
            if (this.checklistContent.length == 1) {
                this.checklistContent[0].text = '';
                this.checklistContent[0].checked = false;
                this.checklistContent[0].empty = true;
                this.selected.index = 0;
            }
            else {
                if (index >= 0 && index <= this.checklistContent.length) {
                    this.checklistContent.splice(index, 1);
                }
                else {
                    return;
                }
            }
            if (this.selected.index >= this.checklistContent.length) {
                this.selected.index = this.checklistContent.length - 1;
            }
            this.setFocus(this.selected.index, 0);
            this._debounceChange();
        };
        ChecklistEditController.prototype.onChecked = function (item) {
            this._debounceChange();
        };
        ChecklistEditController.prototype.onChecklistChange = function () {
            var _this = this;
            this.updateContents();
            if (this.pipChanged) {
                this.$timeout(function () {
                    _this.pipChanged(_this.pipOptions);
                }, 0);
            }
        };
        ChecklistEditController.prototype.onTextareaKeyDown = function ($event, index, item) {
            if (this.ngDisabled)
                return;
            if (this.selected.index == -1)
                return;
            var textareaLength;
            var posCaret;
            if ($event && $event.target) {
                posCaret = this.getCaret($event.target);
                if ($event.target['value'] !== undefined) {
                    textareaLength = $event.target['value'].length;
                }
            }
            if (this.selected.index > 0 && item.text != '' && posCaret == 0 && $event.keyCode == 8 && !$event.ctrlKey && !$event.shiftKey) {
                if (!item.empty) {
                    var position = this.checklistContent[this.selected.index - 1].text.length;
                    this.checklistContent[this.selected.index - 1].text = this.checklistContent[this.selected.index - 1].text + item.text;
                    this.selected.index -= 1;
                    this.checklistContent.splice(this.selected.index + 1, 1);
                    this._debounceChange();
                    this.setFocus(this.selected.index, position);
                }
                if ($event) {
                    $event.stopPropagation();
                }
                return false;
            }
            if (item.text == '' && ($event.keyCode == 8 || $event.keyCode == 46) && !$event.ctrlKey && !$event.shiftKey) {
                if (!item.empty) {
                    this.onDeleteItem(index, item);
                }
                if ($event) {
                    $event.stopPropagation();
                }
                return false;
            }
            if (($event.keyCode == 13 || $event.keyCode == 45) && !$event.ctrlKey && !$event.shiftKey) {
                if (posCaret !== undefined && posCaret == 0) {
                    if (this.selected.index > 0) {
                        this.addItem('', this.selected.index - 1);
                    }
                    else {
                        this.selected.index = -1;
                        this.addItem('', -1);
                    }
                    if ($event) {
                        $event.stopPropagation();
                    }
                    if ($event) {
                        $event.preventDefault();
                    }
                    return false;
                }
                if (textareaLength && posCaret && textareaLength == posCaret) {
                    if (!item.empty) {
                        this.addItem('', this.selected.index);
                    }
                    if ($event) {
                        $event.stopPropagation();
                    }
                    if ($event) {
                        $event.preventDefault();
                    }
                    return false;
                }
                if (textareaLength && posCaret && textareaLength > posCaret) {
                    if (!item.empty) {
                        var valueCurrent = void 0;
                        var newItem = void 0;
                        valueCurrent = item.text.substring(0, posCaret);
                        newItem = item.text.substring(posCaret);
                        item.text = valueCurrent;
                        this.addItem(newItem, this.selected.index);
                        this.setFocus(this.selected.index, 0);
                    }
                    if ($event) {
                        $event.stopPropagation();
                    }
                    if ($event) {
                        $event.preventDefault();
                    }
                    return false;
                }
                if ($event) {
                    $event.preventDefault();
                }
                return false;
            }
            if ((posCaret === 0 || posCaret == textareaLength) && this.checklistContent.length > 1 && $event.keyCode == 38 && !$event.ctrlKey && !$event.shiftKey) {
                if ($event) {
                    $event.stopPropagation();
                }
                if ($event) {
                    $event.preventDefault();
                }
                if (posCaret !== undefined && textareaLength !== undefined && posCaret == 0) {
                    if (this.selected.index == 0) {
                        this.selected.index = this.checklistContent.length - 1;
                        var position = this.checklistContent[this.selected.index].text.length;
                        this.setFocus(this.selected.index, position);
                    }
                    else {
                        this.selected.index -= 1;
                        var position = this.checklistContent[this.selected.index].text.length;
                        this.setFocus(this.selected.index, position);
                    }
                }
                else {
                    this.setFocus(this.selected.index, 0);
                }
                return false;
            }
            if ((posCaret === 0 || posCaret == textareaLength) && this.checklistContent.length > 1 && $event.keyCode == 40 && !$event.ctrlKey && !$event.shiftKey) {
                if ($event) {
                    $event.stopPropagation();
                }
                if ($event) {
                    $event.preventDefault();
                }
                if (posCaret !== undefined && textareaLength !== undefined && posCaret == textareaLength) {
                    if (this.selected.index >= this.checklistContent.length - 1) {
                        this.selected.index = 0;
                        this.setFocus(this.selected.index, 0);
                    }
                    else {
                        this.selected.index += 1;
                        this.setFocus(this.selected.index, 0);
                    }
                }
                else {
                    this.setFocus(this.selected.index, textareaLength);
                }
                return false;
            }
            if (!item.empty && $event.keyCode == 46 && $event.ctrlKey && !$event.shiftKey) {
                if ($event) {
                    $event.stopPropagation();
                }
                if ($event) {
                    $event.preventDefault();
                }
                this.onDeleteItem(index, item);
                return false;
            }
            if ($event.keyCode == 32 && $event.ctrlKey && !$event.shiftKey) {
                if ($event) {
                    $event.stopPropagation();
                }
                if ($event) {
                    $event.preventDefault();
                }
                if (item) {
                    item.checked = !item.checked;
                    this._debounceChange();
                }
                return false;
            }
        };
        return ChecklistEditController;
    }());
    var ChecklistEdit = {
        bindings: ChecklistEditBindings,
        templateUrl: 'checklist_edit/ChecklistEdit.html',
        controller: ChecklistEditController
    };
    angular.module("pipChecklistEdit", ['pipComposite.Templates', 'pipBehaviors'])
        .component('pipChecklistEdit', ChecklistEdit);
}
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var ChecklistViewBindings = {
        ngDisabled: '<?',
        pipChanged: '=?',
        pipOptions: '=',
        pipRebind: '<?'
    };
    var ChecklistViewBindingsChanges = (function () {
        function ChecklistViewBindingsChanges() {
        }
        return ChecklistViewBindingsChanges;
    }());
    var ChecklistViewController = (function () {
        ChecklistViewController.$inject = ['$element'];
        function ChecklistViewController($element) {
            "ngInject";
            this.$element = $element;
            this.isChanged = false;
            if (!this.pipOptions || !_.isArray(this.pipOptions)) {
                this.pipOptions = [];
            }
            $element.addClass('pip-checklist-view');
        }
        ChecklistViewController.prototype.$onChanges = function (changes) {
            if (this.toBoolean(this.pipRebind)) {
                if (changes.pipOptions && changes.pipOptions.currentValue) {
                    if (!angular.equals(this.pipOptions, changes.pipOptions.currentValue)) {
                        if (!this.isChanged) {
                            this.pipOptions = changes.pipOptions.currentValue;
                        }
                        else {
                            this.isChanged = false;
                        }
                    }
                }
            }
        };
        ChecklistViewController.prototype.toBoolean = function (value) {
            if (value == null)
                return false;
            if (!value)
                return false;
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        ChecklistViewController.prototype.onChecklistChange = function () {
            this.isChanged = true;
            if (this.pipChanged) {
                this.pipChanged(this.pipOptions);
            }
        };
        ChecklistViewController.prototype.onClick = function ($event, item) {
            if ($event) {
                $event.stopPropagation();
            }
            if (this.ngDisabled) {
                return;
            }
            this.onChecklistChange();
        };
        return ChecklistViewController;
    }());
    var ChecklistView = {
        bindings: ChecklistViewBindings,
        templateUrl: 'checklist_view/ChecklistView.html',
        controller: ChecklistViewController
    };
    angular.module("pipChecklistView", ['pipComposite.Templates'])
        .component('pipChecklistView', ChecklistView);
}
},{}],6:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ChecklistEdit_1 = require("../checklist_edit/ChecklistEdit");
var CompositeFocused_1 = require("../utilities/CompositeFocused");
var data_1 = require("../data");
var async = require('async');
exports.CompositeEmptyEvent = 'pipCompositeNotEmpty';
exports.CompositeAddItemEvent = 'pipAddContent';
exports.CompositeNotEmptyEvent = 'pipCompositeNotEmpty';
var CompositeAddItem = (function () {
    function CompositeAddItem() {
    }
    return CompositeAddItem;
}());
exports.CompositeAddItem = CompositeAddItem;
var ConfigTranslations = function (pipTranslate) {
    if (pipTranslate) {
        (pipTranslate).setTranslations('en', {
            'COMPOSITE_TITLE': 'What\'s on your mind?',
            'COMPOSITE_PLACEHOLDER': 'Type text ...',
            'COMPOSITE_START_TIME': 'Start time',
            'COMPOSITE_END_TIME': 'End time'
        });
        (pipTranslate).setTranslations('ru', {
            'COMPOSITE_TITLE': 'Что у вас на уме?',
            'COMPOSITE_PLACEHOLDER': 'Введите текст ...',
            'COMPOSITE_START_TIME': 'Время начала',
            'COMPOSITE_END_TIME': 'Время окончания'
        });
    }
};
ConfigTranslations.$inject = ['pipTranslate'];
var CompositeControl = (function () {
    function CompositeControl() {
    }
    return CompositeControl;
}());
exports.CompositeControl = CompositeControl;
var SenderEvent = (function () {
    function SenderEvent() {
    }
    return SenderEvent;
}());
var CompositeContent = (function (_super) {
    __extends(CompositeContent, _super);
    function CompositeContent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CompositeContent;
}(data_1.ContentBlock));
exports.CompositeContent = CompositeContent;
var CompositeBlockTypes = (function () {
    function CompositeBlockTypes() {
    }
    return CompositeBlockTypes;
}());
CompositeBlockTypes.Text = 'text';
CompositeBlockTypes.Pictures = 'pictures';
CompositeBlockTypes.Checklist = 'checklist';
CompositeBlockTypes.Documents = 'documents';
CompositeBlockTypes.Location = 'location';
CompositeBlockTypes.Time = 'time';
CompositeBlockTypes.SecondaryBlock = ['checklist', 'documents', 'location', 'time'];
CompositeBlockTypes.PrimaryBlock = ['text', 'pictures'];
CompositeBlockTypes.All = ['text', 'pictures', 'checklist', 'documents', 'location', 'time'];
exports.CompositeBlockTypes = CompositeBlockTypes;
{
    var CompositeSelected_1 = (function () {
        function CompositeSelected_1() {
            this.index = 0;
            this.drag = true;
            this.dragId = 0;
            this.isChanged = false;
        }
        return CompositeSelected_1;
    }());
    var CompositeEditBindings = {
        ngDisabled: '<?',
        pipChanged: '=?',
        pipCreated: '&?',
        pipContents: '=?',
        compositeId: '<?pipCompositeId',
        pipCompositePlaceholder: '<?',
        pipScrollContainer: '<?',
        addedContent: '<?pipAddedContent',
        pipRebind: '<?'
    };
    var CompositeEditBindingsChanges = (function () {
        function CompositeEditBindingsChanges() {
        }
        return CompositeEditBindingsChanges;
    }());
    var CompositeEditController = (function () {
        CompositeEditController.$inject = ['$q', '$element', '$timeout', '$document', '$rootScope', 'pipTranslate'];
        function CompositeEditController($q, $element, $timeout, $document, $rootScope, pipTranslate) {
            "ngInject";
            var _this = this;
            this.$q = $q;
            this.$element = $element;
            this.$timeout = $timeout;
            this.$document = $document;
            this.$rootScope = $rootScope;
            this.pipTranslate = pipTranslate;
            this.defaultPlaceholder = 'COMPOSITE_PLACEHOLDER';
            this.CONTENT_TYPES = CompositeBlockTypes.All;
            this.selected = new CompositeSelected_1();
            this.selected.id = this.now();
            $element.addClass('pip-composite-edit');
            this.generateList(this.pipContents);
            this.setPlaceholder();
            this.control = {
                save: function (successCallback, errorCallback) {
                    _this.saveContent(successCallback, errorCallback);
                },
                abort: function () {
                    _this.abortContent();
                },
                error: null
            };
            this.executeCallback();
            this.cleanupCompositeEvent = this.$rootScope.$on(exports.CompositeAddItemEvent, function (event, args) {
                if (_this.compositeId) {
                    if (args.id && args.id == _this.compositeId) {
                        _this.addItem(args.type);
                    }
                }
                else {
                    _this.addItem(args.type);
                }
            });
            this.cleanupChecklistDraggEvent = this.$rootScope.$on(ChecklistEdit_1.ChecklistDraggEvent, function () {
                _this.selected.drag = false;
                _this.$timeout(function () {
                    _this.selected.drag = false;
                }, 0);
            });
            this.cleanupCompositeFocusedEvent = this.$rootScope.$on(CompositeFocused_1.CompositeFocusedEvent, function () {
                if (_this.isFirst) {
                    _this.$timeout(function () {
                        var nextElement = angular.element('#composite-item-text-' + _this.selected.id + '-0');
                        if (nextElement && !nextElement.is(':focus')) {
                            nextElement.focus();
                        }
                    }, 50);
                }
            });
            this._debounceChange = _.debounce(function () {
                _this.onCompositeChange();
            }, 200);
        }
        CompositeEditController.prototype.abortContent = function () {
            _.each(this.compositeContent, function (item) {
                if (item.pictures && item.pictures.abort) {
                    item.pictures.abort();
                }
                else if (item.documents && item.documents.abort) {
                    item.documents.abort();
                }
            });
        };
        CompositeEditController.prototype.getPicIdsArray = function (data) {
            var result = [];
            _.each(data, function (item) {
                if (item.id) {
                    result.push(item.id);
                }
            });
            return result;
        };
        CompositeEditController.prototype.saveContent = function (successCallback, errorCallback, abortFirstError) {
            var _this = this;
            var content;
            content = _.cloneDeep(this.compositeContent);
            var saveFirstError = null;
            async.eachOf(this.compositeContent, function (item, index, callback) {
                if (item.pictures && item.pictures.save) {
                    item.pictures.save(function (data) {
                        delete item.picIds;
                        item.pic_ids = _this.getPicIdsArray(data);
                        callback();
                    }, function (error) {
                        saveFirstError = saveFirstError ? saveFirstError : error;
                        if (abortFirstError) {
                            callback(error);
                        }
                        else {
                            callback();
                        }
                    });
                }
                else if (item.documents && item.documents.save) {
                    item.documents.save(function (data) {
                        item.docs = data;
                        callback();
                    }, function (error) {
                        saveFirstError = saveFirstError ? saveFirstError : error;
                        if (abortFirstError) {
                            callback(error);
                        }
                        else {
                            callback();
                        }
                    });
                }
                else {
                    callback();
                }
            }, function (error, result) {
                if (error || saveFirstError) {
                    if (abortFirstError) {
                        _this.abortContent();
                    }
                    _this.compositeContent = content;
                    if (errorCallback)
                        errorCallback(error);
                }
                else {
                    _this.onCompositeChange();
                    if (successCallback)
                        successCallback(_this.pipContents);
                }
            });
        };
        CompositeEditController.prototype.$onDestroy = function () {
            if (angular.isFunction(this.cleanupCompositeEvent)) {
                this.cleanupCompositeEvent();
            }
            if (angular.isFunction(this.cleanupChecklistDraggEvent)) {
                this.cleanupChecklistDraggEvent();
            }
            if (angular.isFunction(this.cleanupCompositeFocusedEvent)) {
                this.cleanupCompositeFocusedEvent();
            }
        };
        CompositeEditController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
                if (this.pipRebind && changes.pipContents && _.isArray(changes.pipContents.currentValue)) {
                    if (!this.selected.isChanged || (this.pipContents
                        && this.pipContents.length != this.compositeContent.length)) {
                        this.generateList(this.pipContents);
                        this.selected.isChanged = false;
                    }
                }
            }
            if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                this.ngDisabled = changes.ngDisabled.currentValue;
            }
            if (changes.pipCompositePlaceholder && changes.pipCompositePlaceholder.currentValue !== changes.pipCompositePlaceholder.previousValue) {
                this.pipCompositePlaceholder = changes.pipCompositePlaceholder.currentValue;
                this.setPlaceholder();
            }
        };
        CompositeEditController.prototype.executeCallback = function () {
            if (this.pipCreated) {
                this.pipCreated({
                    event: this.control
                });
            }
        };
        CompositeEditController.prototype.toBoolean = function (value) {
            if (value == null) {
                return false;
            }
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        CompositeEditController.prototype.getEmptyItem = function () {
            var emptyItem = {
                empty: true,
                id: this.getId(),
                type: 'text',
                text: '', docs: [], pic_ids: [], loc_pos: null, loc_name: '',
                start: null, end: null, checklist: []
            };
            return emptyItem;
        };
        CompositeEditController.prototype.setPlaceholder = function () {
            this.compositePlaceholder =
                (this.pipCompositePlaceholder === undefined || this.pipCompositePlaceholder === null) ?
                    this.pipTranslate.translate(this.defaultPlaceholder) :
                    this.pipTranslate.translate(this.pipCompositePlaceholder);
        };
        CompositeEditController.prototype.addItem = function (contentType, value) {
            if (_.indexOf(this.CONTENT_TYPES, contentType) < 0)
                return;
            var newItem = {
                id: this.getId(),
                type: contentType,
                text: contentType == 'text' ? value : '',
                docs: contentType == 'documents' && value ? value : [],
                pic_ids: contentType == 'pictures' && value ? value : [],
                loc_pos: contentType == 'location' && value ? value.loc_pos : null,
                loc_name: contentType == 'location' && value ? value.loc_name : '',
                start: contentType == 'time' && value ? value.start : null,
                end: contentType == 'time' && value ? value.end : null,
                checklist: contentType == 'checklist' && value ? value : []
            };
            var index = _.findIndex(this.compositeContent, { id: this.selected.index });
            index = index < 0 ? 0 : index;
            if (this.compositeContent.length == 1 && this.compositeContent[0].empty) {
                this.compositeContent[0] = newItem;
            }
            else {
                this.compositeContent.splice(index + 1, 0, newItem);
                index += 1;
            }
            this.selected.index = newItem.id;
            this.onSelect();
            setTimeout(this.scrollTo(this.pipScrollContainer, '#composite-item-' + this.selected.id + '-' + index), 1000);
            this.isFirst = false;
            this.setToolbar();
            this._debounceChange();
        };
        CompositeEditController.prototype.getId = function () {
            var id = -1;
            _.each(this.compositeContent, function (item) {
                if (id < item.id)
                    id = item.id;
            });
            return id + 1;
        };
        CompositeEditController.prototype.scrollTo = function (parentElement, childElement) {
            if (!parentElement || !childElement) {
                return;
            }
            setTimeout(function () {
                if (!$(childElement).position()) {
                    return;
                }
                var modDiff = Math.abs($(parentElement).scrollTop() - $(childElement).position().top);
                if (modDiff < 20) {
                    return;
                }
                var scrollTo = $(parentElement).scrollTop() + ($(childElement).position().top - 20);
                $(parentElement).animate({
                    scrollTop: scrollTo + 'px'
                }, 300);
            }, 100);
        };
        CompositeEditController.prototype.getPicIds = function (ids) {
            var result = [];
            _.each(ids, function (id) {
                var item = {
                    id: id
                };
                result.push(item);
            });
            return result;
        };
        CompositeEditController.prototype.generateList = function (content) {
            var _this = this;
            if (!content || content.length < 1) {
                this.clearList();
                return;
            }
            else {
                this.compositeContent = [];
                _.each(content, function (item) {
                    item.id = _this.getId();
                    item.picIds = item.pic_ids ? _this.getPicIds(item.pic_ids) : null;
                    _this.compositeContent.push(item);
                });
                this.isFirst = false;
            }
            this.setToolbar();
        };
        CompositeEditController.prototype.setToolbar = function () {
            if (this.compositeContent.length > 2) {
                return;
            }
            this.$rootScope.$emit(exports.CompositeNotEmptyEvent, !this.isFirst);
        };
        CompositeEditController.prototype.clearList = function () {
            this.compositeContent = [];
            this.compositeContent.push(this.getEmptyItem());
            this.isFirst = true;
        };
        CompositeEditController.prototype.now = function () {
            return +new Date;
        };
        CompositeEditController.prototype.updateContents = function () {
            this.selected.isChanged = true;
            this.pipContents = this.compositeContent;
        };
        CompositeEditController.prototype.getParentIndex = function (el) {
            if (el.length < 1)
                return null;
            var elParent = el.parent();
            if (elParent[0] && elParent[0].id && elParent[0].id.indexOf('composite-item-' + this.selected.id) > -1) {
                var strs = elParent[0].id.split('-');
                var parentIndex = parseInt(strs[strs.length - 1], 10);
                return parentIndex;
            }
            else {
                return this.getParentIndex(elParent);
            }
        };
        CompositeEditController.prototype.isActiveChecklist = function (obj) {
            return obj.id == this.selected.id;
        };
        CompositeEditController.prototype.onKeyUp = function ($event) {
            var _this = this;
            if ($event.keyCode == 9) {
                this.$timeout(function () {
                    var focusedElement = angular.element(_this.$document[0].activeElement);
                    var parentIndex = _this.getParentIndex(focusedElement);
                    if (parentIndex != null) {
                        _this.selected.index = parentIndex;
                    }
                    _this.selected.index = _this.compositeContent[parentIndex].id;
                }, 50);
            }
        };
        CompositeEditController.prototype.onKeyDown = function ($event, index, item) {
            if (this.ngDisabled) {
                return;
            }
            if (item && !item.empty && $event.keyCode == 46 && !$event.ctrlKey && $event.shiftKey) {
                if ($event) {
                    $event.stopPropagation();
                    $event.preventDefault();
                }
                if (index > -1) {
                    this.onDeleteItem(index);
                }
            }
        };
        CompositeEditController.prototype.onCompositeChange = function () {
            this.updateContents();
            if (this.pipChanged) {
                this.pipChanged(this.pipContents);
            }
        };
        CompositeEditController.prototype.onDeleteItem = function (index) {
            if (index < 0 || this.compositeContent.length == 0)
                return;
            if (this.compositeContent.length == 1) {
                this.compositeContent[0] = this.getEmptyItem();
                this.selected.index = this.compositeContent[0].id;
                this.onSelect(0);
                this.isFirst = true;
                this.setToolbar();
            }
            else {
                if (index >= 0 && index < this.compositeContent.length) {
                    this.compositeContent.splice(index, 1);
                }
                if (index == this.compositeContent.length) {
                    this.selected.index = this.compositeContent[this.compositeContent.length - 1].id;
                }
                else {
                    this.selected.index = this.compositeContent[index].id;
                }
                this.onSelect();
            }
            this.setToolbar();
            this._debounceChange();
        };
        CompositeEditController.prototype.onContentChange = function (obj) {
            if (obj && obj.empty && obj.text) {
                obj.empty = false;
                this.isFirst = false;
                this.setToolbar();
            }
            if (!this.ngDisabled) {
                this._debounceChange();
            }
        };
        CompositeEditController.prototype.isSelectedSection = function (index, obj) {
            return this.selected.index == obj.id && !obj.empty;
        };
        CompositeEditController.prototype.onDraggEnd = function () {
            this.selected.drag = true;
        };
        CompositeEditController.prototype.onStart = function (id) {
            if (id && id != this.selected.dragId) {
                this.selected.drag = false;
            }
        };
        CompositeEditController.prototype.onStop = function (id) {
            var _this = this;
            this.$timeout(function () {
                _this.selected.drag = true;
                _this.selected.dragId = 0;
            }, 500);
        };
        CompositeEditController.prototype.onDownDragg = function ($event, obj) {
            if (this.ngDisabled)
                return;
            this.selected.dragId = this.selected.id;
            this.selected.drag = true;
            this.selected.index = obj.id;
        };
        CompositeEditController.prototype.onClick = function ($event, index, obj) {
            if (this.ngDisabled) {
                return;
            }
            this.selected.event = 'onClick';
            if ($event && $event.target && $event.target.tagName &&
                ($event.target.tagName == 'INPUT' || $event.target.tagName == 'TEXTAREA')) {
                this.selected.index = obj.id;
                return;
            }
            if ((this.selected.index == obj.id && obj.type == 'checklist' && obj.checklist.length > 0) ||
                (this.selected.index == obj.id && obj.type == 'location')) {
                return;
            }
            this.selected.index = obj.id;
            this.onSelect();
        };
        CompositeEditController.prototype.onDropComplete = function (placeIndex, obj, event, componentId) {
            if (componentId != this.selected.id || !obj || !obj.type) {
                this.compositeContent = _.cloneDeep(this.pipContents);
                return;
            }
            var index = placeIndex;
            var tmpIndex = _.findIndex(this.compositeContent, { id: obj.id });
            var i;
            if (!(tmpIndex == 0 && placeIndex == 1)) {
                if (tmpIndex > index) {
                    if (index > this.compositeContent.length - 1)
                        index = this.compositeContent.length - 1;
                    for (i = 0; i < tmpIndex - index; i++) {
                        this.compositeContent[tmpIndex - i] = this.compositeContent[tmpIndex - i - 1];
                    }
                    this.compositeContent[index] = obj;
                }
                if (tmpIndex < index) {
                    index -= 1;
                    for (i = 0; i < index - tmpIndex; i++) {
                        this.compositeContent[tmpIndex + i] = this.compositeContent[tmpIndex + i + 1];
                    }
                    this.compositeContent[index] = obj;
                }
                this.selected.index = this.compositeContent[index].id;
            }
            this.onSelect();
            this._debounceChange();
        };
        CompositeEditController.prototype.onSelect = function (index) {
            var _this = this;
            if (!index) {
                index = _.findIndex(this.compositeContent, { id: this.selected.index });
            }
            if (index < 0) {
                return;
            }
            var item = this.compositeContent[index];
            if (_.isEmpty(item)) {
                return;
            }
            var nextElement;
            switch (item.type) {
                case 'pictures':
                    setTimeout(function () {
                        nextElement = angular.element('#composite-item-' + _this.selected.id + '-' + index + ' button.pip-picture-upload');
                        if (nextElement && !nextElement.is(':focus')) {
                            nextElement.focus();
                        }
                    }, 50);
                    break;
                case 'documents':
                    setTimeout(function () {
                        nextElement = angular.element('#composite-item-' + _this.selected.id + '-' + index + ' button.pip-document-upload');
                        if (nextElement && !nextElement.is(':focus')) {
                            nextElement.focus();
                        }
                    }, 50);
                    break;
                case 'location':
                    setTimeout(function () {
                        nextElement = angular.element('#composite-item-' + _this.selected.id + '-' + index + ' .pip-location-empty  button');
                        if (nextElement && !nextElement.is(':focus')) {
                            nextElement.focus();
                        }
                    }, 50);
                    break;
                case 'time':
                    break;
            }
        };
        return CompositeEditController;
    }());
    var CompositeEdit = {
        bindings: CompositeEditBindings,
        templateUrl: 'composite_edit/CompositeEdit.html',
        controller: CompositeEditController
    };
    angular.module("pipCompositeEdit", ['pipDocuments', 'pipLocations', 'pipPictures', 'pipDates', 'pipComposite.Templates'])
        .run(ConfigTranslations)
        .component('pipCompositeEdit', CompositeEdit);
}
},{"../checklist_edit/ChecklistEdit":4,"../data":15,"../utilities/CompositeFocused":22,"async":1}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CompositeEdit_1 = require("../composite_edit/CompositeEdit");
{
    var CompositeSummaryBindings = {
        pipContents: '<?',
        pipChecklistSize: '<?',
        pipTextSize: '<?',
        pipPrimaryBlockLimit: '<?',
        pipSecondaryBlockLimit: '<?',
        pipSecondaryBlockTypes: '<?',
        pipRebind: '<?'
    };
    var CompositeSummaryBindingsChanges = (function () {
        function CompositeSummaryBindingsChanges() {
        }
        return CompositeSummaryBindingsChanges;
    }());
    var CompositeSummaryController = (function () {
        CompositeSummaryController.$inject = ['$element'];
        function CompositeSummaryController($element) {
            "ngInject";
            this.$element = $element;
            this.disableControl = true;
            this.disabledChecklist = true;
            $element.addClass('pip-composite-summary');
            this.pipChecklistSize = this.pipChecklistSize ? this.pipChecklistSize : 0;
            this.pipTextSize = this.pipTextSize ? this.pipTextSize : 0;
            this.pipPrimaryBlockLimit = this.pipPrimaryBlockLimit === undefined || this.pipPrimaryBlockLimit === null ? -1 : this.pipPrimaryBlockLimit;
            this.pipSecondaryBlockLimit = this.pipSecondaryBlockLimit === undefined || this.pipSecondaryBlockLimit === null ? -1 : this.pipSecondaryBlockLimit;
            this.pipSecondaryBlockTypes = this.pipSecondaryBlockTypes && _.isArray(this.pipSecondaryBlockTypes) ? this.pipSecondaryBlockTypes : CompositeEdit_1.CompositeBlockTypes.SecondaryBlock;
            this.generateList(this.pipContents);
        }
        CompositeSummaryController.prototype.$onChanges = function (changes) {
            if (this.toBoolean(this.pipRebind)) {
                if (changes.pipContents && changes.pipContents.currentValue) {
                    if (!angular.equals(this.pipContents, changes.pipContents.currentValue)) {
                        this.generateList(this.pipContents);
                    }
                }
            }
        };
        CompositeSummaryController.prototype.getPicIds = function (ids) {
            var result = [];
            _.each(ids, function (id) {
                var item = {
                    id: id
                };
                result.push(item);
            });
            return result;
        };
        CompositeSummaryController.prototype.toBoolean = function (value) {
            if (value == null)
                return false;
            if (!value)
                return false;
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        CompositeSummaryController.prototype.limitChecklist = function (content, val) {
            if (!val)
                return;
            var ellapsed = {
                text: '...',
                checked: false
            };
            _.each(content, function (item) {
                if (item && item.type == CompositeEdit_1.CompositeBlockTypes.Checklist) {
                    var checklistLength = item.checklist.length;
                    item.checklist = _.take(item.checklist, val);
                    if (checklistLength > val) {
                        item.checklist.push(ellapsed);
                    }
                }
            });
        };
        ;
        CompositeSummaryController.prototype.selectSummary = function (content) {
            var _this = this;
            var result = [];
            var i;
            _.each(content, function (item) {
                if (_this.pipPrimaryBlockLimit >= 0 && i >= _this.pipPrimaryBlockLimit) {
                    return result;
                }
                if (_this.pipSecondaryBlockTypes.indexOf(item.type) < 0) {
                    result.push(item);
                    i += 1;
                }
            });
            return result;
        };
        CompositeSummaryController.prototype.selectSummarySecondary = function (content, types) {
            var i;
            var limit = this.pipSecondaryBlockLimit < 0 ? content.length : this.pipSecondaryBlockLimit;
            var result = [];
            for (i; i < content.length; i++) {
                if (types.indexOf(content[i].type) > -1) {
                    result.push(content[i]);
                    if (result.length >= limit) {
                        break;
                    }
                }
            }
            return result;
        };
        CompositeSummaryController.prototype.generateList = function (content) {
            var _this = this;
            if (!content || content.length < 1) {
                this.clearList();
                return;
            }
            else {
                var summaryContent = _.cloneDeep(content);
                var result = this.selectSummary(summaryContent);
                if (result.length == 0) {
                    result = this.selectSummarySecondary(summaryContent, this.pipSecondaryBlockTypes);
                }
                this.limitChecklist(result, this.pipChecklistSize);
                var id_1;
                _.each(result, function (item) {
                    item.id = id_1;
                    item.picIds = item.pic_ids ? _this.getPicIds(item.pic_ids) : null;
                    id_1++;
                });
                this.compositeContent = result;
            }
        };
        CompositeSummaryController.prototype.clearList = function () {
            this.compositeContent = [];
        };
        return CompositeSummaryController;
    }());
    var CompositeSummary = {
        bindings: CompositeSummaryBindings,
        templateUrl: 'composite_summary/CompositeSummary.html',
        controller: CompositeSummaryController
    };
    angular.module("pipCompositeSummary", ['pipDocuments', 'pipLocations', 'pipPictures', 'pipDates', 'pipComposite.Templates'])
        .component('pipCompositeSummary', CompositeSummary);
}
},{"../composite_edit/CompositeEdit":6}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CompositeEdit_1 = require("../composite_edit/CompositeEdit");
var CompositeAddItemEventParams = (function () {
    function CompositeAddItemEventParams() {
    }
    return CompositeAddItemEventParams;
}());
exports.CompositeAddItemEventParams = CompositeAddItemEventParams;
var CompositeToolbarButton = (function () {
    function CompositeToolbarButton() {
        this.picture = true;
        this.document = true;
        this.location = true;
        this.event = true;
        this.checklist = true;
        this.text = true;
    }
    return CompositeToolbarButton;
}());
exports.CompositeToolbarButton = CompositeToolbarButton;
{
    var translateConfig = function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            'TEXT': 'Text',
            'CHECKLIST': 'Checklist',
            'LOCATION': 'Location',
            'PICTURE': 'Picture',
            'TIME': 'Time',
            'DOCUMENT': 'Document'
        });
        pipTranslateProvider.translations('ru', {
            'TEXT': 'Текст',
            'CHECKLIST': 'Список',
            'LOCATION': 'Локация',
            'PICTURE': 'Изображение',
            'TIME': 'Время',
            'DOCUMENT': 'Document'
        });
    };
    translateConfig.$inject = ['pipTranslateProvider'];
    var CompositeToolbarBindings = {
        ngDisabled: '<?',
        emptyState: '<?pipCompositeEmpty',
        pipToolbarButton: '=?',
        compositeId: '=?pipCompositeId',
    };
    var CompositeToolbarBindingsChanges = (function () {
        function CompositeToolbarBindingsChanges() {
        }
        ;
        return CompositeToolbarBindingsChanges;
    }());
    var CompositeToolbarController = (function () {
        CompositeToolbarController.$inject = ['$rootScope', '$element'];
        function CompositeToolbarController($rootScope, $element) {
            "ngInject";
            var _this = this;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.toolbarButton = new CompositeToolbarButton();
            this.setOption();
            $element.addClass('pip-composite-toolbar');
            this.cleanupCompositeEvent = this.$rootScope.$on(CompositeEdit_1.CompositeEmptyEvent, function (event, value) {
                _this.emptyState = !value;
            });
        }
        CompositeToolbarController.prototype.$onDestroy = function () {
            if (angular.isFunction(this.cleanupCompositeEvent)) {
                this.cleanupCompositeEvent();
            }
        };
        CompositeToolbarController.prototype.$onChanges = function (changes) {
            if (changes.pipToolbarButton && changes.pipToolbarButton.currentValue) {
                this.setOption();
            }
        };
        CompositeToolbarController.prototype.toBoolean = function (value) {
            if (value == null)
                return false;
            if (!value)
                return false;
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        CompositeToolbarController.prototype.onAddItem = function (contentType) {
            var params = {
                type: contentType,
                id: this.compositeId
            };
            this.$rootScope.$emit(CompositeEdit_1.CompositeAddItemEvent, params);
        };
        ;
        CompositeToolbarController.prototype.setOption = function () {
            _.assign(this.pipToolbarButton, this.pipToolbarButton);
            this.toolbarButton.text = true;
        };
        ;
        return CompositeToolbarController;
    }());
    var CompositeToolbar = {
        bindings: CompositeToolbarBindings,
        templateUrl: 'composite_toolbar/CompositeToolbar.html',
        controller: CompositeToolbarController
    };
    angular.module("pipCompositeToolbar", ['pipComposite.Templates'])
        .config(translateConfig)
        .component('pipCompositeToolbar', CompositeToolbar);
}
},{"../composite_edit/CompositeEdit":6}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var CompositeViewBindings = {
        ngDisabled: '<?',
        pipDisabledChecklist: '<?',
        pipChanged: '=?',
        pipContents: '=?',
        pipRebind: '<?'
    };
    var CompositeViewBindingsChanges = (function () {
        function CompositeViewBindingsChanges() {
        }
        return CompositeViewBindingsChanges;
    }());
    var CompositeViewController = (function () {
        CompositeViewController.$inject = ['$element', '$attrs'];
        function CompositeViewController($element, $attrs) {
            "ngInject";
            this.$element = $element;
            this.$attrs = $attrs;
            this.selected = {};
            $element.addClass('pip-composite-view');
            this.selected.isChanged = false;
            this.pipContents = _.isArray(this.pipContents) ? this.pipContents : [];
            this.generateList(this.pipContents);
        }
        CompositeViewController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
                if (this.pipRebind && changes.pipContents && _.isArray(changes.pipContents.currentValue)) {
                    this.selected.isChanged === true ? this.selected.isChanged = false : this.generateList(changes.pipContents.currentValue);
                }
            }
            if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                this.ngDisabled = changes.ngDisabled.currentValue;
            }
            if (changes.pipDisabledChecklist && changes.pipDisabledChecklist.currentValue !== changes.pipDisabledChecklist.previousValue) {
                this.pipDisabledChecklist = changes.pipDisabledChecklist.currentValue;
            }
        };
        CompositeViewController.prototype.getPicIds = function (ids) {
            var result = [];
            _.each(ids, function (id) {
                var item = {
                    id: id
                };
                result.push(item);
            });
            return result;
        };
        CompositeViewController.prototype.updateContents = function () {
            this.selected.isChanged = true;
            this.pipContents = this.compositeContent;
        };
        CompositeViewController.prototype.isDisabled = function () {
            return this.pipDisabledChecklist === true || this.ngDisabled === true;
        };
        CompositeViewController.prototype.onContentChange = function () {
            this.updateContents();
            if (this.pipChanged) {
                this.pipChanged(this.pipContents);
            }
        };
        CompositeViewController.prototype.onCompositeChange = function () {
            this.updateContents();
            if (this.pipChanged)
                this.pipChanged(this.pipContents);
        };
        CompositeViewController.prototype.generateList = function (content) {
            var _this = this;
            if (!content || content.length < 1) {
                this.clearList();
                return;
            }
            else {
                this.compositeContent = [];
                var id_1 = 0;
                _.each(content, function (item) {
                    if (typeof (item) != 'object' || item == null) {
                        throw new Error('Error: content error!');
                    }
                    item.id = id_1;
                    item.picIds = item.pic_ids ? _this.getPicIds(item.pic_ids) : null;
                    id_1++;
                    _this.compositeContent.push(item);
                });
            }
        };
        CompositeViewController.prototype.clearList = function () {
            this.compositeContent = [];
        };
        return CompositeViewController;
    }());
    var CompositeView = {
        bindings: CompositeViewBindings,
        templateUrl: 'composite_view/CompositeView.html',
        controller: CompositeViewController
    };
    angular.module("pipCompositeView", ['pipDocuments', 'pipLocations', 'pipPictures', 'pipDates', 'pipComposite.Templates', 'pipEmbeddedView'])
        .component('pipCompositeView', CompositeView);
}
},{}],10:[function(require,module,exports){
{
    var ContentSwitchLink_1 = (function () {
        ContentSwitchLink_1.$inject = ['$parse', '$scope', '$element', '$attrs'];
        function ContentSwitchLink_1($parse, $scope, $element, $attrs) {
            "ngInject";
            this.$parse = $parse;
            this.$scope = $scope;
            this.$element = $element;
            this.$attrs = $attrs;
            this.parentElementNameGetter = $parse($attrs.pipParentElementName);
            this.parentElement = this.parentElementNameGetter($scope);
            this.setOption();
        }
        ContentSwitchLink_1.prototype.scrollTo = function (childElement) {
            var _this = this;
            setTimeout(function () {
                var modDiff = Math.abs($(_this.parentElement).scrollTop() - $(childElement).position().top);
                if (modDiff < 20) {
                    return;
                }
                var scrollTo = $(_this.parentElement).scrollTop() + ($(childElement).position().top - 20);
                $(_this.parentElement).animate({
                    scrollTop: scrollTo + 'px'
                }, 300);
            }, 100);
        };
        ;
        ContentSwitchLink_1.prototype.setOption = function () {
            if (this.$scope.contentSwitchOption !== null && this.$scope.contentSwitchOption !== undefined) {
                this.$scope.showIconPicture = this.$scope.contentSwitchOption.picture ? this.$scope.contentSwitchOption.picture : this.$scope.showIconPicture;
                this.$scope.showIconDocument = this.$scope.contentSwitchOption.document ? this.$scope.contentSwitchOption.document : this.$scope.showIconDocument;
                this.$scope.showIconLocation = this.$scope.contentSwitchOption.location ? this.$scope.contentSwitchOption.location : this.$scope.showIconLocation;
                this.$scope.showIconEvent = this.$scope.contentSwitchOption.event ? this.$scope.contentSwitchOption.event : this.$scope.showIconEvent;
            }
            else {
                this.$scope.showIconPicture = true;
                this.$scope.showIconDocument = true;
                this.$scope.showIconLocation = true;
                this.$scope.showIconEvent = true;
            }
        };
        ;
        ContentSwitchLink_1.prototype.onButtonClick = function (type) {
            if (!this.parentElement)
                return;
            switch (type) {
                case 'event':
                    if (this.$scope.showEvent)
                        scrollTo('.event-edit');
                    break;
                case 'documents':
                    if (this.$scope.showDocuments)
                        scrollTo('.pip-document-list-edit');
                    break;
                case 'pictures':
                    if (this.$scope.showPictures)
                        scrollTo('.pip-picture-list-edit');
                    break;
                case 'location':
                    if (this.$scope.showLocation)
                        scrollTo('.pip-location-edit');
                    break;
            }
            ;
        };
        ;
        return ContentSwitchLink_1;
    }());
    var ContentSwitch = function ($parse) {
        return {
            restrict: 'EA',
            scope: false,
            templateUrl: 'content_switch/ContentSwitch.html',
            link: function ($scope, $element, $attrs) {
                new ContentSwitchLink_1($parse, $scope, $element, $attrs);
            }
        };
    };
    ContentSwitch.$inject = ['$parse'];
    angular.module("pipContentSwitch", ['pipComposite.Templates'])
        .directive('pipContentSwitch', ContentSwitch);
}
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChecklistItem = (function () {
    function ChecklistItem() {
    }
    return ChecklistItem;
}());
exports.ChecklistItem = ChecklistItem;
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ContentBlock = (function () {
    function ContentBlock() {
    }
    return ContentBlock;
}());
exports.ContentBlock = ContentBlock;
},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ContentBlockType = (function () {
    function ContentBlockType() {
    }
    return ContentBlockType;
}());
ContentBlockType.Text = "text";
ContentBlockType.Checklist = "checklist";
ContentBlockType.Location = "location";
ContentBlockType.Time = "time";
ContentBlockType.Pictures = "pictures";
ContentBlockType.Documents = "documents";
ContentBlockType.Embedded = "embedded";
ContentBlockType.Custom = "custom";
exports.ContentBlockType = ContentBlockType;
},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EmbeddedType = (function () {
    function EmbeddedType() {
    }
    return EmbeddedType;
}());
EmbeddedType.Youtube = "youtube";
EmbeddedType.Custom = "custom";
exports.EmbeddedType = EmbeddedType;
},{}],15:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./Content");
require("./ChecklistItem");
require("./ContentBlockType");
__export(require("./Content"));
__export(require("./ChecklistItem"));
__export(require("./ContentBlockType"));
},{"./ChecklistItem":11,"./Content":12,"./ContentBlockType":13}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EmbeddedType_1 = require("../data/EmbeddedType");
var EmbeddedEditBindings = {
    embed_type: '=?pipEmbeddedType',
    embed_uri: '=?pipEmbeddedUri',
    onChange: '=pipChanged',
    ngDisabled: '&?ngDisabled'
};
var EmbeddedEditChanges = (function () {
    function EmbeddedEditChanges() {
    }
    return EmbeddedEditChanges;
}());
var EmbeddedEditController = (function () {
    EmbeddedEditController.$inject = ['$element', '$scope', '$state', 'pipMedia'];
    function EmbeddedEditController($element, $scope, $state, pipMedia) {
        this.$element = $element;
        this.$scope = $scope;
        this.$state = $state;
        this.pipMedia = pipMedia;
        this.embeddedTypeCollection = [
            { title: 'EMBEDDED_TYPE_CUSTOM', shortTitle: 'EMBEDDED_TYPE_CUSTOM_SHORT', id: EmbeddedType_1.EmbeddedType.Custom },
            { title: 'EMBEDDED_TYPE_YOUTUBE', shortTitle: 'EMBEDDED_TYPE_YOUTUBE_SHORT', id: EmbeddedType_1.EmbeddedType.Youtube }
        ];
        $element.addClass('pip-embedded-edit');
        this.init();
    }
    EmbeddedEditController.prototype.$onInit = function () { };
    EmbeddedEditController.prototype.$onChanges = function (changes) {
        console.log('$onChanges');
        this.init();
    };
    EmbeddedEditController.prototype.$postLink = function () {
        console.log('postlink', this.$scope);
        this.form = this.$scope.embedded;
    };
    EmbeddedEditController.prototype.init = function () {
        if (!this.embed_type) {
            this.embed_type = EmbeddedType_1.EmbeddedType.Custom;
        }
    };
    EmbeddedEditController.prototype.onChangeType = function () {
        console.log('onChangeType');
        if (!this.form.url.$error)
            this.onChange(this.embed_type, this.embed_uri);
    };
    EmbeddedEditController.prototype.onChangeUrl = function () {
        console.log('onChangeUrl');
        this.onChange(this.embed_type, this.embed_uri);
    };
    EmbeddedEditController.prototype.isDisabled = function () {
        if (this.ngDisabled) {
            return this.ngDisabled();
        }
        return false;
    };
    ;
    return EmbeddedEditController;
}());
(function () {
    declaredEmbeddedEditResources.$inject = ['pipTranslateProvider'];
    function declaredEmbeddedEditResources(pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            EMBEDDED_TYPE_LABEL: 'Embedded type',
            EMBEDDED_URL_LABEL: 'Embedded uri',
            EMBEDDED_TYPE_HINT: 'Enter uri of embedded resource',
            EMBEDDED_URL_ERROR: 'Uri error',
            EMBEDDED_TYPE_CUSTOM: 'Custom',
            EMBEDDED_TYPE_YOUTUBE: 'Youtube',
            EMBEDDED_TYPE_CUSTOM_SHORT: 'Custom',
            EMBEDDED_TYPE_YOUTUBE_SHORT: 'Youtube'
        });
        pipTranslateProvider.translations('ru', {
            EMBEDDED_TYPE_LABEL: 'Тип встроенного ресурса',
            EMBEDDED_URL_LABEL: 'Uri встроенного ресурса',
            EMBEDDED_TYPE_HINT: 'Введите uri встроенного ресурса',
            EMBEDDED_URL_ERROR: 'Неверный uri',
            EMBEDDED_TYPE_CUSTOM: 'Другой',
            EMBEDDED_TYPE_YOUTUBE: 'Youtube',
            EMBEDDED_TYPE_CUSTOM_SHORT: 'Другой',
            EMBEDDED_TYPE_YOUTUBE_SHORT: 'Youtube'
        });
    }
    angular
        .module('pipEmbeddedEdit', [])
        .component('pipEmbeddedEdit', {
        bindings: EmbeddedEditBindings,
        templateUrl: 'embedded_edit/EmbeddedEdit.html',
        controller: EmbeddedEditController,
        controllerAs: '$ctrl'
    })
        .config(declaredEmbeddedEditResources);
})();
},{"../data/EmbeddedType":14}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EmbeddedViewBindings = {
    embed_type: '=?pipEmbeddedType',
    embed_uri: '=?pipEmbeddedUri',
};
var EmbeddedViewChanges = (function () {
    function EmbeddedViewChanges() {
    }
    return EmbeddedViewChanges;
}());
var EmbeddedViewController = (function () {
    EmbeddedViewController.$inject = ['$element', 'pipMedia'];
    function EmbeddedViewController($element, pipMedia) {
        this.$element = $element;
        this.pipMedia = pipMedia;
        $element.addClass('pip-embedded-view');
        this.init();
    }
    EmbeddedViewController.prototype.$onInit = function () { };
    EmbeddedViewController.prototype.$onChanges = function (changes) {
        console.log('$onChanges');
        this.init();
    };
    EmbeddedViewController.prototype.init = function () {
    };
    return EmbeddedViewController;
}());
(function () {
    resourceYoutubeConfig.$inject = ['$sceDelegateProvider'];
    declaredEmbeddedViewResources.$inject = ['pipTranslateProvider'];
    function declaredEmbeddedViewResources(pipTranslateProvider) {
        pipTranslateProvider.translations('en', {});
        pipTranslateProvider.translations('ru', {});
    }
    function resourceYoutubeConfig($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'https://www.youtube.com/**'
        ]);
    }
    angular
        .module('pipEmbeddedView', [])
        .component('pipEmbeddedView', {
        bindings: EmbeddedViewBindings,
        templateUrl: 'embedded_view/EmbeddedView.html',
        controller: EmbeddedViewController,
        controllerAs: '$ctrl'
    })
        .config(resourceYoutubeConfig)
        .config(declaredEmbeddedViewResources);
})();
},{}],18:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./checklist_edit/ChecklistEdit");
require("./checklist_view/ChecklistView");
require("./composite_edit/CompositeEdit");
require("./composite_summary/CompositeSummary");
require("./composite_toolbar/CompositeToolbar");
require("./composite_view/CompositeView");
require("./utilities/CompositeFocused");
require("./mobile_mouse");
require("./content_switch/ContentSwitch");
require("./embedded_edit/EmbeddedEdit");
require("./embedded_view/EmbeddedView");
require("./data");
angular.module('pipComposite', [
    'pipContentSwitch',
    'pipChecklistEdit',
    'pipChecklistView',
    'pipCompositeEdit',
    'pipCompositeView',
    'pipCompositeSummary',
    'pipCompositeToolbar',
    'pipCompositeFocused',
    'pipMobileMouse',
    'pipEmbeddedEdit',
    'pipEmbeddedView'
]);
__export(require("./data"));
},{"./checklist_edit/ChecklistEdit":4,"./checklist_view/ChecklistView":5,"./composite_edit/CompositeEdit":6,"./composite_summary/CompositeSummary":7,"./composite_toolbar/CompositeToolbar":8,"./composite_view/CompositeView":9,"./content_switch/ContentSwitch":10,"./data":15,"./embedded_edit/EmbeddedEdit":16,"./embedded_view/EmbeddedView":17,"./mobile_mouse":21,"./utilities/CompositeFocused":22}],19:[function(require,module,exports){
{
    var MobileMousedown_1 = function (scope, elem, attrs) {
        elem.bind("touchstart mousedown", function (e) {
            scope.$apply(attrs.pipMobileMousedown);
        });
    };
    angular.module("pipMobileMouse")
        .directive('pipMobileMousedown', function () {
        return MobileMousedown_1;
    });
}
},{}],20:[function(require,module,exports){
{
    var MobileMouseup_1 = function (scope, elem, attrs) {
        elem.bind("touchend mouseup", function (e) {
            scope.$apply(attrs.pipMobileMouseup);
        });
    };
    angular.module("pipMobileMouse")
        .directive('pipMobileMouseup', function () {
        return MobileMouseup_1;
    });
}
},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipMobileMouse', []);
require("./MobileMousedown");
require("./MobileMouseup");
},{"./MobileMousedown":19,"./MobileMouseup":20}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeFocusedEvent = 'focusedComposite';
{
    var CompositeFocusedController_1 = (function () {
        CompositeFocusedController_1.$inject = ['$element', '$rootScope'];
        function CompositeFocusedController_1($element, $rootScope) {
            $element.bind("touchstart mousedown", function (e) {
                $rootScope.$broadcast(exports.CompositeFocusedEvent);
            });
        }
        return CompositeFocusedController_1;
    }());
    var CompositeFocused = function () {
        return {
            restrict: 'A',
            scope: false,
            controller: CompositeFocusedController_1
        };
    };
    angular.module("pipCompositeFocused", [])
        .directive('pipCompositeFocused', CompositeFocused);
}
},{}],23:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('checklist_edit/ChecklistEdit.html',
    '<div ng-class="{\'pip-checklist-draggable\': $ctrl.selected.drag}" id="{{\'checklist-\' + $ctrl.selected.id}}"><div ng-repeat="item in $ctrl.checklistContent" ng-mousedown="$ctrl.onClick($event, $index)" class="pip-checklist-item" id="{{\'check-item-\' + $ctrl.selected.id + \'-\' + $index}}" pip-drag="$ctrl.checklistContent.length > 1 && $ctrl.selected.drag && !item.empty" pip-drag-data="item" pip-force-touch="true" pip-touch-delay="30" pip-drop="true" pip-drag-stop="$ctrl.onStop(selected.id)" pip-drag-start="$ctrl.onStart(selected.id)" pip-scroll-container="$ctrl.pipScrollContainer" pip-drop-success="$ctrl.onDropComplete($index, $data, $event, $ctrl.selected.id)"><div ng-class="{\'put_place\': $ctrl.selected.drag}"></div><div class="pip-checklist-item-body layout-row layout-align-start-start" pip-cancel-drag="true" ng-class="{ \'select-active-item\': $ctrl.isSelectedItem($index) }"><div class="pip-checklist-button" pip-cancel-drag="true"><md-button pip-drag-handle="" class="pip-icon-checklist-button md-icon-button no-ripple-container" aria-label="REARRANGE" tabindex="-1" pip-mobile-mousedown="$ctrl.onDownDragg(item)" pip-mobile-mouseup="$ctrl.onDraggEnd()" ng-if="$ctrl.pipDraggable && $ctrl.checklistContent.length > 2 && !item.empty" ng-class="$ctrl.checklistContent.length > 1 ? \'cursor-move\' : \'cursor-default\'" ng-disabled="$ctrl.ngDisabled"><md-icon class="text-grey" md-svg-icon="icons:vhandle"></md-icon></md-button></div><div class="pip-checklist-button" style="overflow: hidden" pip-cancel-drag="true"><div class="pip-checklist-button-container"><md-button class="pip-icon-checklist-button md-icon-button" ng-show="item.empty" ng-disabled="$ctrl.ngDisabled" md-ink-ripple="" ng-click="$ctrl.onAddItem()" tabindex="-1" aria-label="PLUS"><md-icon class="text-grey" md-svg-icon="icons:plus"></md-icon></md-button><md-checkbox ng-model="item.checked" ng-show="!item.empty" aria-label="COMPLETE" pip-cancel-drag="true" ng-focus="$ctrl.onItemFocus($index)" ng-change="$ctrl.onChecked(item)" ng-disabled="$ctrl.ngDisabled"></md-checkbox></div></div><div class="pip-checklist-text flex" pip-cancel-drag="true"><md-input-container md-no-float="" class="flex"><textarea ng-model="item.text" name="{{\'text\' + $index}}" aria-label="TEXT" class="pip-text-checkbox" ng-focus="$ctrl.onItemFocus($index)" ng-change="$ctrl.onChangeItem($index)" ng-keydown="$ctrl.onTextareaKeyDown($event, $index, item)" placeholder="{{::\'TEXT\' | translate}}" id="{{\'check-item-text-\' + selected.id + \'-\' + $index}}" ng-disabled="$ctrl.ngDisabled">\n' +
    '                    </textarea></md-input-container></div><div class="pip-checklist-button" pip-cancel-drag="true"><md-button class="pip-icon-checklist-button md-icon-button" md-ink-ripple="" ng-click="$ctrl.onDeleteItem($index, item)" ng-disabled="$ctrl.ngDisabled" tabindex="-1" ng-focus="$ctrl.onItemFocus($index)" ng-show="$ctrl.isSelectedItem($index)" aria-label="DELETE-ITEM"><md-icon class="text-grey" md-svg-icon="icons:cross-circle"></md-icon></md-button></div></div></div><div id="{{\'check-item-empty-\' + $ctrl.selected.id}}" class="pip-empty-text" pip-drag="false" pip-drop="true" pip-drop-success="$ctrl.onDropComplete($ctrl.checklistContent.length, $data, $event, $ctrl.selected.id)"><div ng-class="{\'put_place\': $ctrl.selected.drag}"></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('checklist_view/ChecklistView.html',
    '<div ng-repeat="item in $ctrl.pipOptions track by $index"><div class="pip-checklist-item layout-row layout-align-start-start"><div class="pip-checklist-icon"><md-checkbox ng-model="item.checked" ng-click="$ctrl.onClick($event, item)" aria-label="COMPLETE" ng-disabled="$ctrl.ngDisabled"></md-checkbox></div><div class="pip-checklist-text flex"><pip-markdown pip-text="item.text" pip-rebind="true" ng-disabled="true"></pip-markdown></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('composite_edit/CompositeEdit.html',
    '<div class="divider-top"><div class="pip-composite-body" ng-show="$ctrl.compositeContent.length != 0" ng-class="{\'drag-active\': $ctrl.selected.drag}"><div class="pip-composite-item" ng-repeat="obj in $ctrl.compositeContent track by obj.id" ng-mousedown="$ctrl.onClick($event, $index, obj)" ng-class="{\'selected-content\': $ctrl.isSelectedSection($index, obj), \'composite-animate\': !obj.empty && $ctrl.compositeContent.length > 1}" ng-keyup="$ctrl.onKeyUp($event)" ng-keydown="$ctrl.onKeyDown($event, $index, obj)" pip-drag="$ctrl.compositeContent.length > 1 && $ctrl.selected.drag" pip-touch-delay="10" pip-drag-data="obj" pip-scroll-container="$ctrl.pipScrollContainer" pip-drop="true" pip-force-touch="true" pip-drag-stop="$ctrl.onStop($ctrl.selected.id)" pip-drag-start="$ctrl.onStart($ctrl.selected.id)" pip-drop-success="$ctrl.onDropComplete($index, $data, $event, $ctrl.selected.id)" id="{{\'composite-item-\' + $ctrl.selected.id + \'-\' + $index}}"><div class="putt_box"></div><div class="pip-section-header layout-row layout-align-start-center" ng-if="!obj.empty"><div class="w38"></div><md-button class="md-icon-button md-icon-button-little icon-rearrange-btn no-ripple-container rm8 cursor-move" ng-if="!$ctrl.ngDisabled && $ctrl.compositeContent.length > 1" pip-drag-handle="" pip-mobile-mousedown="$ctrl.onDownDragg($event, obj)" pip-mobile-mouseup="$ctrl.onDraggEnd()" tabindex="-1" aria-label="COMPOSITE-DRAGG" ng-hide="$ctrl.compositeContent.length == 1"><md-icon class="composite-icon cursor-move" md-svg-icon="icons:handle"></md-icon></md-button><div><md-button class="md-icon-button md-icon-button-little rm8" ng-click="$ctrl.onDeleteItem($index)" ng-disabled="$ctrl.ngDisabled" aria-label="COMPOSITE-DELETE"><md-icon class="composite-icon" md-svg-icon="icons:cross"></md-icon></md-button></div></div><div class="pip-section-content rp24-flex lp24-flex tp16 bp16" ng-if="obj.type == \'text\'" pip-cancel-drag="true"><md-input-container class="p0 m0 w-stretch" md-no-float=""><textarea ng-model="obj.text" aria-label="text" placeholder="{{ $ctrl.isFirst ? $ctrl.compositePlaceholder : \'TEXT\' | translate}}" id="{{\'composite-item-text-\' + $ctrl.selected.id + \'-\' + $index}}" ng-change="$ctrl.onContentChange(obj)" pip-cancel-drag="true" ng-disabled="$ctrl.ngDisabled">\n' +
    '                            </textarea></md-input-container></div><div class="pip-section-content rp24-flex lp24-flex vp20" ng-if="obj.type == \'pictures\'" pip-cancel-drag="true"><pip-picture-list-edit class="w-stretch" pip-cancel-drag="true" pip-pictures="obj.picIds" pip-changed="$ctrl.onContentChange(obj)" pip-created="obj.pictures = $event.sender" pip-added-picture="$ctrl.addedContent" ng-disabled="$ctrl.ngDisabled"></pip-picture-list-edit></div><div class="pip-section-content rp24-flex lp24-flex vp20" ng-if="obj.type == \'documents\'" pip-cancel-drag="true"><pip-document-list-edit class="w-stretch" pip-documents="obj.docs" pip-cancel-drag="true" pip-changed="$ctrl.onContentChange(obj)" pip-created="obj.documents = $event.sender" pip-added-document="$ctrl.addedContent" ng-disabled="$ctrl.ngDisabled"></pip-document-list-edit></div><div class="pip-section-embedded rp24-flex lp24-flex vp20" ng-if="obj.type == \'embedded\'" pip-cancel-drag="true"><pip-embedded-edit pip-embedded-type="obj.embed_type" pip-embedded_uri="obj.embed_uri" pip-cancel-drag="true" pip-changed="$ctrl.onContentChange(obj)" ng-disabled="$ctrl.ngDisabled"></pip-embedded-edit></div><div class="pip-section-content layout-row layout-align-start-center" ng-if="obj.type == \'checklist\'" pip-cancel-drag="true"><pip-checklist-edit pip-options="obj.checklist" pip-draggable="$ctrl.isActiveChecklist(obj)" pip-changed="$ctrl.onContentChange(obj)" ng-disabled="$ctrl.ngDisabled" pip-scroll-container="$ctrl.pipScrollContainer" pip-rebind="true"></pip-checklist-edit></div><div class="pip-section-content vp20 rp24-flex lp24-flex" ng-if="obj.type == \'location\'" pip-cancel-drag="true"><pip-location-edit class="pip-location-attachments w-stretch" pip-location-name="obj.loc_name" pip-location-pos="obj.loc_pos" pip-cancel-drag="true" xxxpip-location-holder="$ctrl.pipLocationHolder" pip-changed="$ctrl.onContentChange(obj)" ng-disabled="$ctrl.ngDisabled"></pip-location-edit></div><div class="pip-section-content bp16-flex rp24-flex lp24-flex tp20" ng-if="obj.type == \'time\'" pip-cancel-drag="true"><pip-time-range-edit class="w-stretch" pip-start-date="obj.start" pip-end-date="obj.end" xxxpip-size="$sizeGtSmall" pip-changed="$ctrl.onContentChange(obj)" ng-disabled="$ctrl.ngDisabled" pip-start-label="{{ \'COMPOSITE_START_TIME\' | translate }}" pip-end-label="{{ \'COMPOSITE_END_TIME\' | translate }}"></pip-time-range-edit></div></div><div class="pip-composite-item w-stretch" pip-drag="false" pip-drop="true" pip-drop-success="$ctrl.onDropComplete($ctrl.compositeContent.length, $data, $event, $ctrl.selected.id)" pip-drag-stop="$ctrl.onStop($ctrl.selected.id)" pip-drag-start="$ctrl.onStart($ctrl.selected.id)" id="{{\'pip-composite-last-\' + $ctrl.selected.id}}"><div class="putt_box"></div><div class="pip-section-content h24" style="border: 0px!important;"></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('composite_summary/CompositeSummary.html',
    '<div ng-repeat="item in $ctrl.compositeContent track by $index"><div class="pip-composite-text" ng-if="item.type == \'text\' && item.text"><pip-markdown pip-text="item.text" pip-line-count="$ctrl.textSize" pip-rebind="true" ng-disabled="true"></pip-markdown></div><div ng-if="item.type == \'pictures\' && item.picIds && item.picIds.length > 0" ng-class="$ctrl.compositeContent[$index - 1].type != \'pictures\' ? $ctrl.compositeContent[$index + 1].type != \'pictures\' ? \'tm16 bm16\' : \'tm16 bm0\' : $ctrl.compositeContent[$index + 1].type != \'pictures\' ? \'tm8 bm16\' : \'tm8 bm0\'" class="pip-composite-pictures"><pip-collage pip-pictures="item.picIds" pip-unique-code="item.id" pip-multiple="true" pip-open="$ctrl.disableControl" pip-rebind="true" ng-disabled="$ctrl.disableControl"></pip-collage></div><div ng-if="item.type == \'documents\' && item.docs && item.docs.length > 0" class="pip-composite-documents layout-row flex"><pip-document-list class="flex" pip-documents="item.docs" pip-rebind="true" pip-document-icon="true" pip-collapse="true" ng-disabled="$ctrl.disableControl"></pip-document-list></div><div ng-if="item.type == \'checklist\' && item.checklist && item.checklist.length > 0" class="pip-composite-checklist"><pip-checklist-view pip-options="item.checklist" pip-changed="$ctrl.onContentChange()" pip-rebind="true" pip-collapse="true" ng-disabled="$ctrl.disabledChecklist"></pip-checklist-view></div><div class="pip-composite-location layout-row layout-align-start-center flex" ng-if="item.type == \'location\' && (item.loc_pos || item.loc_name)"><pip-location class="flex" pip-location-name="item.loc_name" pip-location-pos="item.loc_pos" pip-collapse="true" pip-show-location-icon="true" ng-disabled="$ctrl.disableControl" pip-rebind="true"></pip-location></div><div class="pip-composite-time layout-row layout-align-start-center flex" ng-if="item.type == \'time\' && (item.start || item.end)"><md-icon md-svg-icon="icons:time" class="rm24 lm0"></md-icon><pip-time-range pip-start-date="item.start" pip-end-date="item.end" pip-rebind="true" ng-disabled="$ctrl.disableControl"></pip-time-range></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('composite_toolbar/CompositeToolbar.html',
    '<div class="layout-row layout-align-start-start flex"><md-button class="pip-composite-button" ng-if="!$ctrl.emptyState" ng-class="{ \'remove-item\': !$ctrl.emptyState , \'new-item\': !$ctrl.emptyState }" ng-click="$ctrl.onAddItem(\'text\');" aria-label="COMPOSITE-BUTTON-TEXT" ng-disabled="$ctrl.ngDisabled"><md-icon class="icon-text-block" md-svg-icon="icons:text"></md-icon><md-tooltip>{{::\'TEXT\'| translate}}</md-tooltip></md-button><md-button ng-if="$ctrl.toolbarButton.checklist" ng-click="$ctrl.onAddItem(\'checklist\')" ng-disabled="$ctrl.ngDisabled" class="pip-composite-button" aria-label="COMPOSITE-BUTTON-CHECKLIST"><md-icon class="icon-checkbox-on" md-svg-icon="icons:checkbox-on"></md-icon><md-tooltip>{{::\'CHECKLIST\'| translate}}</md-tooltip></md-button><md-button ng-if="$ctrl.toolbarButton.picture" ng-click="$ctrl.onAddItem(\'pictures\')" ng-disabled="$ctrl.ngDisabled" class="pip-composite-button" aria-label="COMPOSITE-BUTTON-PICTURES"><md-icon class="icon-camera" md-svg-icon="icons:camera"></md-icon><md-tooltip>{{::\'PICTURE\'| translate}}</md-tooltip></md-button><md-button ng-click="$ctrl.onAddItem(\'documents\')" ng-if="$ctrl.toolbarButton.document" ng-disabled="$ctrl.ngDisabled" class="pip-composite-button" aria-label="COMPOSITE-BUTTON-DOCUMENTS"><md-icon class="icon-document" md-svg-icon="icons:document"></md-icon><md-tooltip>{{::\'DOCUMENT\'| translate}}</md-tooltip></md-button><md-button ng-click="$ctrl.onAddItem(\'location\')" ng-if="$ctrl.toolbarButton.location" ng-disabled="$ctrl.ngDisabled" class="pip-composite-button" aria-label="COMPOSITE-BUTTON-LOCATIONS"><md-icon class="icon-location" md-svg-icon="icons:location"></md-icon><md-tooltip>{{::\'LOCATION\'| translate}}</md-tooltip></md-button><md-button ng-click="$ctrl.onAddItem(\'time\')" ng-if="$ctrl.toolbarButton.event" ng-disabled="$ctrl.ngDisabled" class="pip-composite-button" aria-label="COMPOSITE-BUTTON-TIME"><md-icon class="icon-time" md-svg-icon="icons:time"></md-icon><md-tooltip>{{::\'TIME\'| translate}}</md-tooltip></md-button></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('composite_view/CompositeView.html',
    '<div ng-repeat="item in $ctrl.compositeContent track by $index"><div class="pip-composite-text lp24-flex rp24-flex" ng-if="item.type == \'text\' && item.text" ng-class="{\'bm16\': $last}"><pip-markdown pip-text="item.text" pip-rebind="true" ng-disabled="true"></pip-markdown></div><div ng-if="item.type == \'pictures\' && item.picIds && item.picIds.length > 0" ng-class="$ctrl.compositeContent[$index - 1].type != \'pictures\' ? $ctrl.compositeContent[$index + 1].type != \'pictures\' ? \'tm16 bm16\' : \'tm16 bm0\' : $ctrl.compositeContent[$index + 1].type != \'pictures\' ? \'tm8 bm16\' : \'tm8 bm0\'" class="pip-composite-pictures lp24-flex rp24-flex"><pip-collage pip-pictures="item.picIds" pip-unique-code="item.id" pip-multiple="true" pip-open="true" pip-rebind="true" ng-disabled="$ctrl.ngDisabled"></pip-collage></div><div ng-if="item.type == \'documents\' && item.docs && item.docs.length > 0" class="pip-composite-documents layout-row layout-align-start-start flex"><pip-document-list pip-documents="item.docs" pip-document-icon="true" pip-rebind="true" ng-disabled="$ctrl.ngDisabled"></pip-document-list></div><div ng-if="item.type == \'checklist\' && item.checklist && item.checklist.length > 0" class="pip-composite-checklist lp24-flex rp24-flex"><pip-checklist-view pip-options="item.checklist" pip-changed="$ctrl.onContentChange()" pip-rebind="true" ng-disabled="$ctrl.isDisabled()"></pip-checklist-view></div><div class="pip-composite-location layout-row layout-align-start-start flex" ng-if="item.type == \'location\' && (item.loc_pos || item.loc_name)"><pip-location class="flex" pip-location-name="item.loc_name" pip-location-pos="item.loc_pos" pip-show-location-icon="true" pip-collapse="false" ng-disabled="$ctrl.ngDisabled" pip-rebind="true"></pip-location></div><div class="pip-composite-time lp24-flex rp24-flex layout-row layout-align-start-center flex" ng-if="item.type == \'time\'"><md-icon md-svg-icon="icons:time" class="lm0"></md-icon><pip-time-range pip-start-date="item.start" pip-end-date="item.end" pip-rebind="true" ng-disabled="ngDisabled()"></pip-time-range></div><div class="pip-composite-embedded lp24-flex rp24-flex layout-row layout-align-start-center flex" ng-if="item.type == \'embedded\' && item.embed_uri"><pip-embedded-view class="bm8" pip-embedded-type="item.embed_type" pip-embedded-uri="item.embed_uri"></pip-embedded-view></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('content_switch/ContentSwitch.html',
    '<md-button ng-click="showPictures = !showPictures; onButtonClick(\'pictures\')" aria-label="showPictures" class="md-icon-button" ng-show="showIconPicture" ng-disabled="transaction.busy()"><md-icon class="active-camera" ng-class="{ \'active-camera\': showPictures }" md-svg-icon="icons:camera"></md-icon></md-button><md-button ng-click="showDocuments = !showDocuments; onButtonClick(\'documents\')" aria-label="showDocuments" class="md-icon-button" ng-show="showIconDocument" ng-disabled="transaction.busy()"><md-icon ng-class="{ \'active-document\': showDocuments }" md-svg-icon="icons:document"></md-icon></md-button><md-button ng-click="showEvent = !showEvent; onButtonClick(\'event\')" aria-label="showEvent" class="md-icon-button" ng-show="showIconEvent" ng-disabled="transaction.busy()"><md-icon ng-class="{ \'active-time\': showEvent }" md-svg-icon="icons:time"></md-icon></md-button><md-button ng-click="showLocation = !showLocation; onButtonClick(\'location\')" aria-label="showLocation" class="md-icon-button" ng-show="showIconLocation" ng-disabled="transaction.busy()"><md-icon ng-class="{ \'active-location\': showLocation }" md-svg-icon="icons:location"></md-icon></md-button>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('embedded_edit/EmbeddedEdit.html',
    '<form name="embedded"><md-input-container class="md-block flex bm24"><label>{{ ::\'EMBEDDED_TYPE_LABEL\'| translate }}</label><md-select ng-model="$ctrl.embed_type" ng-change="$ctrl.onChangeType()" ng-disabled="$ctrl.isDisabled()"><md-option ng-repeat="t in $ctrl.embeddedTypeCollection track by $index" ng-value="t.id">{{ ::t.title | translate }}</md-option></md-select></md-input-container><md-input-container class="md-block flex"><label>{{::\'EMBEDDED_URL_LABEL\' | translate}}</label> <input ng-model="$ctrl.embed_uri" ng-required="$ctrl.embed_uri" type="url" name="url" ng-change="$ctrl.onChangeUrl()" ng-disabled="$ctrl.isDisabled()" ng-model-options="{ delay: 500 }"><div class="hint" ng-if="!embedded.url.$error">{{::\'EMBEDDED_TYPE_HINT\' | translate}}</div><div ng-messages="embedded.url.$error" role="alert"><div ng-message="url">{{ \'EMBEDDED_URL_ERROR\' | translate }}</div></div></md-input-container></form>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('embedded_view/EmbeddedView.html',
    '<iframe width="100%" height="170" frameborder="0" allowfullscreen="" ng-if="$ctrl.embed_type == \'youtube\'" ng-src="{{ $ctrl.embed_uri }}" style="margin: 0 auto;"></iframe><iframe width="100%" height="170" frameborder="0" allowfullscreen="" style="margin: 0 auto;" ng-src="{{ $ctrl.embed_uri }}" ng-if="$ctrl.embed_type == \'custom\'"><p><a href="{{ $ctrl.embed_uri }}">{{ $ctrl.embed_uri }}</a></p></iframe>');
}]);
})();



},{}]},{},[18,23])(23)
});

//# sourceMappingURL=pip-suite-composite.js.map
