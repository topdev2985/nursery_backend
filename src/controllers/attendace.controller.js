const Attendance = require('../models/attendance');
const Service = require('../models/servies');
const Children=require('../models/children');
const dayjs = require('dayjs');


const insertNewAttendance = async (req, res) => {
    const selChildren = req.body.selChildren;
    const values = req.body.values;
    delete req.body.values._id;
    const services = await Service.find();
    
    const { endTime, entryTime } = req.body.values;

    const time_tolerance = 1000 * 60 * 29; // 29 mins
    const min_tolerance = 1000 * 60 * 10; // 10mins
    const timeRange = dayjs(endTime).toDate() - dayjs(entryTime).toDate();

    const _startHour = dayjs(entryTime).format('HH:mm:ss');
    const _endHour = dayjs(endTime).format('HH:mm:ss');
  
    for (ser of services) {
        const _startDate = dayjs(dayjs(ser.startTime).format('YYYY-MM-DD') + 'T' + _startHour).toDate();
        const _endDate = dayjs(dayjs(ser.endTime).format('YYYY-MM-DD') + 'T' + _endHour).toDate();
        const limit = dayjs(dayjs(ser.endTime).format('YYYY-MM-DD') + 'T' + '18:00:00').toDate();
   
        const serviceRange = ser.endTime - ser.startTime;
     
        if (
            Math.abs(serviceRange - timeRange) <= time_tolerance &&
            ser.type === 'Time period rate' &&
            Math.abs(dayjs(ser.startTime).toDate() - _startDate) <= min_tolerance &&
            Math.abs(dayjs(ser.endTime).toDate() - _endDate) <= min_tolerance
        ) {
            values.serviceType = ser.type;
            values.serviceName = ser.serviceName;
            values.servicePrice = ser.price;
            values.serviceAmount = 1;
            break;
        }
        else if (ser.type === 'Hourly' && _startDate < limit) {
            values.serviceType = ser.type;
            values.serviceName = ser.serviceName;
            values.servicePrice = ser.price;
            if (_endDate > limit) {
                values.serviceAmount = Math.ceil((limit - _startDate) / (1000 * 60 * 60));
            }
            else {
                values.serviceAmount = Math.ceil((_endDate - _startDate) / (1000 * 60 * 60))
            }
            break;
        }


    }
    // console.log(values);

    for (id in selChildren) {
        const childId = selChildren[id];
        const child=await Children.findOne({_id:childId});

        const atte = new Attendance({ ...values, childId: childId, parentName:child.parentName, discount:child.discount, childName:child.firstName, funded:child.funded });
        await atte.save();
    }
    res.status(200).send('attendance register success');
}

const fetchAttendantChildrenToday = (req, res) => {
    const today = dayjs(req.query.today).toDate();
    const tomorrow = dayjs(today).add(1, 'day').toDate();
    Attendance.aggregate([
        {
            $match: {
                entryTime: {
                    $gte: today,
                    $lt: tomorrow
                },
                deleted: false
            }
        },
        {
            $group: {
                _id: "$childId",
            }
        },
        {
            $lookup: {
                from: 'childrens',
                localField: '_id',
                foreignField: '_id',
                as: 'child'
            }

        }
    ]).exec((err, data) => {
        if (err) return res.status(500).send('err');
        return res.json(data);
    })
}

const fetchAttendantChildActivity = (req, res) => {
    const childId = req.query.childId;
    const today = dayjs(req.query.today).toDate();
    const tomorrow = dayjs(today).add(1, 'day').toDate();
    Attendance.find({
        childId: childId,

        entryTime: {
            $gte: today,
            $lt: tomorrow
        }


    }).sort('entryTime').exec((err, data) => {
        if (err) return res.status(500).send('fetch activity error');
        return res.json(data);
    })
}

const updateChildActivityTime = async (req, res) => {
    const { childId, activityId, type, time } = req.body;
    // const query = type === 'entryTime' ? { entryTime: time } : { endTime: time };
    // console.log(query);
    const services = await Service.find();
    const activity = await Attendance.findOne({_id: activityId});
    if(type==='entryTime'){
        activity.entryTime=time;
    }
    else{
        activity.endTime=time;
    }
    let { endTime, entryTime } = activity;
    
    const time_tolerance = 1000 * 60 * 29; // 29 mins
    const min_tolerance = 1000 * 60 * 10; // 10mins
    const timeRange = dayjs(endTime).toDate() - dayjs(entryTime).toDate();

    const _startHour = dayjs(entryTime).format('HH:mm:ss');
    const _endHour = dayjs(endTime).format('HH:mm:ss');
   
    for (ser of services) {
        const _startDate = dayjs(dayjs(ser.startTime).format('YYYY-MM-DD') + 'T' + _startHour).toDate();
        const _endDate = dayjs(dayjs(ser.endTime).format('YYYY-MM-DD') + 'T' + _endHour).toDate();
        const limit = dayjs(dayjs(ser.endTime).format('YYYY-MM-DD') + 'T' + '18:00:00').toDate();
       
        const serviceRange = ser.endTime - ser.startTime;
        
        if (
            Math.abs(serviceRange - timeRange) <= time_tolerance &&
            ser.type === 'Time period rate' &&
            Math.abs(dayjs(ser.startTime).toDate() - _startDate) <= min_tolerance &&
            Math.abs(dayjs(ser.endTime).toDate() - _endDate) <= min_tolerance
        ) {
            activity.serviceType = ser.type;
            activity.serviceName = ser.serviceName;
            activity.servicePrice = ser.price;
            activity.serviceAmount = 1;
            break;
        }
        else if (ser.type === 'Hourly' && _startDate < limit) {
            activity.serviceType = ser.type;
            activity.serviceName = ser.serviceName;
            activity.servicePrice = ser.price;
            if (_endDate > limit) {
                activity.serviceAmount = Math.ceil((limit - _startDate) / (1000 * 60 * 60));
            }
            else {
                activity.serviceAmount = Math.ceil((_endDate - _startDate) / (1000 * 60 * 60))
            }
            break;
        }


    }
    // console.log(registerValues);
    Attendance.updateOne({ _id: activityId }, { $set: activity }, (err, data) => {
        if (err) return res.status(500).send('activity time update error');
        return res.send(data);
    })
}

const updateChildActivity = async (req, res) => {
    const { attId, registerValues } = req.body;
    const services = await Service.find();
    const { endTime, entryTime } = req.body.registerValues;

    const time_tolerance = 1000 * 60 * 29; // 29 mins
    const min_tolerance = 1000 * 60 * 10; // 10mins
    const timeRange = dayjs(endTime).toDate() - dayjs(entryTime).toDate();

    const _startHour = dayjs(entryTime).format('HH:mm:ss');
    const _endHour = dayjs(endTime).format('HH:mm:ss');
   
    for (ser of services) {
        const _startDate = dayjs(dayjs(ser.startTime).format('YYYY-MM-DD') + 'T' + _startHour).toDate();
        const _endDate = dayjs(dayjs(ser.endTime).format('YYYY-MM-DD') + 'T' + _endHour).toDate();
        const limit = dayjs(dayjs(ser.endTime).format('YYYY-MM-DD') + 'T' + '18:00:00').toDate();
       
        const serviceRange = ser.endTime - ser.startTime;
        
        if (
            Math.abs(serviceRange - timeRange) <= time_tolerance &&
            ser.type === 'Time period rate' &&
            Math.abs(dayjs(ser.startTime).toDate() - _startDate) <= min_tolerance &&
            Math.abs(dayjs(ser.endTime).toDate() - _endDate) <= min_tolerance
        ) {
            registerValues.serviceType = ser.type;
            registerValues.serviceName = ser.serviceName;
            registerValues.servicePrice = ser.price;
            registerValues.serviceAmount = 1;
            break;
        }
        else if (ser.type === 'Hourly' && _startDate < limit) {
            registerValues.serviceType = ser.type;
            registerValues.serviceName = ser.serviceName;
            registerValues.servicePrice = ser.price;
            if (_endDate > limit) {
                registerValues.serviceAmount = Math.ceil((limit - _startDate) / (1000 * 60 * 60));
            }
            else {
                registerValues.serviceAmount = Math.ceil((_endDate - _startDate) / (1000 * 60 * 60))
            }
            break;
        }


    }
    // console.log(registerValues);
    // console.log(req.body);
    Attendance.updateOne({ _id: attId }, { $set: registerValues }, (err, data) => {
        if (err) return res.status(500).send('activity update error');
        // console.log(data);
        return res.send(data);
    })

}

module.exports = {
    insertNewAttendance,
    fetchAttendantChildrenToday,
    fetchAttendantChildActivity,
    updateChildActivityTime,
    updateChildActivity
}