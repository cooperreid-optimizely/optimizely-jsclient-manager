var optlyClientManager = function() {

  var projectId  = 9000000000,
    scriptSrc    = 'https://www.your-site.com/static/js/lib/optimizely/optimizely.min-1.6.0.js',
    scriptLoaded = false,
    evtQueue     = [],
    optClient    = null,
    globalAttr   = {},
    datafile     = null;

  var getDatafile = function() {
    if(datafile) return Promise.resolve(datafile);

    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      request.open('GET', 'https://cdn.optimizely.com/json/' + projectId + '.json');
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          var resp = request.responseText;
          datafile = JSON.parse(resp);
          resolve(datafile);
        } else {
          reject('Unable to capture datafile');
        }
      };
      request.onerror = function() {
        reject('Unable to capture datafile');
      };
      request.send();
    });
  }

  var loadFSScript = function() {
    if(scriptLoaded) return Promise.resolve(true);

    return new Promise(function(resolve, reject) {
      var s;
      s = document.createElement('script');
      s.src = scriptSrc;
      s.onload = function() {
        scriptLoaded = true;
        resolve(true);
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  var coalesceUserAttr = function(additionalUserAttr) {
    return Object.assign(globalAttr, additionalUserAttr || {})
  }

  var activate = function(experimentKey, overrideUUID, additionalUserAttr) {
    if(!optClient) throw Error('Active must be called after client has been instantiated. Call `init` and then call `activate` within the success handler.');
    optClient.activate(experimentKey, overrideUUID || globalUUID, coalesceUserAttr(additionalUserAttr));
  }

  var getVariation = function(experimentKey, overrideUUID, additionalUserAttr) {
    if(!optClient) throw Error('Active must be called after client has been instantiated. Call `init` and then call `activate` within the success handler.');
    optClient.getVariation(experimentKey, overrideUUID || globalUUID, coalesceUserAttr(additionalUserAttr));
  }  

  var track = function(eventKey, overrideUUID, additionalUserAttr, eventTags) {
    if (optClient) optClient.track(eventKey, overrideUUID || globalUUID, coalesceUserAttr(additionalUserAttr), eventTags);
    else evtQueue.push([eventKey, overrideUUID || globalUUID, coalesceUserAttr(additionalUserAttr), eventTags]);
  }

  var dispatchEnqueued = function() {
    evtQueue.forEach(function(evtData) {
      optClient.track.apply(optClient, evtData);
    });
    evtQueue = [];
  }

  var getClient = function() {
    if(optClient) return Promise.resolve(optClient);
 
    return Promise.all([getDatafile(), loadFSScript()]).then(function(resolved) {
      var datafile = resolved[0];
      optClient = window.optimizelyClient.createInstance({
        datafile: datafile
      });
      optClient = optClient;
      return optClient;
    });        
  }

  var init = function(callback) {
    return getClient().then(function() {
      dispatchEnqueued();
      if(typeof callback === 'function') callback();
    });    
  }

  return {
    init: init,
    track: track,
    activate: activate,
    variation: getVariation,
    user: function(defaultUUID, defaultUserAttr) {
      globalAttr = defaultUserAttr;
      globalUUID = defaultUUID;
    },
    util: {
      getClient: getClient,
      getDatafile: getDatafile
    }
  };

}();