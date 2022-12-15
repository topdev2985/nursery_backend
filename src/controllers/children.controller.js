const Children = require('../models/children');

const profileUpload = (req, res) => {
    if (req.files && Object.keys(req.files).length !== 0) {
        const uploadedFile = req.files.profile;
        var fileName = new Date().getTime() + '_' + uploadedFile.name;
        const uploadPath = './public/images/' + fileName;
        const resPath='/images/'+fileName;

        uploadedFile.mv(uploadPath, (err) => {
            if (err) {
                console.log(err);
                res.status(500).send('Failed!');
            }
            else {
                res.send({ filepath: resPath });
            }
        })
    }
    else {
        res.status(500).send('No file uploaded!')
    }
}

const insertNewChild = (req, res) => {
    const child = new Children(req.body);
    child.save((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        return res.send('success');
    })
}

const listChildren = (req, res) => {
    Children.find({ deleted: false }, (err, data) => {
        if (err) {
            return res.status(500).send("child fetch error");
        }
        return res.send(data);
    })
}

const deleteChild = (req, res) => {
    Children.updateOne({ _id: req.query.childId }, { $set: { deleted: true } }, (err) => {
        if (err) return res.status(500).send("child delete error");
        return res.send('child delete success');
    })
}

const editChild = (req, res) => {
    Children.updateOne({ _id: req.body.id }, { $set: req.body.data }, (err) => {
        if (err) return res.status(500).end("child update error");
        res.send('success');
    })

}

module.exports = {
    profileUpload,
    insertNewChild,
    listChildren,
    deleteChild,
    editChild
}