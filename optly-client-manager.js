var optlyTracker = function() {

  var projectId = 0000000000,
    scriptSrc   = 'https://www.your-site.com/static/js/lib/optimizely/optimizely.min-1.6.0.js',
    evtQueue    = [],
    optClient   = null,
    datafile    = null;

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
    return new Promise(function(resolve, reject) {
      var s;
      s = document.createElement('script');
      s.src = scriptSrc;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  var track = function(eventKey, uuid, userAttr, eventTags) {
    if (optClient) optClient.track(eventKey, uuid, userAttr, eventTags);
    else evtQueue.push([eventKey, uuid, userAttr, eventTags]);
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
    getClient: getClient,
    getDatafile: getDatafile
  };

}();
