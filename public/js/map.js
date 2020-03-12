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

    console.log(data);

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
                icon: 'marker'
            }
        };
    });

    console.log(locationPoints);

    loadMap(locationPoints);
}


function loadMap(points) {
    console.log(points);
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
            'id': 'points',
            'type': 'symbol',
            'source': 'point',
            'layout': {
                'icon-image': '{icon}-15',
                'icon-size': 1.5,
                'text-field': '{name}',
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-offset': [0, 0.9], 
                'text-anchor': 'top'
            }
        });
    });
};

getLocations();