if (document.readyState !== "loading") {
    addDataToTable();
    emptyTable();
  } else {
    document.addEventListener("DOMContentLoaded", function () {
        addDataToTable();
        emptyTable();
    });
  }


function tableInsert(table, userName){
    let i = 0
    for(; i < table.rows.length; i++){
        var x = table.rows[i].cells;
        if(userName == x[0].innerHTML){
            return i;
        }
    } return i;
}

function addDataToTable(){
    const mybutton = document.getElementById("submit-data");

    mybutton.addEventListener("click", function () {
        var table = document.getElementById("tbodyId");
        const username = document.getElementById("input-username").value;
        const email = document.getElementById("input-email").value;
        var admin = document.getElementById("input-admin").checked
        const errormsg = document.getElementById("error-msg")
        /* Should check if username and email is empty*/
        if (!username || !email ) {
            errormsg.innerText = "No text inputted";
        }else{
            /* Got the adding table rows from here https://stackoverflow.com/questions/49217894/javascript-adding-dynamic-tables-rows*/
            errormsg.innerText = "";
            rowValue = tableInsert(table, username)
            if(rowValue < table.rows.length){
                var row = table.deleteRow(rowValue);
            }
            var row = table.insertRow(rowValue);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            cell1.innerHTML = username;
            cell2.innerHTML = email;
            if(admin){
                cell3.innerHTML = "X"
            }else(
                cell3.innerHTML = "-"
            )
        }
    });
}

function emptyTable(){
    const mybutton = document.getElementById("empty-table");

    mybutton.addEventListener("click", function(){
        var table = document.getElementById("tbodyId");
        for(; 0 < table.rows.length;){
            table.deleteRow(0);
        }
    });
}