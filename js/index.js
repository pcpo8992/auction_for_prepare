let liNumber = 0;
let itemID;
let itemName;
let itemLeastPrice;
let addAuctionItemBtn;
let myInputPeople;
let priceDetail;
let nowPrice;
let leastPrice = 0;
let itemNumber = 0;



let firebaseConfig = {
    // ...
    // The value of `databaseURL` depends on the location of the database
    databaseURL: "https://auction-88ffa-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Initialize Realtime Database and get a reference to the service
const database = firebase.database();
//  console.log("database");


window.onload = function() {
    addNewItem = document.querySelector(".addNewItem");

    dropdownContent = document.querySelector(".dropdown-content");

    itemID = document.querySelector("#itemID");

    itemName = document.querySelector("#itemName");

    itemLeastPrice = document.querySelector("#itemLeastPrice");

    addAuctionItemBtn = document.querySelector(".addAuctionItemBtn");

    myInputPeople = document.getElementById("myInputPeople");

    priceDetail = document.querySelector("#priceDetail");

    nowPrice = document.querySelector(".nowPrice");


    //從ＤＢ取出所有物件清單 status == 0 
    refreshDropDown();

};

//// status 0 1起始狀態 2拍賣中

// 按 Enter 新增
document.querySelector('#myInputPrice').addEventListener('keypress', function(e) {
    // Enter 對應鍵盤代碼：13
    if (e.which === 13) {
        addPrice();
    }
});

// 按 Enter 新增
document.querySelector('#myInputLeastPrice').addEventListener('keypress', function(e) {
    // Enter 對應鍵盤代碼：13
    if (e.which === 13) {
        // addPrice();
        let itemValue = document.querySelector(".itemDetail").value;
        let inputLeastPrice = document.querySelector('#myInputLeastPrice').value;
        // console.log(inputLeastPrice);
        // add inputLeastPrice to firebase
        if (inputLeastPrice != "" && !isNaN(inputLeastPrice)) {
            // database.ref('/' + itemID.value).update({
            database.ref('/item/' + itemValue).update({
                // "itemID": itemID.value,
                // "itemName": itemName.value,
                "itemLeastPrice": inputLeastPrice,
                // "status": 1
            });
            document.querySelector(".itemLeastPrice").innerHTML = "，最低加價金額：" + "<span class='spanColor leastPrice'>" + numberComma(inputLeastPrice) + "</span>";
        }
        document.querySelector('#myInputLeastPrice').value = "";
        // document.getElementById("myInputPeople").focus();
        focusBtn("myInputPeople");
        // document.querySelector(".itemLeastPrice").textContent = "最低加價金額：" + 
        // document.querySelector(".noPeopleBuyBtn").style.display = "block";
        // document.querySelector(".noPeopleBuyBtn").style.display = "block";
        var inputValuePeople = document.getElementById("myInputPeople").value;

        var inputValuePrice = document.getElementById("myInputPrice").value;
        if (inputValuePeople != "" && inputValuePrice != "") {
            addPrice();
        }
    }
});

//數字加上逗號
function numberComma(num) {
    let comma = /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g
    return num.toString().replace(comma, ',')
}

//設定網頁tag的呈現方式
function setHtmlTagStyleDisplay(tagName, display) {
    document.querySelector(tagName).style.display = display;
}

//設定input顯示方式
function focusBtn(IDName){
    document.getElementById(IDName).focus();
}


//更新物件清單
function refreshDropDown() {
    let a = document.querySelectorAll("a")
    for (let i = 0; i < a.length; i++) {
        a[i].remove()
    }

    database.ref("/item").once('value', e => {
        item = e.val();
        if (item != null) {
            let itemArray = Object.values(item);
            for (let i = 0; i < itemArray.length; i++) {
                if (itemArray[i].status == 1) {
                    var strHtml = "<a href='#' id='" + itemArray[i].unicID + "'" + ">" + itemArray[i].deptNo + " 股--" + itemArray[i].itemName + "</a>"
                    dropdownContent.innerHTML += strHtml;
                }
            }
            //給 
            let aBtn = document.querySelectorAll("a");
            for (var i = 0; i < aBtn.length; i++) {
                // console.log(aBtn[i].id);
                aBtn[i].onclick = function() {
                    // console.log(this.id);
                    addAuctionItem(this.id);
                }
            }
        }
    });
}


//增加拍賣物件資訊
function addAuctionItem(number) {
    let itemObject;
    database.ref("/item").once('value', e => {
        item = e.val();
        if (item != null) {
            let itemArray = Object.values(item);
            // console.log(itemArray);
            for (let i = 0; i < itemArray.length; i++) {

                if (itemArray[i].status == 2 && itemArray[i].nopeople == 1) {
                    database.ref('/item/' + itemArray[i].unicID).update({
                        "status": 3
                    });
                }
                if (itemArray[i].status == 2 && itemArray[i].endAuction == 1) {
                    database.ref('/item/' + itemArray[i].unicID).update({
                        "status": 3
                    });
                }
                //未達底價
                if (itemArray[i].status == 2 && itemArray[i].belowReserve == 1) {
                    database.ref('/item/' + itemArray[i].unicID).update({
                        "status": 3
                    });
                }

                if (itemArray[i].status == 1 && itemArray[i].unicID == number) {
                    itemObject = itemArray[i];
                }
            }

            setHtmlTagStyleDisplay(".priceDetail", "block");
            setHtmlTagStyleDisplay(".addNewItem", "none");
            setHtmlTagStyleDisplay(".itemId", "inline");
            setHtmlTagStyleDisplay(".itemName", "inline");
            setHtmlTagStyleDisplay(".itemLeastPrice", "inline");
            setHtmlTagStyleDisplay(".deleteDataBtn", "none");
            document.querySelector(".itemId").innerHTML = "拍賣物編號：" + "<span class='spanColor'>" + itemObject.itemID + "</span>";
            document.querySelector(".itemName").innerHTML = "，拍賣物名稱：" + "<span class='spanColor'>" + itemObject.itemName + "</span>";
            document.querySelector(".itemLeastPrice").innerHTML = "，最低加價金額：" + "<span class='spanColor leastPrice'>" + numberComma(itemObject.itemLeastPrice) + "</span>";
            document.querySelector(".itemDetail").value = itemObject.unicID;
            if (itemLeastPrice == "") {

            } else {
                leastPrice = itemObject.itemLeastPrice;
            }

            database.ref('/item/' + itemObject.unicID).update({
                "status": 2
            });
        }

    });
}



//比對金額 需要比前一次大 每一次金額要超過底價
function checkPriceIsCorrect(itemValue, inputValuePrice) {
    var maxValue = document.querySelector("li") ? document.querySelector("li").value : 0;
    var leastPrice = document.querySelector(".leastPrice").textContent == "" ? 0 : document.querySelector(".leastPrice").textContent
    console.log("inputValuePrice:" +inputValuePrice);
    console.log("maxValue:" +parseInt(maxValue));
    console.log("leastPrice:"+ leastPrice);
    console.log("leastPrice:" + parseInt(leastPrice.toString().replace(',', "")));
    console.log("inputValuePrice - maxValue -  leastPrice: " + (parseInt(inputValuePrice) - parseInt(maxValue) -  parseInt(leastPrice.toString().replace(',', ""))).toString());
    if(parseInt(inputValuePrice) - parseInt(maxValue) -  parseInt(leastPrice.toString().replace(',', "")) >= 0 ){
        return true;
    }else{
        return false;
    }
}

// 新增價格 status 2
function addPrice() {
    let itemValue = document.querySelector(".itemDetail").value;

    let inputLeastPrice = document.querySelector("#myInputLeastPrice").value;

    var ul = document.querySelector("#myUL");
    var li = document.createElement("li");
    liNumber += 1;
    li.id = 'li' + liNumber;
    li.number = liNumber;

    var inputValuePeople = document.getElementById("myInputPeople").value;

    var inputValuePrice = document.getElementById("myInputPrice").value;
    li.value = inputValuePrice;

    var finialValue = inputValuePeople + "號競買人 喊價 " + numberComma(inputValuePrice) + " 元";
    var t = document.createTextNode(finialValue);

    li.appendChild(t);
    

    if (inputValuePeople === '' || inputValuePrice === "") {
        if (inputValuePeople === '') {
            alert("必須輸入競買人資料");
            document.getElementById("myInputPeople").focus();
        } else if (inputValuePrice === "" || isNaN(inputValuePrice)) {
            alert("必須輸入喊價金額資料");
            document.getElementById("myInputPrice").focus();
        }
    } else if (isNaN(inputValuePrice) || isNaN(inputValuePeople)) {
        if (isNaN(inputValuePrice) ) {
            alert("輸入金額不是數字");
            document.getElementById("myInputPrice").focus();
        } else if (isNaN(inputValuePeople)) {
            alert("輸入不是數字");
            document.getElementById("myInputPeople").focus();
        }
    } else if (!checkPriceIsCorrect(itemValue,inputValuePrice)){
        alert("輸入金額需大於前次金額");
    }
    else {
        // add price to firebase
        database.ref('/item/' + itemValue + '/price_detail' + '/li/' + liNumber).update({
            'myInputPeople': inputValuePeople,
            'myInputPrice': inputValuePrice
        });

        document.querySelector(".nowPrice").textContent = numberComma(inputValuePrice) + '元';

        // document.querySelector(".price").style.display = "block";
        setHtmlTagStyleDisplay(".price", "block");

        document.getElementById("myUL").prepend(li);
        document.getElementById("myInputPeople").value = "";
        document.getElementById("myInputPrice").value = "";
        document.getElementById("myInputLeastPrice").value = "";

        document.getElementById("myInputPeople").focus();

        //增加刪除功能
        li.onclick = function() {
            li.remove();
            let id = li.id;
            //
            liNumber -= 1;
            if (liNumber == 0) {
                // console.log(nowPrice);
                nowPrice.textContent = "";
            } else {
                nowPrice.textContent = numberComma(document.querySelector("#li" + liNumber).value) + '元';
            }
            database.ref('/item/' + itemValue + '/price_detail' + '/li/' + li.number).set("");
        }
    }
}

//結束喊價
//將狀態改為3 status:3
//將endAuction改為1 endAuction:1
function endAuctionItemBtn() {
    let itemValue = document.querySelector(".itemDetail").value;
    document.getElementById("myInputPeople").value = "";
    document.getElementById("myInputPrice").value = "";
    document.getElementById("myInputLeastPrice").value = "";
    database.ref('/item/' + itemValue).update({
        "status": 2,
        "endAuction": 1
    });

    let ul = document.querySelectorAll("li")
    for (let i = 0; i < ul.length; i++) {
        ul[i].remove()
    }

    setHtmlTagStyleDisplay(".priceDetail", "none");
    setHtmlTagStyleDisplay(".price", "none");
    setHtmlTagStyleDisplay(".addNewItem", "block");
    setHtmlTagStyleDisplay(".itemId", "none");
    setHtmlTagStyleDisplay(".itemName", "none");
    setHtmlTagStyleDisplay(".itemLeastPrice", "none");
    setHtmlTagStyleDisplay(".deleteDataBtn", "inline");
    // setHtmlTagStyleDisplay(".belowReserveBtn", "inline");
    refreshDropDown();
}

//無人應買 status:2"nopeople": 1,
function noPeopleBuyBtn() {
    let itemValue = document.querySelector(".itemDetail").value;
    database.ref('/item/' + itemValue).update({
        "status": 2,
        "nopeople": 1,
    });
    setHtmlTagStyleDisplay(".priceDetail", "none");
    setHtmlTagStyleDisplay(".price", "none");
    setHtmlTagStyleDisplay(".addNewItem", "block");
    setHtmlTagStyleDisplay(".itemId", "none");
    setHtmlTagStyleDisplay(".itemName", "none");
    setHtmlTagStyleDisplay(".itemLeastPrice", "none");
    setHtmlTagStyleDisplay(".deleteDataBtn", "inline");
    // setHtmlTagStyleDisplay(".belowReserveBtn", "inline");
    refreshDropDown();
}

// 未達底價按鈕事件 114.10.15新增
function belowReserveBtn() {
  let itemValue = document.querySelector(".itemDetail").value;

  database.ref('/item/' + itemValue).update({
    "status": 2,
    "belowReserve": 1
  });

  setHtmlTagStyleDisplay(".priceDetail", "none");
  setHtmlTagStyleDisplay(".price", "none");
  setHtmlTagStyleDisplay(".addNewItem", "block");
  setHtmlTagStyleDisplay(".itemId", "none");
  setHtmlTagStyleDisplay(".itemName", "none");
  setHtmlTagStyleDisplay(".itemLeastPrice", "none");
  setHtmlTagStyleDisplay(".deleteDataBtn", "inline");
//   setHtmlTagStyleDisplay(".belowReserveBtn", "inline");
  refreshDropDown();
}

function deleteData(){
    //刪除endAuction
    //刪除price_detail
    //status 變更為1
    //itemleastPrice 變更為0

    database.ref("/item").once('value', e => {
        item = e.val();
        if (item != null) {
            let itemArray = Object.values(item);
            for (let i = 0; i < itemArray.length; i++) {
                let numer = 1 +i;
                database.ref('/item/' +numer).update({
                    "deptNo":itemArray[i].deptNo,
                    "execNo":itemArray[i].execNo,
                    "itemID":itemArray[i].itemID,
                    "itemLeastPrice":"",
                    "itemName":itemArray[i].itemName,
                    "status": 1,
                    "serialNo": itemArray[i].serialNo,
                    "unicID": itemArray[i].unicID,
                    "price_detail": "",
                    "endAuction": "",
                    "nopeople":"",
                    "belowReserve":""
                });
            }
            refreshDropDown();
        }
    });
    
}