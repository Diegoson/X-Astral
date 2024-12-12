const bufferToJSON = (obj) => {
	if (Buffer.isBuffer(obj)) return { type: 'Buffer', data: Array.from(obj) };
	if (Array.isArray(obj)) return obj.map(bufferToJSON);
	if (obj && typeof obj === 'object') {
		return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, bufferToJSON(value)]));}
	return obj;
};

const jsonToBuffer = (obj) => {
	if (obj?.type === 'Buffer' && Array.isArray(obj.data)) return Buffer.from(obj.data);
	if (Array.isArray(obj)) return obj.map(jsonToBuffer);
	if (obj && typeof obj === 'object') {
		return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, jsonToBuffer(value)]));}
	return obj;
};

const profile = async (name, fn, logger) => {
	const start = performance.now();
	const result = await fn();
	const end = performance.now();
	logger.debug(`${name} took ${(end - start).toFixed(2)} ms
`);
	return result;
};

module.exports = {
	bufferToJSON,
	jsonToBuffer,
	profile,
};
  
