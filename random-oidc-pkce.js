const { randomBytes, createHash } = require('crypto')

for (let index = 0; index < 8; index++) {

	const code_verifier = randomBytes(32).toString('base64url');
	const code_challenge = createHash('sha256')
		.update(code_verifier)
		.digest('base64url')

	console.log(`${code_verifier} => ${code_challenge}`);
}