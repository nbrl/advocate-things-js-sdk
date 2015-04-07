Advocate Things JavaScript SDK [![Build Status](https://travis-ci.org/digitalanimal/advocate-things-js-sdk.svg?branch=master)](https://travis-ci.org/digitalanimal/advocate-things-js-sdk)
====

The official Advocate Things SDK for JavaScript (currently available for browsers).

## Insallation
### Browser
In order to use the SDK in the browser, simply add the following to your HTML pages:

```html
<script id="advocate-things-script"
        src="https://advocate-things.divshot.com/at-sdk-0.0.1.js?key=YOUR_KEY"
        type="text/javascript"></script>
```

This will, by default introduce a single global variable `AT` which houses the public methods of the API.

It is recommended to place this code snippet in your website's template page. It should appear before the closing `</head>` tag.
[TODO] I think this is ok as we the `AT.send` if clients want to do anything based on the DOM, e.g.

```js
jQuery(function () {
    // DOM is loaded
    AT.sendTouchpoint('page_load', {
        _at: { user_id: jQuery('#name').val() }
    })
});
```


## Implementation
There are two methods of sending data to the Advocate Things API: automatic and ad hoc.

### A note on registering Touch and Sharepoints
Any Touch or Sharepoints MUST be registered with an Advocacy Analyst before implementation - any that **aren't will not be tracked**.

### Automatic
With automatic sending Touchpoints and Sharepoints are identified via URLs. In order to send metadata about these Touchpoints and Sharepoints you should defined a global `advocate_things_data` variable, e.g.

```html
<!-- base_template.handlebars -->
<head>
  <script type="text/javascript">
    window.advocate_things_data = {
  	   _at: {
  	     user_id: '{{ user.id }}'
  	   },
  	   page: {
  	     id: '{{ page.id }}',
  	     category: '{{ page.category }}'
      }
    };
  </script>
  <script src="https://sdk.at.com/at-sdk-0.0.1.js?key=YOUR_KEY"
    type="text/javascript"></script>
</head>
<!-- etc. -->
```
[TODO] WILL WORK / WONT WORK EXAMPLE
### Ad hoc
For ad hoc requests you should send the data using the [JavaScript API](#api-usage) explicitly, e.g.

**NB** the Advocate Things `<script>` tag must have been loaded prior to these actions taking place

#### Touchpoints
```js
document.querySelector('#banner-img')
  .addEventListener('hover', function hoverListener() {
    AT.send({
    	_at: {
    		touchpoint: 'banner-image-hover',
    		user_id: '{{ user.id }}',
    		email: '{{ user.email }}'
    	}
    });
  });
```

#### Sharepoints
[TODO] DO THEN DOCUMENT

## <a name="api-usage"></a>API
* [`send`](#api-send)
* [`sendTouchpoint`](#api-sendtouchpoint)
* [`sendSharepoint`](#api-sendsharepoint)
* [`addEventListener`](#api-addeventlistener)

### <a name="api-send"></a>AT.send([data], [callback])
Sends data to the Advocate Things API.

#### Arguments
* `[data]` - The [data](#data-spec) associated with the {touch,share}point. Default is `window.advocate_things_data`.
* `[callback]` - Function which is called when the HTTP request to the Advocate Things API has completed.

#### Examples
```js
document
  .querySelector('img.banner')
  .addEventListener('click', function handleBtnClick() {
    AT.send({
    	_at: { touchpoint: 'banner_click' }
    }, function () {
    	// Perform button's action
    });
  });
```

```js
document
	.querySelector('#ticket_area')
	.addEventListener('hover', function handleAreaHover() {
		var data = {
			_at: {
				touchpoint: 'ticket_hover'
			}
		};
		AT.send(data);
	});
```

```js
document
	.querySelector('#save_async')
	.addEventListener('click', saveAsync);

function saveAsync() {
	jQuery.get('https://my.api.com/', function (data) {
		var dynamicData = {
			_at: {
				touchpoint: 'newsletter_signup',
				user_id: data.user_id,
				email: data.email
			},
			signup_date: data.timestamp
		};

		AT.send(dynamicData);
	});
}
```

### <a name="api-sendtouchpoint"></a>AT.sendTouchpoint(name, [data], [callback])
A wrapper around `AT.send` for touchpoint data.

#### Arguments
* `name` - The touchpoint name which has occurred.
* `[data]` - The [data](#data-spec) associated with the touchpoint. Default is `window.advocate_things_data`.
* `[callback]` - Function which is called when the HTTP request to the Advocate Things API has completed.

#### Examples
```js
document.querySelector('#my-img')
    .addEventListener('hover', function hoverListener() {
  	     AT.sendTouchpoint('img-hover', {
  	         _at: { user_id: '{{ user.id }}' }
  	     });
    });
```

### <a name="api-sendsharepoint"></a>AT.sendSharepoint(name, data, [callback])
A wrapper around `AT.send` for sharepoint data.

#### Arguments
* `name` - The sharepoint name which has occurred.
* `[data]` - The [data](#data-spec) associated with the sharepoint. Default is `window.advocate_things_data`.
* `[callback]` - Function which is called when the HTTP request to the Advocate Things API has completed.

#### Examples
```js
AT.addEventListener(AT.Events.SharepointSaved, function (data) {
    window.open(data.share_url);
});

document.querySelector('#fb-button')
    .addEventListener('click', function handleFacebookClick() {
        AT.sendSharepoint('homepage-buttons', {
    	     _at: {
    	         user_id: '{{ user.id }}',
    	         share_channel: 'facebook'
     	     }
        });
    });
```

### <a name="api-addeventlistener"></a>AT.addEventListener(type, listener)
Allows you to register event listeners for Advocate Things events.

#### Arguments
* `type` - The name of the event to listen to. A helper 'enum' [`AT.Events`](#events) is provided which exposes all available events.
* `listener(data)` - Function to handle the event as specified by the `type` argument. `data` will contain metadata about the sharepoint from which this touchpoint originated (`null` if no data available).

#### Examples
```js
AT.addEventListener(AT.Events.TouchpointSaved, function (data) {
    var imgEl = document.querySelector('#my_img');

    // This metadata was provided at the sharepoint, e.g.
    // AT.send({ _at: {}, product: { url: 'http://...' } });
    imgEl.src = data.sharepoint.product_url;
});
```

#### Arguments
* `callback()` - Callback which is called when Advocate Things functionality has been initialised.

## <a name="events"></a>Events
These are the events provided by Advocate Things (for convenience the underlying event names are encapsulated in the `AT.Events` namespace):

* `AT.Events.TouchpointSaved`
* `AT.Events.SharepointSaved`
* `AT.Events.ReferredPerson`

## <a name="data-spec"></a>Data Object Spec
TODO: do you think we should document the 'under the hood' props, e.g. `clientToken`, `{touch,share}point_url` etc.?

```js
{
	// Advocate Things specific data. This must be present.
	_at: {
		clientToken: '$your_token_here', // <-- automatically added
		// Only one of {touch,share}point should be
		// specified.
		{touch,share}point: 'homepage_view',
		{touch,share}point_url: '', // <-- if identifying via URL
		user_id: 'U12345',
		username: 'johnsmith87',
		email: 'john@smith.com',
		name: 'John Smith',
		share_channel: 'facebook' // <-- sharepoint only
	},
	// Outside of the `_at` property you can specify any
	// metadata about the {touch,share}point you like.
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
		twitter_id: 21361816e863217
	}
}
```

[TODO] we should likely have an examples/ directory which could contain an example for universal_variable

## Development

### Set up
To set up your local environment, clone this repo and from within it run:
```
$ npm -g install gulp # installs gulp globally for js file building
$ npm install         # installs development dependencies
$ bower install       # installs frontend dependencies
$ gulp build          # builds front end dependencies into distributable js
```

Note: You may need to use sudo to install globally with `npm`.

### Testing
Locally, testing uses Gulp, Karma and PhantomJS. To run tests:

```
$ gulp test
```

During development, you may wish for changed files to be watched so you the
tests re-run automatically on change. To have Karma watch, use the default Gulp
task:

```
gulp
```

This actually has Gulp watching for changes in `./src` and `./lib` and will
rebuild `./dist/sdk.js` on changes. Karma then watches for changes in `./dist`
and `./test` and will re-run tests whenever one of those changes.

To run your local code against the same Sauce Labs browsers as Travis will run
it against when it is merged, obtain your Sauce Labs username `${USERNAME}` and
access key `${ACCESS_KEY}` and use:

```
export SAUCE_USERNAME="${USERNAME}"
export SAUCE_ACCESS_KEY="${ACCESS_KEY}"
TEST_ON_SAUCE=1 gulp test
```

The two exports set your Sauce Labs credentials, and the final line tells
Karma (run by Gulp) to run the tests against Sauce Labs rather than PhantomJS.

Change any above occurrence of `gulp test` to `gulp test-min` in order to test
your minified code, to ensure minification has not introduced any breakages.

### Building
In order to build the JS file use the following:

```
$ gulp build
```

The built file will end up in `${clone}/dist/sdk.js`. It is not yet minified.
