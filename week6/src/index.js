const jsonQuery = {
        "query": [
            {
                "code": "Vuosi",
                "selection": {
                    "filter": "item",
                    "values": [
                        "2000",
                        "2001",
                        "2002",
                        "2003",
                        "2004",
                        "2005",
                        "2006",
                        "2007",
                        "2008",
                        "2009",
                        "2010",
                        "2011",
                        "2012",
                        "2013",
                        "2014",
                        "2015",
                        "2016",
                        "2017",
                        "2018",
                        "2019",
                        "2020",
                        "2021"
                    ]
                }
            },
            {
                "code": "Alue",
                "selection": {
                    "filter": "item",
                    "values": [
                        "SSS"
                    ]
                }
            },
            {
                "code": "Tiedot",
                "selection": {
                    "filter": "item",
                    "values": [
                        "vaesto"
                    ]
                }
            }
        ],
        "response": {
            "format": "json-stat2"
        }
}

const fetchData = async () =>{
    const url = "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px"
    const res = await fetch(url, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(jsonQuery)
    })
    if(!res.ok){
        return;
    }
    const data = await res.json()
    
    return data
}

const buildChart = async () => {
    const data = await fetchData()
    console.log(data)

    const years = Object.values(data.dimension.Vuosi.category.label);
    console.log(years)
    const numbers = Object.values(data.value);
    console.log(numbers)

    const areas = Object.values(data.dimension.Alue.category.label)

    console.log(areas)

    areas.forEach((name, index) => {
        /* Code left over because i added all searches into get request so can just skips this and make the step easier*/
        let numbs = []
        for(let i = 0; i < 22; i++){
            numbs.push(numbers[i * areas.length + index])
        }
        console.log(numbs)
        areas[index] = {
            name: name,  chartType: 'line',
            values: numbs
        }
    })
    
    console.log(areas)

    const chartData = {
        labels: years, 
        datasets: areas
    }

    const chart = new frappe.Chart("#chart", {
        title: "Population growth in whole country",
        data: chartData,
        type: 'axis-mixed',
        colors: ['#eb5146'],
        height: 450,
        lineOptions: {
            regionFill: 0
        }
    })

    chart.export()
}

function update() {
    /* https://stackoverflow.com/questions/50623279/js-event-handler-async-function */
    const button = document.getElementById("submit-data");
    button.addEventListener("click", () => updateQuery(), false)
}

function loadNewWebPage() {

    const button = document.getElementById("navigation");
    button.addEventListener("click", function(){
        console.log("Test")
        window.location.href ="./newIndex.html";
    })
}

const updateQuery = async () => {
    const inputText = document.getElementById("input-area").value;
    const dataPromise = await fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px")
    const dataJSON = await dataPromise.json()
    const area = Object.values(dataJSON.variables)
    console.log(area[1])
    const someS = area[1].valueTexts
    console.log(inputText)
    const index = someS.indexOf(inputText)
    if(index == -1){
        return
    }
    const queryArea = jsonQuery.query[1].selection.values
    if(!queryArea.includes(area[1].values[index])){
        /* queryArea.push(area[1].values[index]) */
        queryArea[0] = area[1].values[index]
        console.log(jsonQuery)
        buildChart()
    }
}

buildChart()
update()
loadNewWebPage()
