module.exports = async function (context) {
	if (context.electronPlatformName === 'linux') {
		const sandbox_fix = require('electron-builder-sandbox-fix');
		await sandbox_fix(context);
	}
}