# MetalSmith Static

Provides a simple plugin to copy assets from /public (configurable) to the build directory.

## Install

```
npm install metalsmith-static
```

## Getting Started

```js
var asset = require('metalsmith-static');
var Metalsmith = require('metalsmith');

var metalsmith = Metalsmith('test/fixtures/one');
metalsmith
  .use(asset())
  .build(function(err) {
    // ...
  });
```


## Using the CLI

The source and destination directores can be configured using the `src` and `dest` options.

```javascript
{
  "metalsmith-static": {
    "src": "public",
    "dest": "."
  }
}
```

## License

The MIT License (MIT)

Copyright (c) 2014 Daniel Fagnan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
