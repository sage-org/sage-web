/* file: web-server.js
MIT License

Copyright (c) 2019-2020 Thomas Minier

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

"use strict"

const express = require('express')
const cors = require('cors')
const path = require('path')
const fetchVoID = require('./void.js')
const rdf = require('./rdf.js')

function formatNumber (x) {
  return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

/**
 * Get an express server to serve the interfactive Website
 * @param {string[]} urls - URLs to SaGe servers.
 * @return An Express application pre-configured to serve the website.
 */
function getServer (urls) {
  // download the VoID and build the website using it
  return Promise.all(urls.map(url => {
    return fetchVoID(url).then(v => {
      return { url, content: v.content, graphs: v.datasets }
    })
  })).then(voIDs => {
    const app = express()

    app.set('view engine', 'pug')
    app.set('views', path.join(__dirname, 'views'))
    app.use(cors())

    app.use(express.static(path.join(__dirname, 'static')))
    app.use(express.static(path.join(__dirname, '../node_modules')))

    app.get('/', function (req, res) {
      res.render('home', {
        year: new Date().getFullYear(),
        urls,
        datasets: voIDs,
        rdf,
        formatNumber
      })
    })

    app.get('/see/:graphName', function (req, res) {
      // get dataset for this graph
      const graphName = req.params['graphName']
      const dataset = voIDs.find(elt => {
        return elt.graphs.find(g => g[rdf.DCTERMS('title')][0]['@value'] === graphName) !== undefined
      })
      if (dataset === undefined) {
        res.status(404).send(`The RDF Graph with name ${graphName} does not exists on this SaGe server`)
      } else {
        const url = dataset.url
        // get graph
        const graph = dataset.graphs.find(g => g[rdf.DCTERMS('title')][0]['@value'] === graphName)
        // fetch example queries
        let exampleQueries = []
        if (rdf.SAGE('hasExampleQuery') in graph) {
          graph[rdf.SAGE('hasExampleQuery')].forEach(entity => {
            const query = dataset.content.get(entity['@id'])
            exampleQueries.push(query)
          })
        }
        // render view
        res.render('see', {
          year: new Date().getFullYear(),
          serverURL: url,
          queryURL: `${url}/sparql`,
          graphURL: `${url}/sparql/${graphName}`,
          voidURL: `${url}/void/${graphName}`,
          exampleQueries,
          graph,
          rdf,
          formatNumber
        })
      }
    })

    app.get('/sparql11_compliance', function (req, res) {
      res.render('compliance', {
        year: new Date().getFullYear(),
        rdf,
        formatNumber
      })
    })

    app.get('/api', function (req, res) {
      res.render('api', {
        year: new Date().getFullYear(),
        rdf,
        formatNumber
      })
    })

    return app
  })
}

module.exports = getServer
