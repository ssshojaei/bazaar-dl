const axios = require('axios')

const fixNumbers = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))

const getLink = async (package) => {
	return axios
		.post(
			'https://api.cafebazaar.ir/rest-v1/process/AppDownloadInfoRequest',
			{
				properties: {
					androidClientInfo: {
						sdkVersion: 22,
						cpu: 'x86,armeabi-v7a,armeabi',
					},
				},
				singleRequest: {
					appDownloadInfoRequest: {
						downloadStatus: 1,
						packageName: package,
					},
				},
			},
			{
				headers: {
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
			}
		)
		.then((res) => {
			const token = res.data.singleReply.appDownloadInfoReply.token
			const cdnPrefix = res.data.singleReply.appDownloadInfoReply.cdnPrefix[0]
			const link = `${cdnPrefix}apks/${token}.apk`
			return link
		})
}

module.exports = {
	fixNumbers,
	getLink,
}
