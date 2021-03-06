const models = require("../../database/models");
const router = require("express").Router();
const { format } = require("util");
const Multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const { submitIdentification } = require("../controllers");

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

const storage = new Storage({
  keyFilename: "valiant-striker-285415-7e57950aab12.json",
});
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

router.post("/file-upload", multer.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      res.status(500).send({ message: err.message });
    });

    blobStream.on("finish", async (data) => {
      // create a url to access file
      const publicURL = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );

      try {
        await bucket.file(req.file.originalname).makePublic();
      } catch {
        return res.status(500).send({
          message: `Uploaded the file successfully: ${req.file.originalname}, but public access is denied!`,
          url: publicURL,
        });
      }

      res.status(200).send({
        message: "Uploaded the file successfully: " + req.file.originalname,
        url: publicURL,
      });
    });
    blobStream.end(req.file.buffer);
  } catch (err) {
    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 25MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
});

router.post("/identification", submitIdentification);

module.exports = router;
