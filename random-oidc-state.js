const { randomBytes } = require('crypto')

for (let index = 0; index < 8; index++) {
	console.log(randomBytes(32).toString('base64url'));
}