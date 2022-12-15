const Attendance = require('../models/attendance');
const Service = require('../models/servies');
const Children = require('../models/children');
const dayjs = require('dayjs');

// Convert date string to dd/mm/yyyy format
const buildDateString = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
}

// Increase date by x amount of days
const increaseDays = (date, amount) => new Date(date.setDate(date.getDate() + amount));

// Get all weeks in given period
const buildWeeks = (start, end) => {
    const weeks = [];
    let current = new Date(start);
    let startweek = new Date(start);
    let offset = startweek.getDate() - startweek.getDay();
    startweek = new Date(startweek.setDate(offset));
    while (startweek < end) {
        // Get start of the week
        let beginOfWeek = new Date(startweek);
        // Get end of the week
        let endOfWeek = increaseDays(startweek, 6);
        // If there are less then 7 days left before the end, use the end.
        endOfWeek = endOfWeek > end ? end : endOfWeek;
        // console.log(current)
        // Add week to our collection
        beginOfWeek = beginOfWeek < current ? current : beginOfWeek;
        weeks.push([buildDateString(beginOfWeek), buildDateString(endOfWeek)]);
        startweek = increaseDays(startweek, 1);
    }

    return weeks;
}

const fecthInvoice = async (req, res) => {
    const startTime = dayjs(req.query.startTime).toDate()
    const endTime = dayjs(req.query.endTime).add(1, 'day').toDate();
    const parentName = req.query.parentName;

    const services = await Service.findOne({type:'Meal'});
    const children = await Children.find();

    const weeks = buildWeeks(startTime, endTime);
    // if (services.length === 0 || children.length === 0) return res.send('no data');

    const time_tolerance = 1000 * 60 * 29; // 29 min

    let finalResults = [];
    let iterator = 0;

    /**
     * calculate memo and meal count
     */
    const su=await Attendance.find(
        {
            entryTime: {
                $gte: startTime,
                $lt: endTime
            },
            parentName: parentName
        }
    )
    let meal=0;
    let memoInfo=[];
    let discount=0;
    for (const s of su){
        discount=s.discount;
        if(s.meal)meal++;
        if(s.funded)memoInfo[0]='Government funding is applied to the invoice';
        if(s.holdingFee){
            switch(s.holdingFee_type){
                case 'Bank Holiday':{
                    memoInfo[1]='Holding fee applied for the bank holiday';
                    break;
                }
                case 'Half term':{
                    memoInfo[2]='Holding fee applied for the half term';
                    break;
                }
                case 'Summer Holiday':{
                    memoInfo[3]='Holding fee applied for the summer holiday';
                    break;
                }
                default:
                    break;
            }
        }
        if(s.discount!==0)memoInfo[4]='Friends and family discount appliedto the invoice';
    }
    const childnum=await Attendance.aggregate([
        {
            $match: {
                entryTime: {
                    $gte: startTime,
                    $lt: endTime
                },
                parentName: parentName
            },
            
        },
        {
            $group: {
                _id:'$childId',
               
            }
        }
        
    ]);
    // console.log(childnum);
    if(childnum.length>1 && discount===0){
        discount=10;
        memoInfo[5]='Sibling discount applied to the invoice';
    }

    for (const time of weeks) {
        finalResults[iterator]={weeks:{}, data:[]}
        finalResults[iterator].weeks={
            start:dayjs(time[0]).format('DD/MM/YYYY'),
            end:dayjs(time[1]).format('DD/MM/YYYY')
        }
        const start = dayjs(time[0]).toDate();
        const end = dayjs(time[1]).add(1, 'day').toDate();
        
        finalResults[iterator].data=await Attendance.aggregate([
            {
                $match: {
                    entryTime: {
                        $gte: start,
                        $lt: end
                    },
                    parentName: parentName
                },
                
            },
            {
                $group: {
                    _id: {
                        childId: '$childId',
                        serviceName: '$serviceName',

                    },
                    amount: {
                        $sum: '$serviceAmount'
                    },
                    extra:{
                        $push:{
                            servicePrice:'$servicePrice',
                            discount:'$discount',
                            childName:'$childName'
                        }
                    }
                    // meal:{
                    //     $count: '$meal'
                    // }

                }
            }
        ]);

        iterator++;

    }

    var resResult={
        meal:meal,
        mealPrice:services.price,
        memoInfo:memoInfo,
        service:finalResults,
        discount:discount,
        dateRange:{
            start:dayjs(req.query.startTime).format('DD/MM/YYYY'),
            end:dayjs(req.query.endtime).format('DD/MM/YYYY')
        },
        parentName:parentName
    }

    console.log('-----------');
    console.log(resResult);
    res.send(resResult);
}

module.exports = {
    fecthInvoice
}