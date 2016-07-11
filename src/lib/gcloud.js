import Promise from 'bluebird';
import {minutesFromNow} from './util';
import GCloud from 'gcloud';



export default function(options) {
  const GOOGLE_PROJECT_ID = options.GOOGLE_PROJECT_ID || process.env.GOOGLE_PROJECT_ID;
  const GOOGLE_KEYFILE = options.GOOGLE_KEYFILE || process.env.GOOGLE_KEYFILE;
  const GOOGLE_DEFAULT_BUCKET = options.GOOGLE_DEFAULT_BUCKET || process.env.GOOGLE_DEFAULT_BUCKET;

  const gcloud = GCloud({
    projectId: GOOGLE_PROJECT_ID,
    keyFilename: GOOGLE_KEYFILE
  });
  const gcs = gcloud.storage();
  Promise.promisifyAll(gcs);


  return {
    listBuckets: function() { return gcs.getBucketsAsync(); },
    generatePutUrl: function(options) { return signedUrl('write', options); },
    generateGetUrl: function(options) { return signedUrl('read', options); },
    deleteFile: function(options) { return deleteGFile(options); }
  }

  function deleteGFile(options) {
    options = options || {};
    return new Promise((resolve, reject) => {
      try {
        if (!options.filename) throw new Error("options.filename is a required parameter.");
        const bucket = gcs.bucket(options.bucket || GOOGLE_DEFAULT_BUCKET);
        const file = bucket.file(options.filename);

        return file.delete((err, delResponse) => {
          if (err) return reject(err);
          return resolve(delResponse);
        });

      } catch(e) {
        return reject(e);
      }
    });
  }

  function signedUrl(action, options) {
    options = options || {};
    return new Promise((resolve, reject) => {
      try {
        if (!options.filename) throw new Error("options.filename is a required parameter.");

        const bucket = gcs.bucket(options.bucket || GOOGLE_DEFAULT_BUCKET);
        const file = bucket.file(options.filename);
        const expires = minutesFromNow(options.expiresInMinutes || 10);


        let urlOptions = {
          action: action,
          expires: '03-17-2025',
        };
        if (options.contentType) {
          urlOptions.contentType = options.contentType
        }
        if (action === 'read') {
          let saveAsFilename = options.filename.split('/');
          saveAsFilename = saveAsFilename[saveAsFilename.length -1];
          urlOptions.responseDisposition = `attachment; filename="${saveAsFilename}"`;
        }

        return file.getSignedUrl(urlOptions, (err, url) => {
          if (err) return reject(err);
          return resolve(url);
        });
      } catch(e) {
        reject(e);
      }
    })
  }
}
