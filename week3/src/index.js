if (document.readyState !== "loading") {
    addData()
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      addData()
    });
}

async function addData() {
    const url = "https://statfin.stat.fi/PxWeb/sq/4e244893-7761-4c4f-8e55-7a8d41d86eff "
    const dataPromise = await fetch(url)
    const dataJSON = await dataPromise.json()
    const dataTable = document.getElementById("tbody");

    const url2 = "https://statfin.stat.fi/PxWeb/sq/5e288b40-f8c8-4f1e-b3b0-61b86ce5c065 "
    const dataPromise2 = await fetch(url2)
    const dataJSON2 = await dataPromise2.json()

    console.log(dataJSON2.dataset)

    let emplo = dataJSON2.dataset.value

    let popu = dataJSON.dataset.value
    let muni = Object.values(dataJSON.dataset.dimension.Alue.category.label)

    let x = 0;

    console.log(popu[0])
    console.log(muni[0])
    console.log(popu[x])
    console.log(muni[x])
    while(x < popu.length){

        let tr = document.createElement("tr")
        let td1 = document.createElement("td")
        let td2 = document.createElement("td")
        let td3 = document.createElement("td")
        let td4 = document.createElement("td")

        procentage = Math.floor((emplo[x]/popu[x]) * 100);
        
        if(procentage < 25){
          tr.classList.add("twentyFive");
        }

        if(procentage > 45){
          tr.classList.add("fortyFive");
        }

        td1.innerText = muni[x]
        td2.innerText = popu[x]
        td3.innerText = emplo[x]
        td4.innerText = procentage + "%"
        tr.appendChild(td1)
        tr.appendChild(td2)
        tr.appendChild(td3)
        tr.appendChild(td4)

        dataTable.appendChild(tr)
        x++;
    }
}

