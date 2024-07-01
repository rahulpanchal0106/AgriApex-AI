
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const API_KEY = process.env.API_KEY;

function getToken(errorCallback, loadCallback) {
    const req = new XMLHttpRequest();
    req.addEventListener("load", loadCallback);
    req.addEventListener("error", errorCallback);
    req.open("POST", "https://iam.cloud.ibm.com/identity/token");
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Accept", "application/json");
    req.send("grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=" + API_KEY);
}

function apiPost(scoring_url, token, payload, loadCallback, errorCallback){
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", loadCallback);
    oReq.addEventListener("error", errorCallback);
    oReq.open("POST", scoring_url);
    oReq.setRequestHeader("Accept", "application/json");
    oReq.setRequestHeader("Authorization", "Bearer " + token);
    oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    oReq.send(payload); // Send the payload directly as a JSON string
}


const dataPost = (req, res) => {
    console.log("post root");
    const data = req.body;
    console.log(data)
    const n= data.n ;
    const sec= data.sec ;
    const h= data.h ;
    const ph= data.ph ;
    const p= data.p ;
    const k= data.k ;
    const r= data.r ;
    const t= data.t ;
    
    getToken((err) => {
        console.log("Error while getting token: ", err);
        res.status(500).send("Error while getting token");
    }, function () {
        let tokenResponse;
        try {
            tokenResponse = JSON.parse(this.responseText);
        } catch(ex) {
            console.log("Error while parsing token response: ", ex);
            return res.status(500).send("Error while parsing token response");
        }

        	
        // Nitrogen(N)(Kg/ha)	"double"
        // Soil EC	"double"
        // humidity(%)	"double"
        // ph	"double"
        // phosphorus (P)(Kg/ha)	"double"
        // potassium (K)(Kg/ha)	"double"
        // rainfall( in mm)	"double"
        // temperature (C)
        
        const payload = {"input_data": [{"fields": ["Nitrogen(N)(Kg/ha)","Soil EC", "humidity(%)", "ph","phosphorus (P)(Kg/ha)","potassium (K)(Kg/ha)", "rainfall( in mm)", "temperature (C)"],"values": [[n,sec,h,ph,p,k,r,t]]}]};

        // const payloadString = JSON.stringify(payload); // Stringify the payload directly before sending
        const payloadString = JSON.stringify(payload); // Stringify the payload directly before sending

        const scoring_url = "https://us-south.ml.cloud.ibm.com/ml/v4/deployments/plant/predictions?version=2021-05-01";

        console.log("Sending scoring request to:", scoring_url);
        console.log("Payload:", payload);

        apiPost(scoring_url, tokenResponse.access_token, payloadString, function () {
            let parsedPostResponse;
            try {
                parsedPostResponse = JSON.parse(this.responseText);
            } catch (ex) {
                console.log("Error while parsing scoring response: ", ex);
                return res.status(500).send("Error while parsing scoring response");
            }

            console.log("Scoring response: ", parsedPostResponse);
            res.status(200).send(parsedPostResponse);
        }, function (error) {
            console.log("Error while scoring:");
            console.error(error);  // Log the entire error object
            if (error && error.currentTarget) {
                console.log("Response status: ", error.currentTarget.status);
                console.log("Response text: ", error.currentTarget.responseText);
            } else {
                console.log("No currentTarget available in error object.");
            }
            res.status(500).send("Error while scoring");
        });
    });
}

module.exports = dataPost