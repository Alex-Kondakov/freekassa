const crypto = require('crypto')
const fetch = require('node-fetch')

//Init parameters are required to generate signatures
exports.init = (key = null, secret1 = null, secret2 = null, merchantId = null, amount = null, currency = 'RUB', payment = null) => {
    return {
        //MANDATORY
        _payUrl: 'https://pay.freekassa.ru',
        _apiUrl: 'https://api.freekassa.ru/v1',
        _key: key,
        _secret1: secret1,
        _secret2: secret2,
        _merchantId: merchantId,
        _amount: amount,
        _currency: currency,
        _payment: payment,
        _signatureForm: crypto.createHash('md5').update(`${merchantId}:${amount}:${secret1}:${currency}:${payment}`).digest('hex').toString(),
        _signatureNotification: crypto.createHash('md5').update(`${merchantId}:${amount}:${secret2}:${payment}`).digest('hex').toString(),

        //OPTIONAL
        _paymentOption: null,
        _phone: null,
        _email: null,
        _lang: 'en',

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
        set merchantId (newMerchantId) {
            this._merchantId = newMerchantId
        },
        set amount (newAmount) {
            this._amount = newAmount
        },
        set currency (newCurrency) {
            this._currency = newCurrency
        },
        set payment (newPayment) {
            this._payment = newPayment
        },
        set paymentOption (newPaymentOption) {
            this._paymentOption = newPaymentOption
        },
        set phone (newPhone) {
            this._phone = newPhone
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
        get merchantId () {
            return this._merchantId
        },
        get amount () {
            return this._amount
        },
        get currency () {
            return this._currency
        },
        get payment () {
            return this._payment
        },
        get signatureForm () {
            return this._signatureForm
        },
        get signatureNotification () {
            return this._signatureNotification
        },
        get paymentOption () {
            return this._paymentOption
        },
        get phone () {
            return this._phone
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
            this._signatureForm = crypto.createHash('md5').update(`${this._merchantId}:${this._amount}:${this._secret1}:${this._currency}:${this._payment}`).digest('hex').toString()
            this._signatureNotification = crypto.createHash('md5').update(`${this._merchantId}:${this._amount}:${this._secret2}:${this._payment}`).digest('hex').toString()
        },

        //Create payment form link. Method generate url with accesible request parameters. Returns payment form URL or false is fail
        create () {
            //Mandatory parameters
            if (this._merchantId && this._amount && this._currency && this._payment && this._signatureForm) {
                //Check optional parameters and add if any
                let params = [
                    `m=${this._merchantId}`,
                    `oa=${this._amount}`,
                    `currency=${this._currency}`,
                    `o=${this._payment}`,
                    `s=${this._signatureForm}`
                ]
                let num
                if (this._paymentOption) {
                    num = params.push(`i=${this._paymentOption}`)
                }
                if (this._phone) {
                    num = params.push(`phone=${this._phone}`)
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

        //Get list of shops. Returns promise
        shops () {
            return this._request('POST', `${this._apiUrl}/shops`, {
                shopId: parseInt(this._merchantId)
            })
        },

        //Withdravals list. OPTIONAL: orderId - withdrawal id (Freekassa), paymentId - withdrawal id (yours), orderStatus - withdrawal status, dateFrom - withdrawal date from, dateTo - withdrawal date to, page - output page
        withdrawals (orderId, paymentId, orderStatus, dateFrom, dateTo, page) {
            //Mandatory props
            let requestBody = {
                shopId: parseInt(this._merchantId)
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
                    if (!i || !account || !amount || !currency) {
                        throw false
                    }
                    //Mandatory props
                    let requestBody = {
                        shopId: parseInt(this._merchantId),
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

        //Available payment systems for withdrawal. Returns promise
        withdrawalsCurrencies () {
            return this._request('POST', `${this._apiUrl}/withdrawals/currencies`, {
                shopId: parseInt(this._merchantId)
            })
        },

        //Available payment systems. Returns promise
        currencies () {
            return this._request('POST', `${this._apiUrl}/currencies`, {
                shopId: parseInt(this._merchantId)
            })
        },

        //Status of payment system by it's id (available or not for your shop). Returns promise
        currenciesStatus (id) {
            return this._request('POST', `${this._apiUrl}/currencies/${id}/status`, {
                shopId: parseInt(this._merchantId)
            })
        },

        //Shop balance. Returns promise
        balance () {
            return this._request('POST', `${this._apiUrl}/balance`, {
                shopId: parseInt(this._merchantId)
            })
        },
    }
}