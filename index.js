#!/usr/bin/env node

const axios = require('axios')
const cheerio = require('cheerio')
const { fixNumbers, getLink } = require('./libs')

const page = process.argv[2]

axios.get(page).then(async (res) => {
	if (res.status === 200) {
		const html = res.data
		const $ = cheerio.load(html)
		const data = {}
		data.title = $('.cover-header__content > h1').text()
		data.developer = $('.cover-header__title-subtitle').text()
		data.version = $('div.app-details__version--linked')
			.text()
			.replace('نسخه', '')
			.trim()
		data.version = fixNumbers(data.version)
		const package = page.substring(page.lastIndexOf('/') + 1)
		data.link = await getLink(package)

		console.log(data)
	}
})
