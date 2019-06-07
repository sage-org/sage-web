/* file : void.js
MIT License

Copyright (c) 2019 Thomas Minier

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
*/

'use strict'
const { DCTERMS, HYDRA, SAGE, SD, RDF, RDFS } = require('./rdf.js')
const request = require('request')

// fetch the VoID description of a server
function fetchVoID (url) {
  if (url.endsWith('/')) {
    url = url.substring(0, url.length - 1)
  }
  return new Promise((resolve, reject) => {
    request({
      url: `${url}/void`,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }, (err, res) => {
      if (err) {
        reject(err)
      }
      const body = JSON.parse(res.body)
      const m = new Map()
      body.forEach(entity => {
        m.set(entity['@id'], entity)
      })
      resolve(m)
    })
  })
}

module.exports = fetchVoID
