#!/usr/bin/env node

/*!
 * Script to create the built examples zip archive;
 * requires the `zip` command to be present!
 * Copyright 2020 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

/* eslint-disable camelcase */

'use strict'

const path = require('path')
const sh = require('shelljs')

const { version, version_short } = require('../package.json')

const folderName = `bootstrap-${version}-examples`

sh.config.fatal = true

// switch to the root dir
sh.cd(path.join(__dirname, '..'))

// remove any previously create folder with the same name
sh.rm('-rf', folderName)
sh.mkdir('-p', folderName)

// copy the examples and dist folders; for the examples we use `*`
// so that its content are copied to the root dist dir
sh.cp('-Rf', [
  `_gh_pages/docs/${version_short}/examples/*`,
  `_gh_pages/docs/${version_short}/dist/`
], folderName)
sh.rm(`${folderName}/index.html`)

// sed-fu
sh.find(`${folderName}/**/*.html`).forEach(file => {
  sh.sed('-i', new RegExp(`"/docs/${version_short}/`, 'g'), '"../', file)
  sh.sed('-i', /(<link href="\.\.\/.*) integrity=".*>/g, '$1>', file)
  sh.sed('-i', /(<script src="\.\.\/.*) integrity=".*>/g, '$1></script>', file)
})

// create the zip file
sh.exec(`zip -r9 "${folderName}.zip" "${folderName}"`, { fatal: true })

// remove the folder we created
sh.rm('-rf', folderName)
