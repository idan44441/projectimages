const _express = require('express');
const _multer = require('multer');
const _app = _express();
const _path = require('path');
const _destination = "assets";
const db = require("./config");





_app.use('/public', _express.static('public')); // Assuming 'styles.css' is in the 'public' directory
_app.use(_express.json());

const diskStorage = _multer.diskStorage({
    destination: _destination,
    filename:(req,file,cb)=>{
        return cb(null,`${file.filename}_${Date.now()}_${_path.extname(file.originalname)}`)
    }
})

const upload = _multer({
    storage:diskStorage,
    limits:{fileSize:2000000000}
})

_app.get("/check", (req, resp) => {
    db.query("SELECT * FROM user", (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            resp.status(500).send("Internal server error");
        } else {
            resp.send(result);
        }
    });
});


_app.get("/", (req, res) => {
    res.send('1');
});

const path = require('path');


_app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

_app.get("/manage.html", (req, res) => {
    res.sendFile(path.join(__dirname, 'manage.html'));
});



_app.get('/images', function(req, res) {
    const imgFolder = path.join(__dirname, '/assets/');
    const fs = require('fs');

    fs.readdir(imgFolder, function(err, files) {
        if (err) {
            return console.error(err);
        }

        const jpgFiles = files.filter(file => {
    const extension = path.extname(file).toLowerCase();
    return extension === '.jpg' || extension === '.JPG';
});


        const filesArr = jpgFiles.map(file => {
            const filePath = path.join(imgFolder, file); // Define filePath here
            const imageData = fs.readFileSync(filePath, { encoding: 'base64' });
            return { name: file /*, base64Data: imageData*/};
        });

        res.json(filesArr);
    });
});

_app.delete('/images', function(req, res) {
    const imgFolder = path.join(__dirname, '/assets/');
    const fs = require('fs');

    // Read all files in the folder
    fs.readdir(imgFolder, function(err, files) {
        if (err) {
            return res.status(500).json({ error: 'Failed to read images folder.' });
        }

        // Loop through each file
        files.forEach(function(file) {
            // Construct the file path of the image to be deleted
            const imagePath = path.join(imgFolder, file);
            
            // Attempt to delete the file
            fs.unlink(imagePath, function(err) {
                if (err) {
                    // Error while deleting file
                    console.error(`Failed to delete ${file}. Error: ${err}`);
                } else {
                    console.log(`${file} deleted successfully.`);
                }
            });
        });

        // All files deleted successfully
        res.json({ success: 'All images deleted successfully.' });
    });
});




_app.post("/upload", upload.single("user"), (req, res) => {
    // Check if the uploaded file has a valid extension
    if (req.file && (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/jpg'|| req.file.mimetype === 'image/JPG')) {
        res.json({
            success: "ok",
            file_url: `/public/images/${req.file.filename}`
        });
    } else {
        // If file extension is not allowed, respond with an error
        res.status(400).json({ error: "File format not supported. Please upload a JPG file." });
    }
});


_app.listen(3000,()=>{
    console.log("project is in run state")
})



function exceptionHandler(err,req,res,next){
    if (err instanceof _multer.MulterError){
        res.json({
          success: "not ok",
          message:err.message
        })
    }
}


_app.use(exceptionHandler);
