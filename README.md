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
        twitterId: '21361816e863217'
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
The simplest implementation of the SDK on a webpage is where the only addition is to reference it as a script. Just this change allows Background Advocacy to be monitored:

```html
<script id="advocate-things-script"
        src="https://d22stxronnwc65.cloudfront.net/at-sdk-0.0.1.js?key={{ YOUR_KEY }}"
        type="text/javascript"></script>
```

* The script tag requires an `id` equal to `advocate-things-script`
* The `src` must be suffixed by a query parameter style `?key={{ YOUR_KEY }}`

*It is recommended to place this code snippet in your website's template page. It should appear before the closing `</head>` tag.*

The inclusion of the SDK introduces a single global variable `AT` which houses
the public methods of the API and is necessary precursor for all
implementations.

Once the SDK has initialised, it will append a query parameter to the current
URL with a token as the value. This token allows background advocacy to be
monitored (e.g. someone sharing by copying and pasting a URL rather than with
share buttons). In future, it will be possible to deactivate this feature, as
well as modify it to use a custom key.

## <a name="full-implementation"></a>Full implementation
Although the above is sufficient to monitor background advocacy, the SDK allows more powerful interaction with advocates and their friends. To harness it we need to use the data object mentioned above in one of two ways: automatically, where the SDK sends data when the script loads and *ad-hoc.*, where JavaScript can be written to send data manually. The former is very convenient, whilst the latter allows more control and access to the callback function.

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
                category: 'checkout',
            },
            transaction: {
                amount: 15.99,
                currency: 'GBP'
            }
        };
    </script>
    <script id="advocate-things-script"
        src="https://d22stxronnwc65.cloudfront.net/at-sdk-0.0.1.js?key=abcdef"
        type="text/javascript"></script>
</head>
```

Naturally, the values in this object would not be static for all users / transactions. In the scenario where this data can be added server-side, the above is sufficient. If for example, an AJAX request is required to get the data, implementation will differ - either the SDK must be loaded once `advocate_things_data` has been populated, or the data can be [sent manually](#full-implementation-manual-send) after your web page has received the data.

### <a name="full-implementation-manual-send"></a>Manually send data
To have more control over when and what data is sent to Advocate Things, the SDK provides a JavaScript API through which you can send, receive and react to data by calling it explicitly. Naturally, the [SDK must be loaded](#basic-implementation) before these functions are available.

To manually send Touchpoint data, use the `sendTouchpoint` function:

```js
AT.sendTouchpoint('my-touchpoint-name', {
    _at: {
        userId: '1234',
        email: 'john@smith.com'
    },
    transaction: {
        amount: 20.00
    }
});
```

Manually sending Sharepoint data is exactly the same, except uses the `sendSharepoint` function.

```js
AT.sendSharepoint('my-sharepoint-name', {
    _at: {
        userId: '1234',
        email: 'john@smith.com'
    },
    transaction: {
        amount: 20.00
    }
});
```

There is also a generic `send` function which allows the same automatic detection of whether the current URL is a Sharepoint or a Touchpoint as used in the [automatic data send](#full-implementation-auto-send), if neither `sharepointName` nor `touchpointName` are defined.

```js
AT.send({
    _at: {
        sharepointName: 'my-sharepoint-name',
        userId: '1234',
        email: 'john@smith.com'
    },
    transaction: {
        amount: 20.00
    }
});
```

The full definition of these functions can be [seen below](#api-definition).

## <a name="reacting-to-data"></a>Reacting to data
Sending data to Advocate Things will allow insight to be gleaned about Advocacy around your brand. To fully leverage the power of Advocate Things however, you will want to react to a user's data.

There are two ways to do this, event listeners and callbacks. Event listeners are called after something has definitely occurred - if `AT.Events.SharepointSaved` has been called, the Sharepoint has certainly been saved; callbacks however will be run on the callback from the function it is attached to, which may or may not have been successful, so callbacks must handle an error case.

### Event listeners
The first step is to register your custom event listener to an event. The SDK exposes a function `addEventListener` for this purpose. Also available is an enumeration of events under `AT.Events.*` to ensure only available events can be bound to.

```js
AT.addEventListener(AT.Events.SharepointSaved, function (meta) {
    // My function here.
});
```

The above registers a function to be run whenever the `SharepointSaved` event is triggered, that is when there has been a response after saving a Sharepoint. The function is called with some useful data, which differs depending on the event, in this case it will be [Sharepoint metadata](#api-metadata-sharepoint) - see the [API definition](#api-metadata) for details.

Event listeners can be used to do numerous useful things, such as populating social share buttons with an ID that allows Advocate Things to know who the Advocate was when someone returns to your site from an Advocate's share. In this case, the `AT.Events.ReferredPerson` event is triggered when the Advocate's friend returns to your site, allowing you to give a personalised greeting from the referring Advocate!

### Callbacks
Callbacks can be used when manually sending data to Advocate Things, e.g. when using `send`, `sendSharepoint` or `sendTouchpoint`. All three of these functions take an optional callback argument to run after the data has been sent and a response has been received from Advocate Things.

```js
AT.send({
    _at: {
        touchpointName: 'my-touchpoint-name'
    }
}, function (err, meta) {
    // Callback function
    if (err) {
        // Handle error case
    }
    // Do things with metadata
});
```

To reiterate the above, callbacks are run regardless of the success of the preceding function (in this case `send`), and therefore the error case must be handled (for example after an unsuccessful AJAX request during `send`).

## <a name="api-definition"></a>API definition
* [`sendSharepoint`](#api-sendsharepoint)
* [`sendTouchpoint`](#api-sendtouchpoint)
* [`send`](#api-send)
* [`getShareToken`](#api-getsharetoken)
* [`sendSharepointData`](#api-sendsharepointdata)
* [`addEventListener`](#api-addeventlistener)
* [`callback`](#api-callback-function)
* [Sharepoint metadata](#api-metadata-sharepoint)
* [Touchpoint metadata](#api-metadata-touchpoint)
* [Events](#api-events)
* [Other available data](#other-available-data)

### <a name="api-sendsharepoint"></a>`AT.sendSharepoint(name, data[,callback])`
Sends Sharepoint data to Advocate Things.

* `name` *string* - name of the current Sharepoint.
* `data` *object* - [data object](#data-object-specification) associated with the Sharepoint.
* [`[callback(err,meta)]`](#api-callback-function) *function* - optional function called with error parameter plus associated [Sharepoint metadata](#api-metadata-sharepoint) when Advocate Things has responded to the data sent.

```js
AT.sendSharepoint('my-sharepoint-name', {
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
AT.send('my-sharepoint-name', {
    _at: {
        userId: '1234'
    }
});
```

Or even:

```js
AT.send('my-sharepoint-name', {});
```

### <a name="api-sendtouchpoint"></a>`AT.sendTouchpoint(name, data[,callback])`
Sends Touchpoint data to Advocate Things.

* `name` *string* - name of the current Touchpoint.
* `data` *object* - [data object](#data-object-specification) associated with the Touchpoint.
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

    console.info('Success! Current shareToken is: ' + meta[0].token);
});

```

### <a name="api-send"></a>`AT.send(data[,callback])`
Sends data to the Advocate Things API where the datatype is inferred from the URL by Advocate Things or is given by a `sharepointName` or `touchpointName` parameter in `data`.

* `data` *object* - [data object](#data-object-specification) associated with the Sharepoint or Touchpoint.
* [`[callback(err,meta)]`](#api-callback-function) *function* - optional function called with error parameter plus metadata associated with the type of data sent (either Sharepoint or Touchpoint) when Advocate Things has responded to the data sent.

```js
AT.send({
    _at: {
        sharepointName: 'my-sharepoint-name',
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

### <a name="api-getsharetoken"></a>`AT.getShareToken(data[,callback])`
Obtains a new share token which can be used to prime a share button/link. Should be used in conjuction with [`sendSharepointData`](#api-sendsharepointdata) to consume the token. The two functions together roughly equate to using [`sendSharepoint`](#api-sendsharepoint) with a `name` specified.

* `data` *object* - [data object](#data-object-specification) associated with the share token.
* [`[callback(err,token)]`](#api-callback-function) *function* - optional function called with error parameter plus the requested share token.

```js
AT.getShareToken({
    _at: {
        userId: 1234
    }
}, function (err, token) {
    if (err) {
        console.warn(err);
        return;
    }

    console.info('New share token is: ' + token);
}
```

### <a name="api-sendsharepointdata"></a>`AT.sendSharepointData(name, token, data[,callback])`
Consumes a share token generated by [`getShareToken`](#api-getsharetoken). Use this to register that a share has actually happened.

* `name` *string* - name of the Sharepoint which is consuming this token.
* `token` *string* - the token to consume.
* `data` *object* - [data object](#data-object-specification) associated with the share token.
* [`[callback(err,meta)]`](#api-callback-function) *function* - optional function called with error parameter plus associated [Sharepoint metadata](#api-metadata-sharepoint) when Advocate Things has responded to the data sent.

```js
AT.sendSharepointData('my-sharepoint-name', 'my-token', {
    _at: {
        userId: '1234'
    }
}, function (err, meta) {
    if (err) {
        console.warn(err);
        return;
    }

    console.info('Success! New shareToken is: ' + meta[0].token);
});
```

### <a name="api-addeventlistener"></a>`AT.addEventListener(type, listener)`
Registers functions to be called when various [Advocate Things events](#api-events) occur.

* `type` *string* - name of the event to listen to. A helper [event enumeration](#api-events) is provided which exposes all available events.
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
* `meta` *object* or *array* - set to the metadata associated with either the Sharepoint or Touchpoint sent.

### <a name="api-metadata"></a><a name="api-metadata-sharepoint"></a>Sharepoint metadata
Sharepoint metadata is always an array. Usually it is the first element that will be of most use, though further elements will be of interest for more advanced implementations. The array consists of objects with keys `sharepointName` and `token`.

```js
var meta = [
    {
        sharepointName: 'my-sharepoint-name'.
        token: 'abcdef123456',
    },
    {
        sharepointName: 'my-other-sharepoint-name',
        token: 'uvwxyq456789'
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
Three events are currently provided by the SDK.

* `AT.Events.SharepointSaved` - triggered when a Sharepoint has successfully been saved. Metadata is [Sharepoint metadata](#api-metadata-sharepoint).
* `AT.Events.TouchpointSaved` - triggered when a Touchpoint has successfully been saved. Metadata is [Touchpoint metadata](#api-metadata-touchpoint).
* `AT.Events.ReferredPerson` - triggered when a Touchpoint has successfully been saved, which is reached via a Sharepoint. Metadata is [Touchpoint metadata](#api-metadata-touchpoint).

### Other available Data
Some other data is made available in the `AT` namespace for use.

* `AT.queryParamName` - set to the name of the query parameter as defined when setting up your Client.
* `AT.shareToken` - set to the most recently received Sharepoint token.

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

During development, you may wish for changed files to be watched so the tests re-run automatically on change. To have Karma watch for changes, use the default Gulp task:

```
gulp
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
* `gulp clean` - deletes the contents of `./dist/`
* `gulp minify` or `gulp uglify` - minifies the built file into `./dist/sdk.min.js`
* `gulp test` or `gulp` - runs tests for `./dist/sdk.js`
* `gulp test-min` - runs tests for `./dist/sdk.min.js`
* `gulp watch` - watches source files for changes and rebuilds them if changes occur. Runs Karma to run tests with new files when they have changed.

## <a name="readme-conventions"></a>README conventions
### Placeholders
In code snippets, text to be replaced is shown as `{{ NAME }}`, so when you see this:

```html
<script src="https://some.domain/at-sdk-0.0.1.js?key={{ YOUR_KEY }}"
        type="text/javascript"></script>
```

You actually need to write something like:

```html
<script src="https://some.domain/at-sdk-0.0.1.js?key=abcdef123456"
        type="text/javascript"></script>
```

### Optional arguments
Optional arguments to functions are shown in square brackets `[` `]`. For example, the following shows a function called `send` which takes two arguments: `data` which is mandatory and a secondary argument `callback` which is optional.

```js
AT.send(data[,callback]);
```
