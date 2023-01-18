# Freekassa.ru SDK

## Module install
```bash
# npm install freekassa --save
```

## Basic usage
### Payment form generation
```js
//Module initialization
const freekassa = require('freekassa').init()

//Set props
freekassa.key = 'API key'
freekassa.secret1 = 'Secret word #1'
freekassa.secret2 = 'Secret word #2'
freekassa.shopId = 12345
freekassa.paymentId = 1234567890
freekassa.amount = 1000
freekassa.currency = 'EUR'
freekassa.account = '1234123412341234'
freekassa.i = 6
freekassa.tel = '+79871653545'
freekassa.email = 'admin@gmail.com'
freekassa.ip = '192.168.0.1'

//Generate signatures
freekassa.sign();

//Make request
(async () => {
    await freekassa.orders()
        .then(response => console.log(response))
})()
```