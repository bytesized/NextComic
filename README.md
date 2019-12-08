# NextComic

A quicker way to read web comics using the arrow keys.

Development still in progress.

## Development

Requires Node be installed. The necessary dependencies can be installed to work with this code by running `npm install` in the repository's directory.

### Building

The webextension can be built with:
```BASH
> npm run bundle
```

### Tests

#### Linting

There is available linting through [ESLint](https://eslint.org/) and [web-ext](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext_lint).
```BASH
> npm run lint         # Runs all linters
> npm run lint:eslint  # Runs eslint
> npm run lint:webext  # Runs web-ext
```

#### Additional Testing

I'm working on getting testing up and running. I'm planning to model them after the ones in [this example extension](https://github.com/Standard8/example-webextension).

Requirements to run tests:
 - Node
 - GeckoDriver - The latest GeckoDriver can be found [here](https://github.com/mozilla/geckodriver/releases/) and should be extracted somewhere in your PATH.
