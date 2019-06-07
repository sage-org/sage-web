/* file : app.js
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

const express = require('express')
const cors = require('cors')
const path = require('path')
const fetchVoID = require('./void.js')
const rdf = require('./rdf.js')

function formatNumber (x) {
  return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

let url = process.argv[2]
if (url.endsWith('/')) {
  url = url.substring(0, url.length - 1)
}
// download the VoID and build the website using it
fetchVoID(url)
  .then(voID => {
    const app = express()
    const { datasets, content } = voID

    app.set('view engine', 'pug')
    app.set('views', path.join(__dirname, 'views'))
    app.use(cors())

    app.use(express.static(path.join(__dirname, 'static')))
    app.use(express.static(path.join(__dirname, '../node_modules')))

    app.get('/', function (req, res) {
      res.render('home', { year: new Date().getFullYear(), serverURL: url, datasets, rdf, formatNumber })
    })

    app.get('/see/:graphName', function (req, res) {
      // get dataset
      const graphName = req.params['graphName']
      const dataset = datasets.find(elt => elt['@id'] === `${url}/sparql/${graphName}`)
      if (dataset === undefined) {
        res.status(404).send(`The RDF dataset with name ${graphName} does not exists on this SaGe server`)
      } else {
        // fetch example queries
        let exampleQueries = []
        if (rdf.SAGE('hasExampleQuery') in dataset) {
          dataset[rdf.SAGE('hasExampleQuery')].forEach(entity => {
            const query = content.get(entity['@id'])
            exampleQueries.push(query)
          })
        }
        // render view
        res.render('see', {
          year: new Date().getFullYear(),
          serverURL: url,
          queryURL: `${url}/sparql`,
          datasetURL: `${url}/sparql/${graphName}`,
          voidURL: `${url}/void/${graphName}`,
          exampleQueries,
          dataset,
          rdf,
          formatNumber
        })
      }
    })

    app.get('/sparql11_compliance', function (req, res) {
      res.render('compliance', {
        year: new Date().getFullYear(),
        serverURL: url,
        datasets,
        rdf,
        formatNumber
      })
    })

    app.get('/api', function (req, res) {
      res.render('api', {
        year: new Date().getFullYear(),
        serverURL: url,
        datasets,
        rdf,
        formatNumber
      })
    })

    app.listen(3000, function () {
      console.log('Sage Web listening on port 3000!')
    })
  }).catch(console.error)
