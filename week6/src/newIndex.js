function goBack() {

    const button = document.getElementById("back");
    button.addEventListener("click", function(){
        console.log("Test")
        window.location.href ="./index.html";
    })
}

goBack()