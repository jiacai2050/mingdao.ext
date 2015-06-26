var fileUtil = new (function() {
    this.exportRules = function() {
        accountsDB.getAccounts(function(accounts) {
            var json = [];
            for (var i = accounts.length - 1; i >= 0; i--) {
                json.push(accounts[i].toObject());
            };
            var json = {
                createBy: "https://github.com/jiacai2050/mingdao.ext",
                createAt: new Date().toString(),
                accounts: json
            };
            var contentType = 'application/json';
            var content = new Blob([JSON.stringify(json, null, 4)], {type: contentType});

            var jsonExport = document.getElementById("jsonExport");
            jsonExport.href = window.URL.createObjectURL(content);
            jsonExport.click();    
        });
    };
    this.importRules = function() {
        var jsonChooser = document.getElementById("jsonChooser");
        jsonChooser.value = "";
        jsonChooser.onchange = function() {
            var files = this.files;
            var jsonFile = files[0];
            var reader = new FileReader();
            reader.onloadend = function(response) {
                var res = JSON.parse(response.target.result);
                res.accounts.forEach(function(account) {
                    account = new Account(account.payee, account.bank, account.cardCode, account.id);
                    accountsDB.addAccount(account, function() {
                        initAccounts();
                    });
                });
            };
            reader.readAsText(jsonFile);
        }
        jsonChooser.click();
    }
});

var accountDAO = new(function() {
    var dao = this;
    
    this["delete"] = function(e) {
        if (confirm("确定要删除该条目吗？")) {
            var par = $(e.target).parent().parent(); //tr
            var tdPayee = par.children("td:nth-child(1)");
            var id = tdPayee.children("input[type=hidden]").val();
            accountsDB.deleteAccount(id);
            par.remove();
        }
    };
    this.edit = function(e) {
        var td = $(e.target).parent(); //td
        var par = td.parent(); //tr
        var tdPayee    = par.children("td:nth-child(1)"),
            tdBank     = par.children("td:nth-child(2)"),
            tdCardCode = par.children("td:nth-child(3)"),
            tdButtons  = par.children("td:nth-child(4)");
        var tdPayeeOldHtml = tdPayee.html(),
            tdBankOldHtml   = tdBank.html(),
            tdCardCodeOldHtml = tdCardCode.html(),
            tdButtonsOldHtml= tdButtons.html();
        var payeeVal    = tdPayee.children("span").html(),
            id          = tdPayee.children("input[type=hidden]").val(),
            bankVal     = tdBankOldHtml,
            cardCodeVal = tdCardCodeOldHtml;

        tdPayee.html("<input type='text' size='" + payeeVal.length + "' value='" + payeeVal + "'/>");
        tdBank.html("<input type='text' size='" + bankVal.length + "' value='" + bankVal + "'/>");
        tdCardCode.html("<input type='text' size='" + tdCardCodeOldHtml.length + "' value='" + tdCardCodeOldHtml + "'/>");

        td.html(imageUtil.save + imageUtil.undo);
        imageUtil.bindClick("save", function(e) {
            accountsDB.deleteAccount(id, function() {
                e.accountID = id;
                accountDAO.save(e);    
            });
        });
        imageUtil.bindClick("undo", function() {
            tdPayee.html(tdPayeeOldHtml);
            tdBank.html(tdBankOldHtml);
            tdCardCode.html(tdCardCodeOldHtml);
            tdButtons.html(tdButtonsOldHtml);

            imageUtil.bindClick("edit");
            imageUtil.bindClick("delete");
        });
        addEnterListener();
    }
    this.save = function(e) {
        var par = $(e.target).parent().parent(); //tr
        var tdPayee    = par.children("td:nth-child(1)"),
            tdBank     = par.children("td:nth-child(2)"),
            tdCardCode = par.children("td:nth-child(3)"),
            tdButtons  = par.children("td:nth-child(4)");
        var payeeVal    = tdPayee.children("input").val(),
            bankVal     = tdBank.children("input").val(),
            cardCodeVal = tdCardCode.children("input").val();
        
        if (payeeVal.trim() === "") {
            alert("收款人不能为空！");
            tdPayee.children("input[type=text]").val("");
            return false;
        };
        if (bankVal.trim() === "") {
            alert("银行不能为空！");
            tdBank.children("input[type=text]").val("");
            return false;
        };
        if (cardCodeVal.trim() === "") {
            alert("卡号不能为空！");
            tdCardCode.children("input[type=text]").val("");
            return false;
        };

        var account = new Account(payeeVal, bankVal, cardCodeVal, e.accountID);
        accountsDB.addAccount(account);
        tdPayee.html("<span>" + account.payee + "</span><input type='hidden' value='" + account.id + "'/>");
        tdBank.html(account.bank);
        tdCardCode.html(account.cardCode);
        tdButtons.html(imageUtil.edit + imageUtil["delete"]);

        imageUtil.bindClick("edit");
        imageUtil.bindClick("delete");
    }
});

var imageUtil = new (function() {
    var assets = {
        edit: {
            src: "img/edit.png",
            title: "编辑",
            "class": "btnEdit",
            onclick: accountDAO.edit
        },
        save: {
            src: "img/save.png",
            title: "保存",    
            "class": "btnSave",
            onclick: accountDAO.save
        },
        undo: {
            src: "img/undo.png",
            title: "取消",
            "class": "btnUndo"
        },
        "delete": {
            src: "img/delete.png",
            title: "删除",
            "class": "btnDelete",
            onclick: accountDAO["delete"]
        }
    };
    var getImageElementByName = function(name) {
        var res = assets[name];
        return "<img class='" + res["class"] + "' src='" + res.src + "' title='" + res.title + "' style='cursor: pointer;'/>";   
    }
    this.edit = getImageElementByName("edit");
    this.save = getImageElementByName("save");
    this["delete"] = getImageElementByName("delete");
    this.undo = getImageElementByName("undo");
    this.bindClick = function(name, cb) {
        var cls = $("." + assets[name]["class"]);
        cb = cb || assets[name].onclick || function() {};
        // http://stackoverflow.com/questions/203198/event-binding-on-dynamically-created-elements
        cls.unbind("click");
        cls.bind("click", cb);
    }
});
var addEnterListener = function() {
    $("table.gridtable input[type=text]").keyup(function(e){
        if(e.keyCode == 13){  //Enter键
            var par = $(e.target).parent().parent(); //tr
            var tdButtons = par.children("td:nth-child(4)");
            tdButtons.children("img[class=btnSave]").click();
        }
    });
}
var addRow = function() {
    var rowHTML = ["<tr>",
        "<td><input type='text'/></td>",
        "<td><input type='text'/></td>",
        "<td><input type='text'/></td>",
        "<td>" + imageUtil.save + "</td>",
        "</tr>"].join("");
    $("#items tbody").append(rowHTML);
    imageUtil.bindClick("save");
    addEnterListener();
}

$(function() {
    $("#homepage").click(function() {
        window.open("https://github.com/jiacai2050/mingdao.ext");
    });
    $("#import").click(function() {
        fileUtil.importRules();
    });
    $("#export").click(function() {
        fileUtil.exportRules();
    });
    $("#add").click(addRow);
    initAccounts();
});
function initAccounts() {
    accountsDB.getAccounts(function(items) {
        $("#items tbody").html("");
        var html = [];
        items.forEach(function(account) {
            var payee    = account.payee,
                bank     = account.bank,
                cardCode = account.cardCode;
            var rowHTML = [];
            rowHTML.push(
                "<tr><td><span>" + payee + "</span><input type='hidden' value='" + account.id + "'/></td>",
                "<td>" + bank + "</td>",
                "<td>" + cardCode + "</td>",
                "<td>" + imageUtil.edit + imageUtil["delete"] + "</td>",
                "</tr>");
            $("#items tbody").append(rowHTML.join(""));
            
            imageUtil.bindClick("edit");
            imageUtil.bindClick("delete");
        });

    });

};
