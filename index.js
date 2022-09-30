const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
var authToken = "Bearer 2140023|cYqPsHZB9AC5ZCDO7cQ364N45HerYOp9IcV4wGuv";
var started = false;
var counter=0;
let rewardsDataContainer={
    '5':{
        'reward_logs':{}
    },
    '11':{
        'reward_logs':{}
    },
    '12':{
        'reward_logs':{}
    },
    '1':{
        'reward_logs':{}
    },
    '4':{
        'reward_logs':{}
    },
    '6':{
        'reward_logs':{}
    },
    '9':{
        'reward_logs':{}
    },
    '10':{
        'reward_logs':{}
    },
    '14':{
        'reward_logs':{}
    },
    '8':{
        'reward_logs':{}
    },
    '7':{
        'reward_logs':{}
    },
    '13':{
        'reward_logs':{}
    },
    '15':{
        'reward_logs':{}
    }
}

app.use((req,res,next)=>{
    

    // Pass to next layer of middleware
    next();
    
});
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});


app.use('/file_read', (req, res) => {
    const fs = require('fs')
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5555');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    fs.readFile('promo_single.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        res.send(data)
    });
});


test();
async function test(){
    for(;;){
      await main();
    }
}


async function main(){
    let rewardsData = await getRewards();
    console.clear();
    if(rewardsData?.code==200 && rewardsData?.data.length>0){
        console.log("STARTED ["+counter+"]")
        rewardsData?.data.forEach((reward)=>{
            let importantDatas = {
                "id":reward?.id,
                "name":reward?.name,
                /*"desc":reward?.description,*/
                "image":reward?.prize?.image,
                "quantity":reward?.quantity
            }
            var execTime = currentDateTime();
            //check to start
            if(!started){
                importantDatas['time_started'] = execTime
                rewardsDataContainer[importantDatas?.id].reward_logs=importantDatas
                saveDatas(JSON.stringify(rewardsDataContainer,null, '\t'));
            }else{
                //check for quantity changes
                console.log("CHECKING QUANTITY CHANGES!")
                var logs = rewardsDataContainer[importantDatas?.id].reward_logs
                //quantity changes detected
                if(logs.hasOwnProperty('changes_logs')){
                    var lastLog = logs.changes_logs[logs.changes_logs.length-1];
                    if(lastLog.quantity != importantDatas?.quantity){
                        console.log("["+lastLog+'=>'+importantDatas?.quantity+"] "+importantDatas.name + " Changes detected!");
                        rewardsDataContainer[importantDatas?.id].reward_logs.changes_logs.push({
                            "quantity":importantDatas?.quantity,
                            "time_checked":execTime
                        })
                        saveDatas(JSON.stringify(rewardsDataContainer,null, '\t'));
                    }
                }else{
                    if(logs?.quantity != importantDatas?.quantity){
                        console.log("["+logs?.quantity+'=>'+importantDatas?.quantity+"] "+importantDatas.name + " Changes detected!");
                        rewardsDataContainer[importantDatas?.id].reward_logs.changes_logs = [ {
                            "quantity":importantDatas?.quantity,
                            "time_checked":execTime
                        }]
                        saveDatas(JSON.stringify(rewardsDataContainer,null, '\t'));
                    }
                }
            }
            
        })
        started = true;
    }else{
        
        console.log(rewardsData?.status + " => " +rewardsData?.message)
    }
    counter++
}

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

function currentDateTime(){
    var d = new Date();
    var timezz = convertTZ(d, "Asia/Manila")
    return timezz.toLocaleString();
}


function saveDatas(content){
    fs.appendFile('promo_logs.txt', content+'\n', function (err) {
        if (err) throw err;
    });
    fs.writeFile('promo_single.txt', content+'\n', function (err) {
        if (err) throw err;
    });
}

async function getRewards(){
    var headers = {
        method : "GET",
        data: {
            "Host": "api.winston.ph",
            "Sec-Ch-Ua": "\"Chromium\";v=\"103\", \".Not/A)Brand\";v=\"99\"",
            "X-Header-Key": "63249c9e8a95cdcc450f61d7850483e7f86b2536",
            "Sec-Ch-Ua-Mobile": "?0",
            "Authorization": authToken,
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Safari/537.36",
            "Sec-Ch-Ua-Platform": "Windows",
            "X-Header-Client": "WINSTON",
            "Origin": "https://www.winston.ph",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://www.winston.ph/",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US,en;q=0.9"
        }
    }
    let checkRewards = await axiosReq('https://api.winston.ph/api/v1/raffles',headers,null);
    return checkRewards;
}

async function axiosReq(url,headers,data){
    try {
        var config = {
            method: headers.method,
            url: url,
            data,
            headers: headers.data
          };
          
          return await axios(config)
          .then(
            response => response.data
          )
          .catch(
            response => response
          );
    } catch (error) {
        console.error(error);
    }
}


app.listen(5555);