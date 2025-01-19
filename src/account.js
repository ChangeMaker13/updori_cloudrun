 /* eslint-disable */
let ak = '5IdM8vNIxIJOfrPMfBKHKFgzxxNL93Gnef75YORT'
let sk = 'dKNnXjYDm1rhvsRTZ39SUIYv1XXSaEIb8Drw0QPW'

let server_url = 'https://api.upbit.com'

import request from 'request';
import { v4 as uuidv4 } from 'uuid';
import pkg from 'jsonwebtoken';
const { sign } = pkg;

const payload = {
    access_key: ak,
    nonce: uuidv4(),
}

const token = sign(payload, sk)

const options = {
    method: "GET", 
    url: server_url + "/v1/accounts",
    headers: {Authorization: `Bearer ${token}`},
}

request(options, (error, response, body) => {
    if (error) {
        console.log("here")
        throw new Error(error)
    }
    if(response.statusCode === 200) {
        console.log(body)
    }
    else {
        console.log("failed to verify token")
    }
})
