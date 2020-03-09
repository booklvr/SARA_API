const NodeGeocoder = require('node-geocoder');

const options = {
    provider: process.env.GEOCODER_PROVIDER,

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: process.env.GEOCODER_API, // for MapQuest, Open Cage, Google Premier
    formater: null // 'gpx', 'sgring', ...
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;