# sage-web

Generate an interactive Web interface for a SaGe SPARQL query server.

# Installation

```bash
npm install -g sage-web
```

# Usage

Use the `sage-web` CLI program to start an interactive website for a SaGe server. Its only argument is the URL to the SaGe server.
For example, `sage-web http://soyez-sage.univ-nantes.fr` launch an ionteractive website similar to the one running at [http://sage.univ-nantes.fr](http://sage.univ-nantes.fr).

```
Usage: sage-web <urls ...>

Start a Web server to serve the SaGe interactive website

Options:
  -V, --version      output the version number
  -p, --port <port>  Port on which the server should listen (default: 3000)
  -h, --help         output usage information
```
