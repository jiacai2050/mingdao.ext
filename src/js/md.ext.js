
$(function () {
    var placeholder = $("div.form-edit.mart30").children("table.form-top").eq(2);
    accountsDB.getAccounts(function(items) {
        var html = ["<table class='form-top' border=1>",
                    "<tr><th>收款人</th><th>收款银行</th><th>收款卡号</th><th></th></tr>"];
        for (var i = 0; i < items.length; i++) {
            var account = items[i];
            var payee    = account.payee,
                bank     = account.bank,
                cardCode = account.cardCode;
            var rowHTML = [];
            rowHTML.push(
                "",
                "<tr><td>" + payee + "</td>",
                "<td>" + bank + "</td>",
                "<td>" + cardCode + "</td>",
                "<td><button class='choose'>选择</button></td>",
                "</tr>");
            html.push(rowHTML.join(""));
        }
        html.push("</table>");
        placeholder.after(html.join(""));
        $(".choose").bind("click", function(e) {
            var td = $(e.target).parent(); //td
            var par = td.parent(); //tr
            var tdPayee    = par.children("td:nth-child(1)"),
                tdBank     = par.children("td:nth-child(2)"),
                tdCardCode = par.children("td:nth-child(3)");
            var payeeVal    = tdPayee.html(),
                bankVal     = tdBank.html(),
                cardCodeVal = tdCardCode.html();
            $("#58b64203-e753-41bc-8fb0-bb8276d61be6").val(payeeVal);
            $("#a1d1b1dc-4633-4117-a3e4-7a5b8f4d695b").val(bankVal);
            $("#200d592b-9d77-48bb-b70d-f95dacb9c6af").val(cardCodeVal);
        });
    });
});
