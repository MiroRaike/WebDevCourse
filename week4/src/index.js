if (document.readyState !== "loading") {
    fetchData()
  } else {
    document.addEventListener("DOMContentLoaded", function () {
        fetchData()
    });
}

function fetchData(){
    const mybutton = document.getElementById("submit-data");

    mybutton.addEventListener("click", async function(){
        const url = "https://api.tvmaze.com/search/shows?q="
        const string = document.getElementById("input-show").value;
        const newUrl = url + string;

        console.log(newUrl);
        const dataPromise = await fetch(newUrl)
        const dataJSON = await dataPromise.json()
        const showDataTable = document.getElementById("mainDiv")

        console.log(dataJSON);

        showDataTable.innerHTML = "";
        dataJSON.forEach((data) => {

            var divData = document.createElement("div")
            divData.classList.add("show-data")

            var divInfo = document.createElement("div")
            divInfo.classList.add("show-info")

            let title = document.createElement("h1")
            title.innerText = data.show.name

            if(data.show.image){
                mediumUrl = data.show.image.medium
                let img = document.createElement("img")
                img.src = mediumUrl
                divData.appendChild(img)
            }

            divInfo.appendChild(title)
            divInfo.innerHTML += data.show.summary
            divData.appendChild(divInfo)
            showDataTable.appendChild(divData);
        })
    })
}