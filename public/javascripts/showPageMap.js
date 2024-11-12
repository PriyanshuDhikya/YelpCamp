maptilersdk.config.apiKey = maptilerApiKey;
console.log(campground.geometry.coordinates)
const map = new maptilersdk.Map({
    container: 'showpagemap',
    style: maptilersdk.MapStyle.BRIGHT,
    center: campground.geometry.coordinates, 
    zoom: 10
});


new maptilersdk.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)