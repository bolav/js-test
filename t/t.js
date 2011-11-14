/* We want to be able to look in different places! */
var args;
var test_script;
var inc, input;
inc = new Array();
inc[0] = '.';
function load(lib, into) {
    //console.log("looking for " + lib);
    // Blah, this is probably not cool
    inc.forEach(function(path) {
        var test = path + '/' + lib;
        //console.log("  -> " + test);
        if (fs.isFile(test)) {
            //console.log("    -> FOUND");
            if (into) {
                into.injectJs(test);
            } else {
                phantom.injectJs(test);
            }
        }
    });
}
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    // console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    // console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 100); //< repeat check every 250ms
};



if (typeof(console) == "undefined") {
    console = {};
    console.log = function() {
        print(arguments);
    }
}

function setup(obj) {
    return function() {
        window.plan = function(n) {
            console.log("1.." + n);
            //QUnit.tap.noPlan = false;
        }
        window.diag = function(msg) {
            console.log("# " + msg);
        }
        window.addListener = function(target, name, func) {
            if (typeof target[name] === 'function') {
                var orig = target[name];
                target[name] = function() {
                    var args = Array.prototype.slice.apply(arguments);
                    orig.apply(target, args);
                    func.apply(target, args);
                };
            } else {
                target[name] = func;
            }
        };

        QUnit.init();
        window.modules = 0;
        window.tests = 0;

        addListener(QUnit, 'moduleStart', function() {
            window.modules++;
        });
        addListener(QUnit, 'moduleDone', function() {
            window.modules--;
        });
        addListener(QUnit, 'testStart', function() {
            window.tests++;
        });
        addListener(QUnit, 'testDone', function() {
            window.tests--;
        });

    }
}

func = setup(document);
func();
