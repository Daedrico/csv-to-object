const _ = require('lodash')
const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const o2x = require('object-to-xml')

const inputFile = 'input/campi.csv'
const outputFile = 'output/Object.xml'

fs.createReadStream(inputFile)
  .on('data', function (data) {
    const obj = {
      '?xml version="1.0" encoding="UTF-8"?': null,
      CustomObject: {
        '#': {
          fields:
            _(parse(data, { columns: true, skip_empty_lines: true }))
              .map(r => {
                if (!r.fullName) {
                  r.fullName = _(r.label)
                    .split(' ')
                    .map(r => { return _.capitalize(r) })
                    .join('') +
                    '__c'
                }

                if (r.type === 'Currency' || r.type === 'Number') {
                  return {
                    fullName: r.fullName,
                    externalId: r.externalId || false,
                    label: r.label,
                    precision: 18,
                    scale: 2,
                    required: r.required || false,
                    trackFeedHistory: r.trackFeedHistory || false,
                    trackHistory: r.trackHistory || false,
                    type: r.type
                  }
                } else if (r.type === 'Date') {
                  return {
                    fullName: r.fullName,
                    externalId: r.externalId || false,
                    label: r.label,
                    required: r.required || false,
                    trackFeedHistory: r.trackFeedHistory || false,
                    trackHistory: r.trackHistory || false,
                    type: r.type
                  }
                } else {
                  return {
                    fullName: r.fullName,
                    externalId: r.externalId || false,
                    label: r.label,
                    length: r.length || 255,
                    required: r.required || false,
                    trackFeedHistory: r.trackFeedHistory || false,
                    trackHistory: r.trackHistory || false,
                    type: r.type,
                    unique: r.unique || false
                  }
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
