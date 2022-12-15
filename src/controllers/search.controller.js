var Attendance = require('../models/attendance');
var dayjs=require('dayjs');
const fetchSearch=(req,res)=>{
    const datestr=req.query.date;
    const childId=req.query.childId;
    const startTime=dayjs(datestr).toDate();
    const endTime=dayjs(datestr).add(1,'day').toDate();

    Attendance.find({childId:childId, entryTime:{$gte:startTime, $lt:endTime}}).sort('entryTime').exec((err, data)=>{
        if(err)return res.status(500).send('fetch search error');
        return res.json(data);
    })
}

module.exports={
    fetchSearch
}