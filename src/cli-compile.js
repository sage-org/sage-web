/* file : cli-compile.js
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
const pug = require('pug')
const { writeFileSync } = require('fs')
const path = require('path')
const fetchVoID = require('./void.js')
const rdf = require('./rdf.js')
const { flatMap } = require('lodash')

function formatNumber (x) {
  return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

program
  .description('Start a Web server to serve the SaGe interactive website')
  .usage('<urls ...>')
  .option('-o, --output <output>', 'Output directory', './build')
  .parse(process.argv)

let urls = program.args.map(url => {
  if (url.endsWith('/')) {
    return url.substring(0, url.length - 1)
  }
  return url
})

// Create template compilers
const homeCompiler = pug.compileFile(path.join(__dirname, 'views/home.pug'))
const seeGraphCompiler = pug.compileFile(path.join(__dirname, 'views/see.pug'))
const apiCompiler = pug.compileFile(path.join(__dirname, 'views/api.pug'))
const complianceCompiler = pug.compileFile(path.join(__dirname, 'views/compliance.pug'))

// download the VoID and build the website using it
Promise.all(urls.map(url => {
  return fetchVoID(url).then(v => {
    return { url, content: v.content, graphs: v.datasets }
  })
})).then(voIDs => {
  // compile views
  const homepage = homeCompiler({
    year: new Date().getFullYear(),
    urls,
    datasets: voIDs,
    rdf,
    formatNumber
  })
  const url = urls[0]
  const seePages = flatMap(voIDs, v => v.graphs).map(graph => {
    const graphName = graph[rdf.DCTERMS('title')][0]['@value']
    const dataset = voIDs[0].content
    let exampleQueries = []
    if (rdf.SAGE('hasExampleQuery') in graph) {
      graph[rdf.SAGE('hasExampleQuery')].forEach(entity => {
        const query = dataset.get(entity['@id'])
        exampleQueries.push(query)
      })
    }
    const page = seeGraphCompiler({
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
    return {graphName, html: page}
  })
  const compliancePage = complianceCompiler({
    year: new Date().getFullYear(),
    rdf,
    formatNumber
  })
  const apiPage = apiCompiler({
    year: new Date().getFullYear(),
    rdf,
    formatNumber
  })

  // write static files
  writeFileSync(program.output + '/index.html', homepage)
  writeFileSync(program.output + '/sparql11_compliance.html', compliancePage)
  writeFileSync(program.output + '/api.html', apiPage)
  seePages.forEach(seePage => {
    writeFileSync(`${program.output}/see/${seePage.graphName}.html`, seePage.html)
  })


}).catch(console.error)
