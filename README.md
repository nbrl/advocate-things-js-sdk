Advocate Things JavaScript SDK [![Build Status](https://travis-ci.org/digitalanimal/advocate-things-js-sdk.svg?branch=master)](https://travis-ci.org/digitalanimal/advocate-things-js-sdk)
==============================

The official Advocate Things SDK for JavaScript. This SDK allows easy integration with our advocacy services.

For more information about what we do, or to talk to us, see [digitalanimal.com](http://digitalanimal.com).

* [Account setup](#account-setup)
* [Data object specification](#data-object-specification)
* [Basic implementation](#basic-implementation)
* [Full implementation](#full-implementation)
* [Reacting to data](#reacting-to-data)
* [API definition](#api-definition)
* [Development and contributing](#development)
* [README conventions](#readme-conventions)

## <a name="account-setup"></a>Account setup/API key
If you haven't done so already, you'll need to [speak to an Advocacy Analyst](http://digitalanimal.com/contact/) to set up an account and get a token for using Advocate Things. Additionally, you'll need to configure a Campaign and register any Sharepoints or Touchpoints of interest.

## <a name="data-object-specification"></a>Data object specification
The data object used by the SDK takes the form below. The SDK itself initialises a basic data object based on what it can find. This can then be augmented by manually/dynamically adding further information to it on a web page. None of the manual fields are mandatory, and the required fields are automatically populated.

```js
{
    // Advocate Things data
    _at: {
        // Either sharepointName OR touchpointName
        // can be defined, not both.
        sharepointName: 'homepage_article',
        touchpointName: 'banner_view',

        // User-related data
        userId: 'uid1234',
        username: 'johnsmith58',
        email: 'john@smith.com',
        name: 'John Smith',
        facebookId: '1234',
        twitterId: '21361816e863217',

        shareChannel: 'twitter',    // only on token consumption,
        shareTokenAlias: 'dave123'  // only on token creation
    },

    // Outside of the _at property, you can define
    // any metadata about the Sharepoint or Touchpoint.
    transaction: {
        currency: 'GBP',
        amount: 50.99
    },
    product: {
        id: 'GLP12345',
        name: 'Gibson Les Paul',
        colour: 'Tobacco Burst'
    },
    user: {
        twitter_id: '21361816e863217'
    },
    somethingElse: {
        myField: true,
        myOtherField: 'value'
    }
}
```

## <a name="basic-implementation"></a>Basic implementation
The simplest implementation of the SDK on a webpage is where the only addition is to reference it as a script. It uses a similar asynchronous loading pattern to other modern JS SDKs. Just this change allows address bar sharing to be monitored:

```html
<script type="text/javascript">
    window.atAsyncInit = function () {
        AT.init({
            apiKey: '{{ YOUR_API_KEY }}'
        });
    };

    (function (d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://d22stxronnwc65.cloudfront.net/sdk-latest.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'advocate-things-jssdk'));
</script>
```

*It is recommended to place this code snippet in your website's template page. It should appear before the closing `</head>` tag.*

The inclusion of the SDK introduces a single global variable `AT` which houses
the public methods of the API and is necessary precursor for all
implementations.

Once the SDK has initialised, it will append a query parameter to the current
URL with a token as the value. This token allows address bar sharing to be
monitored (e.g. someone sharing by copying and pasting a URL rather than with
share buttons). Those wishing to deactivate this feature should request that
*address bar sharing* is deactivated by contacting an
[Advocacy Analyst](http://digitalanimal.com/contact/).

Any functions that are dependent on the SDK being loaded, such as [adding event listeners](#reacting-to-data), should be present inside the `window.atAsyncInit` function. This function is only run when the SDK has fully loaded.

## <a name="full-implementation"></a>Full implementation
Although the above is sufficient to monitor address bar sharing, the SDK allows more powerful interaction with advocates and their friends. To harness it we need to use the data object mentioned above in one of two ways:

* *automatically* - where the SDK sends data when the script loads,
* *ad-hoc.* - where JavaScript can be written to send data manually.

The former is very convenient, whilst the latter allows more control and access to callback functions.

### <a name="full-implementation-auto-send"></a>Automatically send data
In this case, the SDK first reads any data in the global `window.advocate_things_data` (*note: this must be initialised __before__ the SDK is loaded to be useful*). The configurable structure of this object is as [above](#data-object-specification), for example:

```html
<head>
    <script type="text/javascript">
        window.advocate_things_data = {
            _at: {
                userId: '1234'
            },
            page: {
                category: 'checkout'
            },
            transaction: {
                amount: 15.99,
                currency: 'GBP'
            }
        };
    </script>
    <script type="text/javascript">
        window.atAsyncInit = function () {
            AT.init({
                apiKey: '{{ YOUR_API_KEY }}',
                autoSend: true // this is default, but best to be explicit
            });
        });

        (function (d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "https://d22stxronnwc65.cloudfront.net/sdk-latest.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'advocate-things-jssdk'));
    </script>
</head>
```

Naturally, the values in this object would not be static for all users / transactions. In the scenario where this data can be added server-side, the above is sufficient. If for example, an AJAX request is required to get the data, implementation will differ - either the SDK must be loaded once `advocate_things_data` has been populated (if using [`autoSend`](#api-init)), or the data can be used to [update the token](#full-implementation-manual-send) after your web page has received the data.

### <a name="full-implementation-manual-send"></a>Manually send data
To have more control over when and what data is sent to Advocate Things, the SDK provides a JavaScript API through which you can send, receive and react to data by calling it explicitly. Naturally, the [SDK must be loaded](#basic-implementation) before these functions are available. The SDK should be loaded as above, but the object passed to [`init`](#api-init) can be changed:

```js
AT.init({
    apiKey: '{{ YOUR_API_KEY }}',
    autoSend: false,
    debug: true
});
```

See [`init`](#api-init) for all initialisation options.

To manually register touch data, use the [`registerTouch`](#api-registertouch) function:

```js
AT.registerTouch('my-touchpoint-name', {
    _at: {
        userId: '1234',
        email: 'john@smith.com'
    },
    transaction: {
        amount: 20.00
    }
});
```

Manually creating a share token is exactly the same, except uses the [`createToken`](#api-createtoken) function.

```js
AT.createToken('my-sharepoint-name', {
    _at: {
        userId: '1234',
        email: 'john@hotmail.com'
    },
    transaction: {
        amount: 20.00
    }
});
```

Once a share token is created, its associated data can be updated using [`updateToken`](#api-updatetoken).

```js
AT.updateToken('abc123', {
    _at: {
        userId: '1234',
        email: 'john@smith.com'
    },
    user: {
        signInCount: 47
    }
});
```

If it is important that this token no longer receives updates, it can be locked using [`lockToken`](#api-locktoken).

```js
AT.lockToken('abc123');
```

To consume a token (*i.e.* when a share is made), use [`consumeToken`](#api-consumetoken). It can optionally be provided with more metadata about the share (*e.g.* a share network), even if the token is locked.

```js
AT.consumeToken('abc123', {
    _at: {
        shareChannel: 'twitter'
    },
    transaction: {
        amount: 200.99
    }
});
```

The full definition of these functions can be [seen below](#api-definition).

## <a name="reacting-to-data"></a>Reacting to events
Sending data to Advocate Things will allow insight to be gleaned about Advocacy around your brand. To fully leverage the power of Advocate Things however, you will want to react to a user's data.

There are two ways to do this, event listeners and callbacks. Event listeners are called after something has definitely occurred - if [`AT.Events.TokenConsumed`](#api-events) has been called, the Sharepoint data has certainly been saved and a Share registered; callbacks however will be run on the callback from the function it is attached to, which may or may not have been successful, so callbacks must handle an error case.

### Event listeners
The first step is to register your custom event listener to an event. The SDK exposes a function [`addEventListener`](#api-addeventlistener) for this purpose. Also available is an enumeration of events under [`AT.Events.*`](#api-events) to ensure only available events can be bound to.

To ensure an event listener always fires when *e.g.* [`autoSend`](#api-init) is active, ensure they are defined **before** [`AT.init({ ... })`](#api-init), within `window.atAsyncInit`.

```js
AT.addEventListener(AT.Events.TokenConsumed, function (meta) {
    // My function here.
});
```

The above registers a function to be run whenever the [`TokenConsumed`](#api-events) event is triggered, that is when there has been a response after consuming a Sharepoint token (*i.e.* a Share has actually happened). The function is called with some useful data, which differs depending on the event, in this case it will be an array of objects defining the relevent Sharepoints - see the [API definition](#api-metadata) for details.

Event listeners can be used to do numerous useful things, such as populating social share buttons with an ID that allows Advocate Things to know who the Advocate was when someone returns to your site from an Advocate's share. In this case, the [`AT.Events.ReferredPerson`](#api-events) event is triggered when the Advocate's friend returns to your site, allowing you to give a personalised greeting from the referring Advocate!

### Callbacks
Callbacks can be used when manually sending data to Advocate Things, e.g. when using [`createToken`](#api-createtoken), [`updateToken`](#api-updatetoken), [`lockToken`](#api-locktoken) or [`consumeToken`](#api-consumetoken). All four of these functions take an optional callback argument to run after the data has been sent and a response has been received from Advocate Things.

```js
AT.createToken('sharepoint-name', {
    _at: {
        userId: '1234'
    }
}, function (err, meta) {
    // Callback function
    if (err) {
        // Handle error case
    }
    // Do things with metadata
});
```

To reiterate the above, callbacks are run regardless of the success of the preceding function (in this case [`createToken`](#api-createtoken)), and therefore the error case must be handled (for example after an unsuccessful AJAX request during [`createToken`](#api-createtoken)).

## <a name="api-definition"></a>API definition
* [`init`](#api-init)
* [`createToken`](#api-createtoken)
* [`updateToken`](#api-updatetoken)
* [`lockToken`](#api-locktoken)
* [`consumeToken`](#api-consumetoken)
* [`registerTouch`](#api-registerTouch)
* [`addEventListener`](#api-addeventlistener)
* [`callback`](#api-callback-function)
* [Sharepoint metadata](#api-metadata-sharepoint)
* [Touchpoint metadata](#api-metadata-touchpoint)
* [Events](#api-events)
* [Other available data](#other-available-data)

### <a name="api-init"></a>`AT.init(config)`
Initialises the SDK.

* `config` *object* - required configuration object to initialise the SDK with. A full sample is below, with the values set to their defaults.

```js
AT.init({
    apiKey: '{{ YOUR_API_KEY }}', // only required property
    debug: false,
    autoSend: true,
    autoLock: false
});
```

* `apiKey` *string* - your Advocate Things API key.
* `debug` *boolean* - print debugging messages if true.
* `autoSend` *string* - true, false, 'touch' or 'share'. Automatically register a touch and create a share token if true, do nothing if false, only register a touch if 'touch' or only create a share token if 'share'.
* `autoLock` *boolean* - applies only to those tokens created by `autoSend`. Will automatically lock any token as soon as it is created to prevent further updates.

### <a name="api-createtoken"></a>`AT.createToken([name, data, callback])`
Creates a new Sharepoint token.

* `[name]` *string* - name of the current Sharepoint.
* `[data]` *object* - [data object](#data-object-specification) to associate with the share token.
* [`[callback(err,meta)]`](#api-callback-function) *function* - optional function called with error parameter plus associated [Sharepoint metadata](#api-metadata-sharepoint) when Advocate Things has responded to the data sent.

```js
AT.createToken('my-sharepoint-name', {
    _at: {
        userId: '1234'
    }
}, function (err, meta) {
    if (err) {
        console.warn(err);
        return;
    }

    console.info('Success! Current shareToken is: ' + meta[0].token);
});
```

Since the callback is optional, the following is also valid:

```js
AT.createToken('my-sharepoint-name', {
    _at: {
        userId: '1234'
    }
});
```

Or even:

```js
AT.createToken('my-sharepoint-name');
```

Or finally, the following will create a token for every Sharepoint registered to the current URL:

```js
AT.createToken();
```

### <a name="api-updatetoken"></a>`AT.updateToken([token,] data, callback])`
Updates the metadata associated with a share token. If the share token is defined, the metadata associated with it will be updated; if it is not defined, the metadata associated with the share token for the first Sharepoint on the given page will be updated.

* `[token]` *string* - the token to update.
* `data` *object* - the new [data](#data-object-specification) with which to update the share token.
* [`[callback(err,token)]`](#api-callback-function) *function* - optional function called with error parameter plus the token when Advocate Things has responded to the data sent.

```js
AT.updateToken('abc123', {
    _at: {
        userId: '1234'
    }
}, function (err, token) {
    if (err) {
        console.warn(err);
        return;
    }

    console.info('Success! Updated token: ' + token);
});
```

Or to update the default token without a callback:

```js
AT.updateToken({
    _at: {
        userId: '1234'
    }
});
```

### <a name="api-locktoken"></a>`AT.lockToken(token[,callback])`
Locks the token provided so that any further calls to `AT.updateToken` will not apply. One final data amendment can be made with the token is [consumed](#api-consumetoken).

* `token` *string* - the token to lock.
* [`[callback(err,token)]`](#api-callback-function) *function* - optional function called with error parameter plus the token when Advocate Things has responded to the data sent.

```js
AT.lockToken('abc123', function (err, token) {
    if (err) {
        console.warn(err);
        return;
    }

    console.info('Success! Locked token: ' + token);
});
```

### <a name="api-consumetoken"></a>`AT.consumeToken(token[,data,callback])`
Consumes the token, updating the associated metadata if desired. Token consumption is for use when a share is actually happening, *e.g.* a social sharing button has been clicked. Token consumption implicitly locks the token.

* `token` *string* - the token to consume.
* `[data]` *object* - the new [data](#data-object-specification) with which to update the share token.
* [`[callback(err,token)]`](#api-callback-function) *function* - optional function called with error parameter plus the token when Advocate Things has responded to the data sent.

```js
AT.consumeToken('abc123', {
    _at: {
        shareChannel: 'twitter'
    }
}, function (err, token) {
    if (err) {
        console.warn(err);
        return;
    }

    console.info('Success! Consumed token: ' + token);
});
```

Or to consume the token without adding data:

```js
AT.consumeToken('abc123');
```

### <a name="api-registerTouch"></a>`AT.registerTouch([name, data, callback])`
Sends Touchpoint data to Advocate Things.

* `[name]` *string* - name of the current Touchpoint.
* `[data]` *object* - [data object](#data-object-specification) associated with the Touchpoint.
* [`[callback(err,meta)]`](#api-callback-function) *function* - optional function called with error parameter plus associated [Touchpoint metadata](#api-metadata-touchpoint) when Advocate Things has responded to the data sent.

```js
AT.send('my-touchpoint-name', {
    _at: {
        userId: '1234'
    }
}, function (err, meta) {
    if (err) {
        console.warn(err);
        return;
    }

    console.info('Success! Referring share token is: ' + meta.token);
    console.info('Advocate metadata is: ' + meta.metadata;
});

```

### <a name="api-addeventlistener"></a>`AT.addEventListener(type, listener)`
Registers functions to be called when various [Advocate Things events](#api-events) occur.

* `type` *string* -name of the event to listen to. A helper [event enumeration](#api-events) is provided which exposes all available events.
* `listener(meta)` - function to handle the relevant event. Called with one argument, `meta` which contains the data associated with the type of event ([Sharepoint metadata](#api-metadata-sharepoint), [Touchpoint metadata](#api-metadata-touchpoint)).

```js
// Example to show a div with the referring (sharing) user's name
// and photo displayed to the user who has been referred when they
// land back on your site.
AT.addEventListener(AT.Events.ReferredPerson, function (meta) {
    // Assuming this Touchpoint has been triggered after an
    // Advocate has shared at a Sharepoint sending the following
    // data: { _at: { ... },
    //         transaction: { amount: 200 },
    //         user: { facebookId: '1234567' }
    //       }

    // Pretend call to get user data from a Facebook API.
    var myFriend = FacebookSDK.getPerson(meta.user.facebookId);

    var referralDiv = document.getElementById('referral');
    referralDiv.innerHTML = 'You were referred by ' + myFriend.name;
    div.style.display = 'block'; // assuming it was 'none'

    var fbPhotoUrl = myFriend.photoUrl;
    var photo = document.createElement('img');
    photo.setAttribute('src', fbPhotoUrl);
    referralDiv.appendChild(photo);
});
```

### <a name="api-callback-function"></a>`[callback]`
The callback function can optionally be provided to any of the functions above if you want to respond immediately to their responses, including handling error cases.

* `err` *string* - set to `null` or the `statusText` of the `XMLHttpRequest` if it is unsuccessful.
* `meta` *object*, *array* or *string* - set to the metadata associated with either the Sharepoint or Touchpoint sent or a share token string.

### <a name="api-metadata"></a><a name="api-metadata-sharepoint"></a>Sharepoint metadata
Sharepoint metadata is always an array. Usually it is the first element that will be of most use, though further elements will be of interest for more advanced implementations. The array consists of objects with keys `sharepointName`, `token`, `alias`, `queryParamName` and `abs` (address bar sharing).

```js
var meta = [
    {
        sharepointName: 'my-sharepoint-name'.
        token: 'abcdef123456',
        alias: 'myalias',
        queryParamName: 'AT',
        abs: true
    },
    {
        sharepointName: 'my-other-sharepoint-name',
        token: 'uvwxyq456789',
        alias: '',
        queryParamName: 'AT',
        abs: false
    }
];
```

Multiple objects can be returned in the event that multiple Sharepoints exist on one URL.

### <a name="api-metadata-touchpoint"></a>Touchpoint metadata
Touchpoint metadata is always an object, this object contains all of the metadata provided at the Sharepoint through which a user reached the Touchpoint.

E.g. if some Sharepoint data was sent as:

```js
{
    _at: {
        ...
    },
    products: [
        'firetruck',
        'bucket'
    ],
    transaction: {
        amount: 12.49,
        currency: 'GBP'
    }
}
```

The metadata sent to downstream Touchpoints (either to event listeners or callbacks) will be of the form:

```js
var meta = {
    products: [
        'firetruck',
        'bucket'
    ],
    transaction: {
        amount: 12.49,
        currency: 'GBP'
    }
};
```

### <a name="api-events"></a>Events
Six events are currently provided by the SDK.

* `AT.Events.TokenCreated` - triggered when a token has been created. Metadata is an array of [Sharepoint metadata](#api-metadata-sharepoint).
* `AT.Events.TokenUpdated` - triggered when a token has been updated. Metadata is the token which was updated.
* `AT.Events.TokenLocked` - triggered when a token has been locked. Metadata is the token which was locked.
* `AT.Events.TokenConsumed` - triggered when a token has been consumed. Metadata is the token which was consumed.
* `AT.Events.TouchRegistered` - triggered when a touch has successfully been saved. Metadata is [Touchpoint metadata](#api-metadata-touchpoint).
* `AT.Events.ReferredPerson` - triggered when a touch has successfully been saved, which is reached via a share. Metadata is [Touchpoint metadata](#api-metadata-touchpoint).

### Other available Data
Some other data is made available in the `AT` namespace for use.

* `AT.queryParamName` - set to the name of the query parameter as defined when setting up your Client.
* `AT.shareToken` - set to the most recently received Sharepoint token.
* `AT.shareTokens` - set to the current [Sharepoint metadata](#api-metadata-sharepoint).

## <a name="development"></a>Development and contributing
If you wish to contribute to the SDK, the below shows how to set up a development environment, run tests and submit pull requests.

### Overview
The SDK uses a stack consisting of Gulp as a task runner, Karma as a test runner and, locally, PhantomJS to run the tests on. We also harness Travis to run tests automatically for pull requests and Sauce Labs to run tests against real browsers. `npm` is used for development dependencies and `bower` for frontend dependencies.

The core SDK is in `./src/sdk.js` any custom libraries used are in `./lib/` and third-party libraries are provided by Bower, in `./bower_components/`. Tests are all located in the `./test/` directory. Gulp combines and minifies the assorted files into `./dist/`.

*The following assumes a recent installation of [Node.js](https://nodejs.org/) and `npm`.*

### Set up
To set up your local environment, clone this repository and from within it run:

```
$ npm -g install gulp # installs gulp globally for js file building
$ npm install         # installs development dependencies
$ bower install       # installs frontend dependencies
$ gulp build          # builds front end dependencies into distributable js
```

*Note: You may need to use sudo to install globally with `npm`.*

### Testing
Locally, testing uses Gulp, Karma and PhantomJS. To run tests:

```
$ npm test
```

During development, you may wish for changed files to be watched so the tests re-run automatically on change. To have Karma watch for changes, use the watch Gulp task:

```
gulp watch
```

This actually has Gulp watching for changes in `./src` and `./lib` and will rebuild `./dist/sdk.js` when a change is detected. Karma then watches for changes in `./dist` and `./test` and will re-run tests whenever one of those changes.

To run your local code against the same Sauce Labs browsers as Travis will run it against when it is merged, obtain your Sauce Labs username `{{ USERNAME }}` and access key `{{ ACCESS_KEY }}` from your [Sauce Labs account page](https://saucelabs.com/account) and use:

```
export SAUCE_USERNAME="{{ USERNAME }}"
export SAUCE_ACCESS_KEY="{{ ACCESS_KEY }}"
TEST_ON_SAUCE=1 npm test // or TEST_ON_SAUCE=1 gulp test
```

The two exports set your Sauce Labs credentials, and the final line tells Karma (run by Gulp, run by `npm`!) to run the tests against Sauce Labs rather than PhantomJS. It is recommended to use an ["Open Sauce"](http://sauceio.com/index.php/2012/12/announcing-open-sauce-free-unlimited-testing-accounts-for-oss-projects/) [Sauce Labs account](https://www.saucelabs.com/signup/plan/OSS) so that it does not eat into your minutes allowance.

Change the above occurrence of `gulp test` to `gulp test-min` in order to test your minified code, to ensure minification has not introduced any breakages.

### Gulp tasks
* `gulp build` - compiles source files into a single distributable in `./dist/sdk.js`
* `gulp build-local` - as `build` but replaces references to production endpoints with local equivalents
* `gulp clean` - deletes the contents of `./dist/`
* `gulp minify` or `gulp uglify` - minifies the built file into `./dist/sdk.min.js`
* `gulp test` or `gulp` - runs tests for `./dist/sdk.js`
* `gulp test-min` - runs tests for `./dist/sdk.min.js`
* `gulp watch` or `gulp tdd` - watches source files for changes and rebuilds them if changes occur. Runs Karma to run tests with new files when they have changed.

## <a name="readme-conventions"></a>README conventions
### Placeholders
In code snippets, text to be replaced is shown as `{{ NAME }}`, so when you see this:

```html
<script type="text/javascript">
AT.init({
    apiKey: '{{ YOUR_API_KEY }}'
});
</script>
```

You actually need to write something like:

```html
<script type="text/javascript">
AT.init({
    apiKey: 'abcdef123456'
});
</script>
```

### Optional arguments
Optional arguments to functions are shown in square brackets `[` `]`. For example, the following shows a function called `lockToken` which takes two arguments: `token` which is mandatory and a secondary argument `callback` which is optional.

```js
AT.lockToken(token[,callback]);
```
