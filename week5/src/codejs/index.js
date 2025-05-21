
const fetchData = async () =>{
    const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"
    const res = await fetch(url)
    const data = await res.json()

    const urlP = "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f"
    const resP = await fetch(urlP)
    const positive = await resP.json()

    const urlN = "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e"
    const resN = await fetch(urlN)
    const negative = await resN.json()

    initMap(data,positive,negative)
}

const initMap = (data,positive,negative) => {
    console.log(positive)
    /* Trying to avoid global variables */
    const initMap2 = (data) => {
        let map = L.map('map', {
            minZoom: -3
        })
    
        let geoJson = L.geoJSON(data, {
            weight: 2,
            onEachFeature: getFeature
        }).addTo(map)
    
        let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap"
        }).addTo(map)
    
        map.fitBounds(geoJson.getBounds())
    }

    const getFeature = (feature, layer) => {
        if (!feature.properties.nimi) return;
        const name = feature.properties.nimi
        const kunta = "KU" + feature.properties.kunta
        const indexList = positive.dataset.dimension.Tuloalue.category.index
        console.log(indexList)
        const index = indexList[kunta]
        const pValues = positive.dataset.value
        const positiveAmmount = pValues[index]
        const nValues = negative.dataset.value
        const negativeAmmount = nValues[index]
        layer.bindPopup(
            `<ul>
                <li>Name: ${name}</li>
                <li>Positive: ${positiveAmmount}</li>
                <li>Negative: ${negativeAmmount}</li>
            </ul>`
        )   
        layer.bindTooltip(name)
    }
    
    initMap2(data);
}


fetchData();

