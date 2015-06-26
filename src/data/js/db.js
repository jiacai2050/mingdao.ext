var Account = function(payee, bank, cardCode, id) {
    this.payee = payee;
    this.bank = bank;
    this.cardCode = cardCode;
    this.id = id || new Date().getTime(); //使用当前时间作为ID    
    this.toObject = function() {
        return {
            id: this.id,
            payee: this.payee,
            bank: this.bank,
            cardCode: this.cardCode
        };
    }
    this.toJson = function() {
        var json = {};
        json[this.id] = {
            payee: this.payee,
            bank: this.bank,
            cardCode: this.cardCode
        };
        return json;
    }
}

var accountsDB = new (function () {
    var NOOP = function() {};
    this.getAccounts = function(cb) {
        chrome.storage.sync.get(null, function(items) {
            var accArr = [];
            for(id in items) {
                accArr.push(new Account(items[id].payee, items[id].bank, items[id].cardCode, id));
            }
            cb(accArr);
        });
    }
    this.addAccount = function(account, cb) {
        chrome.storage.sync.set(account.toJson(), function() {
            cb = cb || NOOP;
            cb();
        });
    }
    this.deleteAccount = function(id, cb) {
        chrome.storage.sync.remove(id, function() {
            cb = cb || NOOP;
            cb();
        });
    }
    this.updateRule = function(account, cb) {
        chrome.storage.sync.set(account.toJson(), function() {
            cb = cb || NOOP;
            cb();
        });
    }
});
