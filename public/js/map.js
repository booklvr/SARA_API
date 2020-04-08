mapboxgl.accessToken = 'pk.eyJ1IjoiYm9va2x2ciIsImEiOiJjanh2bHllNDkwMjR1M2lub3ZwcHlkOG94In0.l9XDX5dbtYHhq5sicrj24Q';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: 9,
    center: [-122.0504, 49.0504]
});

// Fetch stores from API
async function getLocations() {
    const res = await fetch('/users/locations');
    
    const data = await res.json();

    // console.log(data);

    const locationPoints = data.map(point => {
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [
                    point.location.coordinates[0],
                    point.location.coordinates[1]
                ]
            },
            properties: {
                name: point.name,
                icon: point.name,
                description: `
                    <div class="mapPopup">
                        <
                        <a href="/profile/<%= point._id" title="Checkout their questions">
                            <h3><strong>${point.name}</strong></h3>
                        </a>
                    </div>  
                `
            }
        };
    });

    // console.log(locationPoints);

    loadMap(locationPoints);
}

async function loadMap(points) {

    const res = await fetch('/users/locations');
    const data = await res.json();
    

    data.forEach(img => {
        map.loadImage(`http://localhost:3000/users/${img.id}/avatar`, (error, image) => {
            if(error) throw error;
            map.addImage(img.name, image)
        } )
    })
    
    map.on('load', function() {
        map.addSource('point', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': points
                // 'features': [
                //     {
                //         'type': 'Feature',
                //         'geometry': {
                //             'type': 'Point',
                //             'coordinates': [-122.0504, 49.0504]
                //         },
                //         properties: {
                //             name: 'nick',
                //             icon: 'marker'
                //         }
                //     }
                // ]
            }
        });
        map.addLayer({
            'id': 'places',
            'type': 'symbol',
            'source': 'point',
            'layout': {
                'icon-image': '{icon}',
                'icon-size': .1,
                'text-field': '{name}',
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-offset': [0, 0.9], 
                'text-anchor': 'top'
            }
        });
    });

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'places', function(e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;
        
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        
        new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    });
        
    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', function() {
        map.getCanvas().style.cursor = 'pointer';
    });
        
    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function() {
        map.getCanvas().style.cursor = '';
    });
};

getLocations();








//this code was working :)
// map.on('load', function() {
//     map.addSource('point', {
//         'type': 'geojson',
//         'data': {
//             'type': 'FeatureCollection',
//             'features': points
//             // 'features': [
//             //     {
//             //         'type': 'Feature',
//             //         'geometry': {
//             //             'type': 'Point',
//             //             'coordinates': [-122.0504, 49.0504]
//             //         },
//             //         properties: {
//             //             name: 'nick',
//             //             icon: 'marker'
//             //         }
//             //     }
//             // ]
//         }
//     });
//     map.addLayer({
//         'id': 'points',
//         'type': 'symbol',
//         'source': 'point',
//         'layout': {
//             'icon-image': '{icon}-15',
//             'icon-size': 1.5,
//             'text-field': '{name}',
//             'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
//             'text-offset': [0, 0.9], 
//             'text-anchor': 'top'
//         }
//     });
// });