import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import GCloud from './lib/gcloud';

const PORT = process.env.APP_PORT;
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GOOGLE_KEYFILE = path.resolve(__dirname, '..', process.env.GOOGLE_KEYFILE);
const gcloud = GCloud({GOOGLE_PROJECT_ID, GOOGLE_KEYFILE});
const server = express();


server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())

server.get('/buckets', function(req, res, next) {
  gcloud.listBuckets().then(buckets => {
    res.json(buckets);
  }).catch(next);
});

server.get('/putUrl', function(req, res, next) {
  const filename = req.query.filename;
  const contentType = req.query.contentType;
  const bucket = process.env.GOOGLE_DEFAULT_BUCKET;

  gcloud.generatePutUrl({bucket, filename, contentType})
    .then(url => res.json({url}) )
    .catch(next);
})

server.get('/getUrl', function(req, res, next) {
  const filename = req.query.filename;
  gcloud.generateGetUrl({filename})
    .then(url => res.json({url}))
    .catch(next);
})

server.delete('/file', function(req, res, next) {
  const filename = req.body.filename;
  gcloud.deleteFile({filename})
    .then(resp => res.json({resp}))
    .catch(next);
})

server.use('/', function(req, res, next) {
  res.send("Structure.pm GCloud Storage Service.");
});


server.use(function(req, res, next) {
  let error = new Error("not found.");
  err.status = 404;
  return next(err);
});

server.use(function(err, req, res, next) {
  console.error(err.stack);
  let status = err.status || 400;

  return res.status(status).json({error: err.message});
});


server.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}`);
});
