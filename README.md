# Optimizely JSClient Manager
A proof-of-concept solution for using Optimizely's Fullstack JavaScript SDK in the browser which handles SDK script loading & datafile fetching. The `optlyClientManager` provides wrapper functions for all of the Optimizely SDK's core methods.

---

## Enhancements

### init
Loads the SDK script and the datafile, returns a Promise. Also dispatches any tracking calls that were called pre-init.
```javascript
optlyClientManager.init()
```

### user
Set the user's UUID and attributes. These values will automatically be sent to Optimizely when calling all wrapper methods.
```javascript
optlyClientManager.user('userId', {'tier': 'gold'});
```

## Wrapper Methods

_Calling these methods will automatically attach the UUID and attributes set via `optlyClientManager.user`_

### track
(This can be called _prior_ to `init`)
```javascript
optlyClientManager.track('add_to_cart');
```

### activate & variation
Wrapper functions for Optimizely SDK methods `activate` and `getVariation`. The `activate` and `variation` method _must_ be called after `optlyClientManager` has initallized
```javascript
optlyClientManager.activate('exp_for_b');
optlyClientManager.variation('exp_for_b');
```

---

### Example:
```javascript
optlyClientManager.user('userId', {'tier': 'gold', 'flag': 'B'});
optlyClientManager.track('add_to_cart');
optlyClientManager.init().then(function() {
  // activate and variation can be used here
});
```
