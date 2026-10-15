const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  ROOT: path.join(__dirname, '..'),
  GRAPH_VERSION: process.env.META_GRAPH_VERSION || 'v21.0',
  DB_PATH: process.env.TRACKER_DB || path.join(__dirname, '..', 'tracker.sqlite'),
};
