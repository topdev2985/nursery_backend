const Service = require('../models/servies');

const fetchService = (req, res) => {
    Service.find({ deleted: false }, (err, data) => {
        if (err) {
            return res.status(500).send('service fetch error');
        }
        return res.send(data);
    })
}

const insertService = (req, res) => {
    const service = new Service(req.body);
    service.save((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('service save error');
        }
        return res.send('service add success');
    })
}

const deleteService = (req, res) => {
    const id = req.query.serviceId;
    Service.updateOne({ _id: id }, { $set: { deleted: true } }, err => {
        if (err) return res.status(500).send('service delete error');
        return res.send('delete service success');
    })
}

module.exports = {
    fetchService,
    insertService,
    deleteService
}