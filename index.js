const crypto = require('crypto')
const fetch = require('node-fetch')

//Init parameters are required to generate signatures
exports.init = () => {
    return {
        _payUrl: 'https://pay.freekassa.ru', //Payment form base URL
        _apiUrl: 'https://api.freekassa.ru/v1', //API base URL
        _lang: 'ru', //Payment form language
        _currency: 'RUB', //Payment or withdrawal currency
        _key: null, //API key
        _secret1: null, //Secret word #1
        _secret2: null, //Secret word #2
        _shopId: null, //Shop (merchant) ID
        _paymentId: null, //Payment id on merchant side
        _orderId: null, //Order (payment) id on Freekassa side
        _orderStatus: null, //Order (payment) id on Freekassa side (statuses available: 0 - new, 1 - success, 8 - fail, 9 - cancel)
        _amount: null, //Payment amount
        _i: null, //Payment method id (payment systems available: https://docs.freekassa.ru/#section/1.-Vvedenie/1.7.-Spisok-dostupnyh-valyut)
        _tel: null, //Customer phone number
        _email: null, //Customer email
        _ip: null, //Customer IP
        _account: null, //Payment system wallet (for withdrawals request, for example)
        _dateFrom: null, //Data selection FROM date (for withdrawals or orders selection)
        _dateTo: null, //Data selection TO date (for withdrawals or orders selection)
        _page: null, //Data selection page number (for withdrawals or orders selection)
        _success_url: null, //Custom success url (this option must be enabled by Freekassa)
        _failure_url: null, //Custom failure uel (this option must be enabled by Freekassa)
        _notification_url: null, //Custom notification url (this option must be enabled by Freekassa)
        _signatureForm: null, //Signature for form generation
        //_signatureNotification: null, //Signature to confirm notifications from Freekassa


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
        set ip (newIp) {
            this._ip = newIp
        },
        set email (newEmail) {
            this._email = newEmail
        },
        set lang (newLang) {
            this._lang = newLang
        },
        set account (newAccount) {
            this._account = newAccount
        },
        set orderId (newOrderId) {
            this._orderId = newOrderId
        },
        set orderStatus (newOrderStatus) {
            this._orderStatus = newOrderStatus
        },
        set dateFrom (newDateFrom) {
            this._dateFrom = newDateFrom
        },
        set dateTo (newDateTo) {
            this._dateTo = newDateTo
        },
        set page (newPage) {
            this._page = newPage
        },
        set success_url (newSuccess_url) {
            this._success_url = newSuccess_url
        },
        set failure_url (newFailure_url) {
            this._failure_url = newFailure_url
        },
        set notification_url (newNotification_url) {
            this._notification_url = newNotification_url
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
        get ip () {
            return this._ip
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
        get account () {
            return this._account
        },
        get orderId () {
            return this._orderId
        },
        get orderStatus () {
            return this._orderStatus
        },
        get dateFrom () {
            return this._dateFrom
        },
        get dateTo () {
            return this._dateTo
        },
        get page () {
            return this._page
        },
        get success_url () {
            return this._success_url
        },
        get failure_url () {
            return this._failure_url
        },
        get notification_url () {
            return this._notification_url
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
            //this._signatureNotification = crypto.createHash('md5').update(`${this._shopId}:${this._amount}:${this._secret2}:${this._paymentId}`).digest('hex').toString()
        },

        //Create payment form link. Method generate url with accesible request parameters. Returns promise. Promise resolves to payment form URL or false if fail
        create () {
            return new Promise ((resolve, reject) => {
                try {
                    if (!this._amount || !this._currency || !this._paymentId || !this._signatureForm || !this._shopId) {
                        throw false
                    }
                    //Mandatory parameters
                    let requestBody = [
                        `m=${this._shopId}`,
                        `oa=${this._amount}`,
                        `currency=${this._currency}`,
                        `o=${this._paymentId}`,
                        `s=${this._signatureForm}`
                    ]
                    //Optional parameters
                    let num
                    if (this._i) {
                        num = requestBody.push(`i=${this._i}`)
                    }
                    if (this._tel) {
                        num = requestBody.push(`phone=${this._tel}`)
                    }
                    if (this._email) {
                        num = requestBody.push(`em=${this._email}`)
                    }
                    if (this._lang) {
                        num = requestBody.push(`lang=${this._lang}`)
                    }
                    resolve(`${this._payUrl}/?${requestBody.join('&')}`)

                } catch(e) {
                    reject(e)
                }
            })
            .catch(e => e)
        },

        //Orders list. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly
        orders () {
            return new Promise ((resolve, reject) => {
                try {
                    if (!this._key || !this._shopId) {
                        throw false
                    }
                    //Mandatory props
                    let requestBody = {
                        shopId: parseInt(this._shopId)
                    }
                    //Optional props
                    if (this._paymentId) {
                        requestBody.paymentId = this._paymentId.toString()
                    }
                    if (this._orderId) {
                        requestBody.orderId = parseInt(this._orderId)
                    }
                    if (this._orderStatus) {
                        requestBody.orderStatus = parseInt(this._orderStatus)
                    }
                    if (this._dateFrom) {
                        requestBody.dateFrom = this._dateFrom.toString()
                    }
                    if (this._dateTo) {
                        requestBody.dateTo = this._dateTo.toString()
                    }
                    if (this._page) {
                        requestBody.page = parseInt(this._page)
                    }
                    this._request('POST', `${this._apiUrl}/orders`, requestBody)
                        .then(response => resolve(response))

                } catch(e) {
                    reject(e)
                }
            })
            .catch(e => e)
        },

        //Create order. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly
        ordersCreate () {
            return new Promise ((resolve, reject) => {
                try {
                    if (!this._i || !this._email || !this._ip || !this._amount || !this._currency || !this._key || !this._shopId) {
                        throw false
                    }
                    //Mandatory props
                    let requestBody = {
                        shopId: parseInt(this._shopId),
                        i: parseInt(this._i),
                        email: this._email.toString(),
                        ip: this._ip.toString(),
                        amount: Number(this._amount),
                        currency: this._currency.toString()
                    }
                    //Optional props
                    if (this._paymentId) {
                        requestBody.paymentId = this._paymentId.toString()
                    }
                    if (this._tel) {
                        requestBody.tel = this._tel.toString()
                    }
                    if (this._success_url) {
                        requestBody['success_url'] = this._success_url.toString()
                    }
                    if (this._failure_url) {
                        requestBody['failure_url'] = this._failure_url.toString()
                    }
                    if (this._notification_url) {
                        requestBody['notification_url'] = this._notification_url.toString()
                    }
                    this._request('POST', `${this._apiUrl}/orders/create`, requestBody)
                        .then(response => resolve(response))

                } catch(e) {
                    reject(e)
                }
            })
            .catch(e => e)
        },

        //Withdravals list. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly
        withdrawals () {
            return new Promise ((resolve, reject) => {
                try {
                    if (!this._key || !this._shopId) {
                        throw false
                    }
                    //Mandatory props
                    let requestBody = {
                        shopId: parseInt(this._shopId)
                    }
                    //Optional props
                    if (this._orderId) {
                        requestBody.orderId = parseInt(this._orderId)
                    }
                    if (this._paymentId) {
                        requestBody.paymentId = this._paymentId.toString()
                    }
                    if (this._orderStatus) {
                        requestBody.orderStatus = parseInt(this._orderStatus)
                    }
                    if (this._dateFrom) {
                        requestBody.dateFrom = this._dateFrom.toString()
                    }
                    if (this._dateTo) {
                        requestBody.dateTo = this._dateTo.toString()
                    }
                    if (this._page) {
                        requestBody.page = parseInt(this._page)
                    }
                    this._request('POST', `${this._apiUrl}/withdrawals`, requestBody)
                        .then(response => resolve(response))

                } catch(e) {
                    reject(e)
                }
            })
            .catch(e => e)
        },

        //Create withdrawal. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly
        withdrawalsCreate () {
            return new Promise ((resolve, reject) => {
                try {
                    if (!this._i || !this._account || !this._amount || !this._currency || !this._key || !this._shopId) {
                        throw false
                    }
                    //Mandatory props
                    let requestBody = {
                        shopId: parseInt(this._shopId),
                        i: parseInt(this._i),
                        account: this._account.toString(),
                        amount: Number(this._amount),
                        currency: this._currency.toString()
                    }
                    //Optional props
                    if (this._paymentId) {
                        requestBody.paymentId = this._paymentId.toString()
                    }
                    this._request('POST', `${this._apiUrl}/withdrawals/create`, requestBody)
                        .then(response => resolve(response))

                } catch(e) {
                    reject(e)
                }
            })
            .catch(e => e)
        },

        //Shop balance. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly
        balance () {
            return new Promise((resolve, reject) => {
                try {
                    //Mandatory props
                    if(!this._key || !this._shopId) {
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

        //Available payment systems to purchase from your shop. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly
        currencies () {
            return new Promise((resolve, reject) => {
                try {
                    //Mandatory props
                    if(!this._key || !this._shopId) {
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

        //Status of payment system by it's id (available or not for your shop). Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly
        currenciesStatus () {
            return new Promise((resolve, reject) => {
                try {
                    //Mandatory props
                    if(!this._key || !this._shopId || !this._i) {
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

        //Available payment systems for withdrawal. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly
        withdrawalsCurrencies () {
            return new Promise((resolve, reject) => {
                try {
                    //Mandatory props
                    if(!this._key || !this._shopId) {
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

        //Get list of shops. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly
        shops () {
            return new Promise((resolve, reject) => {
                try {
                    //Mandatory props
                    if(!this._key || !this._shopId) {
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