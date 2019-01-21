const _ = require('lodash')
const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const o2x = require('object-to-xml');

var inputFile = 'input/campi.csv'
var outputFile = 'output/Object.xml'

fs.createReadStream(inputFile)
  .on('data', function (data) {

    var obj = {
      '?xml version="1.0" encoding="UTF-8"?': null,
      CustomObject: {
        '#': {
          fields:
            _(parse(data, { columns: true, skip_empty_lines: true }))
              .map(r => {
                r.fullName = _(r.label)
                  .split(' ')
                  .map(r => { return _.capitalize(r) })
                  .join('')
                  + '__c'

                //per ordinamento esplicito
                return {
                  fullName: r.fullName,
                  externalId: r.externalId,
                  label: r.label,
                  length: r.length,
                  required: r.required,
                  trackFeedHistory: r.trackFeedHistory,
                  trackHistory: r.trackHistory,
                  type: r.type,
                  unique: r.unique
                }
              })
              .orderBy(['fullName'], ['asc'])
              .value()
        }
      }
    }
    fs.writeFile(outputFile, o2x(obj), (err) => {
      if (err) throw err
      console.log(`${outputFile} was succesfully saved!`)
    })
  })