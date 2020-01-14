/* file : cli-serve.js
MIT License

Copyright (c) 2019 Thomas Minier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict'

const program = require('commander')

const getServer = require('./web-server.js')

program
  .name('sage-web server')
  .description('Start a Web server to serve the SaGe interactive website')
  .usage('<urls ...>')
  .option('-p, --port <port>', 'Port on which the server should listen', 3000)
  .parse(process.argv)

let urls = program.args.map(url => {
  if (url.endsWith('/')) {
    return url.substring(0, url.length - 1)
  }
  return url
})

getServer(urls)
  .then(app => {
    app.listen(program.port, function () {
      console.log(`Sage Web listening on port ${program.port}!`)
    })
  }).catch(console.error)
