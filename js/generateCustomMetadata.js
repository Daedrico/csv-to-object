const _ = require('lodash')
const fs = require('fs')
const { parse } = require('csv-parse/sync')
const o2x = require('object-to-xml');

var inputFile = 'input/cm.csv'
var outputFolder = 'output/cm'

fs.createReadStream(inputFile)
  .on('data', function (data) {

    _.each(parse(data, { columns: true, skip_empty_lines: true }).filter(v => v.name), r => {
      var newR = _.clone(r)
      newR.values = []

      if (newR.protected === undefined) newR.protected = false

      _.forIn(newR, (v, k) => {
        if (k === 'label') return
        if (k === 'protected') return
        if (k === 'values') return
        if (k === 'name') return _.unset(newR, k)


        newR.values.push({
          field: k,
          value: _({
            '#': v,
            '@': {
              'xsi:type': v ? 'xsd:string' : undefined,
              'xsi:nil': v ? undefined : true
            }
          })
            .pickBy(_.identity)
            .value()
        })
        _.unset(newR, k)
      })

      var obj = {
        '?xml version="1.0" encoding="UTF-8"?': null,
        CustomMetadata: {
          '@': {
            'xmlns': 'http://soap.sforce.com/2006/04/metadata',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema'
          },
          '#': newR
        }
      }

      const fileName = `${outputFolder}/${r.name}.${r.label}.md`
      fs.writeFile(fileName, o2x(obj), (err) => {
        if (err) throw err
        console.log(`${fileName} was succesfully saved!`)
      })
    })
  })