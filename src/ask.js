 /* eslint-disable */
 let ak = '5IdM8vNIxIJOfrPMfBKHKFgzxxNL93Gnef75YORT'
 let sk = 'dKNnXjYDm1rhvsRTZ39SUIYv1XXSaEIb8Drw0QPW'
 
 let server_url = 'https://api.upbit.com'
 
 import request from 'request'
 import { v4 as uuidv4 } from 'uuid'
 import crypto from 'crypto'
 import pkg from 'jsonwebtoken';
 const { sign } = pkg;
 import { encode as queryEncode } from 'querystring'
 
 const body = {
    market: 'KRW-BTC',
    side: 'ask',
    volume: '0.01',
    price: '100',
    ord_type: 'limit',
}

const query = queryEncode(body)

const hash = crypto.createHash('sha512')
const queryHash = hash.update(query, 'utf-8').digest('hex')

const payload = {
    access_key: access_key,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: 'SHA512',
}

const token = sign(payload, secret_key)

const options = {
    method: "POST",
    url: server_url + "/v1/orders",
    headers: {Authorization: `Bearer ${token}`},
    json: body
}

request(options, (error, response, body) => {
    if (error) throw new Error(error)
    console.log(body)
})