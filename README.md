# Freekassa.ru SDK
[API REFERENCE](https://docs.freekassa.ru)

## Module install
```bash
# npm install freekassa --save
```

## Basic usage examples
### Payment form generation
```js
//Module initialization
const freekassa = require('freekassa').init()

//Set props
freekassa.secret1 = 'Secret word #1'
freekassa.secret2 = 'Secret word #2'
freekassa.shopId = 12345
freekassa.paymentId = 1234567890
freekassa.amount = 1000
freekassa.tel = '+79871653545'
freekassa.email = 'admin@gmail.com'

//Generate signatures
freekassa.sign();

//Make request
(async () => {
    await freekassa.orders()
        .then(response => console.log(response))
})()
```

### Balance check
```js
//Module initialization
const freekassa = require('freekassa').init()

//Set props
freekassa.key = 'API key'
freekassa.shopId = 21895

//Make request
(async () => {
    await freekassa.balance()
        .then(response => console.log(response))
})()
```

## Available methods
* **sign** - Generate new signatures.
* **create** - Create payment form link. Method generate url with accesible request parameters. Returns promise. Promise resolves to payment form URL or false if fail (mandatory props: *amount*, *currency*, *paymentId*, *signatureForm*, *shopId*).
* **orders** - Orders list. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly (mandatory props: *key*, *shopId*).
* **ordersCreate** - Create order. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly (mandatory props: *i*, *email*, *ip*, *amount*, *currency*, *key*, *shopId*).
* **withdrawals** - Withdravals list. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly (mandatory props: *key*, *shopId*).
* **withdrawalsCreate** - Create withdrawal. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly (mandatory props: *i*, *account*, *amount*, *currency*, *key*, *shopId*).
* **balance** - Shop balance. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly (mandatory props: *key*, *shopId*).
* **currencies** - Available payment systems to purchase from your shop. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly (mandatory props: *key*, *shopId*).
* **currenciesStatus** - Status of payment system by it's id (available or not for your shop). Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly (mandatory props: *i*, *key*, *shopId*).
* **withdrawalsCurrencies** - Available payment systems for withdrawal. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly (mandatory props: *key*, *shopId*).
* **shops** - Get list of shops. Returns promise. Promise resolves to false if MANDATORY parameters set incorrectly (mandatory props: *key*, *shopId*).

## Available props
* payUrl (default 'https://pay.freekassa.ru') - Payment form base URL
* apiUrl (default 'https://api.freekassa.ru/v1') - API base URL
* lang (default 'ru') - Payment form language
* currency (default 'RUB') - Payment or withdrawal currency
* key (default null) - API key
* secret1 (default null) - Secret word #1
* secret2 (default ull) - Secret word #2
* shopId (default null) - Shop (merchant) ID
* paymentId (default null) - Payment id on merchant side
* orderId (default null) - Order (payment) id on Freekassa side
* orderStatus (default null) - Order (payment) id on Freekassa side (statuses available: 0 - new, 1 - success, 8 - fail, 9 - cancel)
* amount (default null) - Payment amount
* i (default null) - Payment method id (payment systems available: https://docs.freekassa.ru/#section/1.-Vvedenie/1.7.-Spisok-dostupnyh-valyut)
* tel (default null) - Customer phone number
* email (default null) - Customer email
* ip (default null) - Customer IP
* account (default null) - Payment system wallet (for withdrawals request, for example)
* dateFrom (default null) - Data selection FROM date (for withdrawals or orders selection)
* dateTo (default null) - Data selection TO date (for withdrawals or orders selection)
* page (default null) - Data selection page number (for withdrawals or orders selection)
* success_url (default null) - Custom success url (this option must be enabled by Freekassa)
* failure_url (default null) - Custom failure uel (this option must be enabled by Freekassa)
* notification_url (default null) - Custom notification url (this option must be enabled by Freekassa)
* signatureForm (default null) - Signature for form generation
* signatureNotification (default null) - Signature to confirm notifications from Freekassa