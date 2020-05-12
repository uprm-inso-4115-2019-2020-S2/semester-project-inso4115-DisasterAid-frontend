const express = require('express');
const app = express();

app.use(express.static('./dist/disaster-aid'));

app.get('/*', function(req, res) {
  res.sendFile('index.html', {root: 'dist/disaster-aid/'}
);
});

app.listen(process.env.PORT || 8080);
