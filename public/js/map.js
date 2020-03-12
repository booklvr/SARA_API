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
            img: point.avatar,
            point: {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [point.location.coordinates[0], point.location.coordinates[1]]
                },
                properties: {
                    name: point.name,
                    icon: 'user'
                }
            }
        }
    })

    console.log(locationPoints[0]);

    // loadMap(locationPoints);
}

getLocations();

map.on('load', function() {
    map.loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Cat_silhouette.svg/400px-Cat_silhouette.svg.png',
            function(error, image) {
                if (error) throw error;
                map.addImage('cat', image);
                map.addSource('point', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': [
                            {
                                'type': 'Feature',
                                'geometry': {
                                    'type': 'Point',
                                    'coordinates': [0, 0]
                                }
                            }
                        ]
                    }
                });
                map.addLayer({
                    'id': 'points',
                    'type': 'symbol',
                    'source': 'point',
                    'layout': {
                    'icon-image': 'cat',
                    'icon-size': 0.25
                }
            });
        }
    );
});

loadImage();