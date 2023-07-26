# template ODD ![tests](https://github.com/nichoth/template-odd/actions/workflows/nodejs.yml/badge.svg)

An example of [ODD](https://github.com/oddsdk/ts-odd) + tests in both node and a browser environment.

## use
Use Github's "template" button in the GUI, then `npm init`.

## test

### run all tests
```
npm test
```

### test in a browser
```
npm run test:browser
```
This will use [tape-run](https://github.com/juliangruber/tape-run) to run tests in a browser environment, but stream output to stdout.

### test in node
```
npm run test:node
```
This uses [node-components](https://github.com/ssc-hermes/node-components) to create an instance of `odd` that will run in node.

## CI
This includes an example of Github's CI service. It will run tests on any push event.
