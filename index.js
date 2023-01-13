const crypto = require('crypto')
const fetch = require('node-fetch')

//Init parameters are required to generate signatures
exports.init = () => {
    return {
        //MANDATORY
        _payUrl: 'https://pay.freekassa.ru',
        _apiUrl: 'https://api.freekassa.ru/v1',
        _lang: 'ru',
        _currency: 'RUB',
        _key: null,
        _secret1: null,
        _secret2: null,
        _shopId: null,
        _paymentId: null,
        _amount: null,
        _i: null,
        _tel: null,
        _email: null,
        _ip: null,
        _signatureForm: null,
        _signatureNotification: null,


        //SETTERS
        set key (newKey) {
            this._key = newKey
        },
        set secret1 (newSecret1) {
            this._secret1 = newSecret1
        },
        set secret2 (newSecret2) {
            this._secret2 = newSecret2
        },
        set shopId (newShopId) {
            this._shopId = newShopId
        },
        set amount (newAmount) {
            this._amount = newAmount
        },
        set currency (newCurrency) {
            this._currency = newCurrency
        },
        set paymentId (newPaymentId) {
            this._paymentId = newPaymentId
        },
        set i (newI) {
            this._i = newI
        },
        set tel (newTel) {
            this._tel = newTel
        },
        set email (newEmail) {
            this._email = newEmail
        },
        set lang (newLang) {
            this._lang = newLang
        },

        //GETTERS
        get key () {
            return this._key
        },
        get secret1 () {
            return this._secret1
        },
        get secret2 () {
            return this._secret2
        },
        get shopId () {
            return this._shopId
        },
        get amount () {
            return this._amount
        },
        get currency () {
            return this._currency
        },
        get paymentId () {
            return this._paymentId
        },
        get signatureForm () {
            return this._signatureForm
        },
        get signatureNotification () {
            return this._signatureNotification
        },
        get i () {
            return this._i
        },
        get tel () {
            return this._tel
        },
        get email () {
            return this._email
        },
        get lang () {
            return this._lang
        },

        //PRIVATE METHODS
        //Calculate signature for API request
        _signature (data) {
            let output = Object.keys(data).sort().map(key => data[key]).join('|')
            let hmac = crypto.createHmac('sha256', this._key)
            return hmac.update(output).digest('hex').toString()
        },

        //Send API request. requestBody contain everything except nonce and signature, it should be calculated basing in other request props
        _request (requestMethod, requestEndPoint, requestBody) {
            return new Promise (async (resolve, reject) => {
                try {
                    requestBody.nonce = new Date().getTime().toString()
                    requestBody.signature = this._signature(requestBody)
                    const response = await fetch(requestEndPoint, {
                        method: requestMethod,
                        body: JSON.stringify(requestBody)
                    })
                    const data = await response.json()
                    resolve(data)
                } catch (e) {
                    reject(e)
                }
            })
        },


        //PUBLIC METHODS
        //Generate new signatures
        sign () {
            this._signatureForm = crypto.createHash('md5').update(`${this._shopId}:${this._amount}:${this._secret1}:${this._currency}:${this._paymentId}`).digest('hex').toString()
            this._signatureNotification = crypto.createHash('md5').update(`${this._shopId}:${this._amount}:${this._secret2}:${this._paymentId}`).digest('hex').toString()
        },

        //Create payment form link. Method generate url with accesible request parameters. Returns payment form URL or false is fail
        create () {
            //Mandatory parameters
            if (this._shopId && this._amount && this._currency && this._paymentId && this._signatureForm) {
                //Check optional parameters and add if any
                let params = [
                    `m=${this._shopId}`,
                    `oa=${this._amount}`,
                    `currency=${this._currency}`,
                    `o=${this._paymentId}`,
                    `s=${this._signatureForm}`
                ]
                let num
                if (this._paymentOption) {
                    num = params.push(`i=${this._paymentOption}`)
                }
                if (this._tel) {
                    num = params.push(`phone=${this._tel}`)
                }
                if (this._email) {
                    num = params.push(`em=${this._email}`)
                }
                if (this._lang) {
                    num = params.push(`lang=${this._lang}`)
                }
                return `${this._payUrl}/?${params.join('&')}`
            } else {
                return false
            }
        },

        //Create order. MANDATORY parameters: i - payment system id, email - customer email, ip - customer IP, amount - order amount, currency - currency. OPTIONAL parameter: paymentId - stands for your service internal order id, tel - customer phone number, success_url - custom success url (using this must be allowed by staff), failure_url - custom fail url (using this must be allowed by staff), notification_url - custom notification url (using this must be allowed by staff). Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly
        ordersCreate (i, email, ip, amount, currency, paymentId, tel, success_url, failure_url, notification_url) {
            return new Promise ((resolve, reject) => {
                try {
                    if (!i || !email || !ip || !amount || !currency || !this._shopId) {
                        throw false
                    }
                    //Mandatory props
                    let requestBody = {
                        shopId: parseInt(this._shopId),
                        i: parseInt(i),
                        email: email.toString(),
                        ip: ip.toString(),
                        amount: Number(amount),
                        currency: currency.toString()
                    }
                    //Optional props
                    if (paymentId) {
                        requestBody.paymentId = paymentId.toString()
                    }
                    if (tel) {
                        requestBody.tel = tel.toString()
                    }
                    if (success_url) {
                        requestBody['success_url'] = success_url.toString()
                    }
                    if (failure_url) {
                        requestBody['failure_url'] = failure_url.toString()
                    }
                    if (notification_url) {
                        requestBody['notification_url'] = notification_url.toString()
                    }
                    this._request('POST', `${this._apiUrl}/orders/create`, requestBody)
                        .then(response => resolve(response))

                } catch(e) {
                    reject(e)
                }
            })
            .catch(e => e)
        },

        //Withdravals list. OPTIONAL: orderId - withdrawal id (Freekassa), paymentId - withdrawal id (yours), orderStatus - withdrawal status, dateFrom - withdrawal date from, dateTo - withdrawal date to, page - output page
        withdrawals (orderId, paymentId, orderStatus, dateFrom, dateTo, page) {
            //Mandatory props
            let requestBody = {
                shopId: parseInt(this._shopId)
            }
            //Optional props
            if (orderId) {
                requestBody.orderId = parseInt(orderId)
            }
            if (orderId) {
                requestBody.paymentId = paymentId.toString()
            }
            if (orderStatus) {
                requestBody.orderStatus = parseInt(orderStatus)
            }
            if (dateFrom) {
                requestBody.dateFrom = dateFrom.toString()
            }
            if (dateTo) {
                requestBody.dateTo = dateTo.toString()
            }
            if (page) {
                requestBody.page = parseInt(page)
            }
            return this._request('POST', `${this._apiUrl}/withdrawals`, requestBody)
        },

        //Create withdrawal. MANDATORY parameters: i - payment system id, account - your payment system wallet, amount - withdrawal amount, currency - currency. OPTIONAL parameter: paymentId - stands for your service internal withdrawal id. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly
        withdrawalsCreate (i, account, amount, currency, paymentId) {
            return new Promise ((resolve, reject) => {
                try {
                    if (!i || !account || !amount || !currency || this._shopId) {
                        throw false
                    }
                    //Mandatory props
                    let requestBody = {
                        shopId: parseInt(this._shopId),
                        i: parseInt(i),
                        account: account.toString(),
                        amount: Number(amount),
                        currency: currency.toString()
                    }
                    //Optional props
                    if (paymentId) {
                        requestBody.paymentId = paymentId.toString()
                    }
                    this._request('POST', `${this._apiUrl}/withdrawals/create`, requestBody)
                        .then(response => resolve(response))

                } catch(e) {
                    reject(e)
                }
            })
            .catch(e => e)
        },

        //Shop balance. Returns promise
        balance () {
            return new Promise((resolve, reject) => {
                try {
                    //Mandatory props
                    if(!this._shopId) {
                        throw false
                    }
                    let requestBody = {
                        shopId: parseInt(this._shopId)
                    }
                    this._request('POST', `${this._apiUrl}/balance`, requestBody)
                        .then(response => resolve(response))

                } catch(e) {
                    reject(e)
                }
            })
            .catch(e => e)
        },

        //Available payment systems to purchase from your shop. Returns promise
        currencies () {
            return new Promise((resolve, reject) => {
                try {
                    //Mandatory props
                    if(!this._shopId) {
                        throw false
                    }
                    let requestBody = {
                        shopId: parseInt(this._shopId)
                    }
                    this._request('POST', `${this._apiUrl}/currencies`, requestBody)
                        .then(response => resolve(response))

                } catch(e) {
                    reject(e)
                }
            })
            .catch(e => e)
        },

        //Status of payment system by it's id (available or not for your shop). Returns promise
        currenciesStatus () {
            return new Promise((resolve, reject) => {
                try {
                    //Mandatory props
                    if(!this._shopId || !this._i) {
                        throw false
                    }
                    let requestBody = {
                        shopId: parseInt(this._shopId)
                    }
                    this._request('POST', `${this._apiUrl}/currencies/${this._i}/status`, requestBody)
                        .then(response => resolve(response))

                } catch(e) {
                    reject(e)
                }
            })
            .catch(e => e)
        },

        //Available payment systems for withdrawal. Returns promise
        withdrawalsCurrencies () {
            return new Promise((resolve, reject) => {
                try {
                    //Mandatory props
                    if(!this._shopId) {
                        throw false
                    }
                    let requestBody = {
                        shopId: parseInt(this._shopId)
                    }
                    this._request('POST', `${this._apiUrl}/withdrawals/currencies`, requestBody)
                        .then(response => resolve(response))

                } catch(e) {
                    reject(e)
                }
            })
            .catch(e => e)
        },

        //Get list of shops. Returns promise
        shops () {
            return new Promise((resolve, reject) => {
                try {
                    //Mandatory props
                    if(!this._shopId) {
                        throw false
                    }
                    let requestBody = {
                        shopId: parseInt(this._shopId)
                    }
                    this._request('POST', `${this._apiUrl}/shops`, requestBody)
                        .then(response => resolve(response))

                } catch(e) {
                    reject(e)
                }
            })
            .catch(e => e)
        }
    }
}