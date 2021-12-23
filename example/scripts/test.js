mapboxgl.accessToken = '${MAPBOX_KEY}';
mapboxgl.clearStorage();

const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
  center: [-97, 39],
  interactive: true,
  zoom: 3
});

let newdata = new Map();

const getJSON = (url, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = () => {
    const status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

map.on('load', () => {
  getJSON('https://raw.githubusercontent.com/clatko/mapbox/master/risk.json', (err, data) => {
    if (err !== null) {
      console.log('error fetching file')
    } else {
      data.forEach((row) => {
        if (!row['id']) {
          return;
        }
        const id = parseInt(row['id'].split('-').pop());
        newdata[id] = {
          risk: row['risk']
        }
      })

    }
    initLayers();
  })

  const popup = new mapboxgl.Popup({
    closeButton: false
  });

  function getColor(d) {
    if (typeof(d) == "undefined" || d == null) {
      return 'transparent';
    }
    return d > 90 ? '#800026' :
           d > 70  ? '#E31A1C' :
           d > 50  ? '#FD8D3C' :
           d > 10  ? '#FC4E2A' :
                      '#FFEDA0';
  }

  const initLayers = () => {
    map.addSource('counties', {
      'type': 'vector',
      'url': 'mapbox://thepublichealthco.uscounties'
    });
    
    map.addLayer({
      'id': 'uscounties',
      'type': 'fill',
      'source': 'counties',
      'source-layer': 'us_counties',
      'paint': {
        'fill-color': ['feature-state', 'color'],
				'fill-opacity': [
			    'case',
			    ['boolean', ['feature-state', 'hover'], false],
			    1,
			    0.5]
      }
    }, 'waterway-label');

   map.addLayer({
        'id': 'counties-line',
        'type': 'line',
        'source': 'counties',
        'source-layer': 'us_counties',
        'paint': {
            'line-color': '#b8b8b8',
            'line-opacity': .6
        }
    }, 'waterway-label');
    
    let hoveredStateId = null;
    map.on('mousemove', 'uscounties', function (e) {
      if (e.features.length > 0) {
        if (hoveredStateId) {
          map.setFeatureState({
            source: 'counties',
            sourceLayer: 'us_counties',
            id: hoveredStateId
          }, {
            hover: false
          });
        }

        hoveredStateId = e.features[0].id;

        map.setFeatureState({
          source: 'counties',
          sourceLayer: 'us_counties',
          id: hoveredStateId
        }, {
          hover: true
        });
      }
    });

    map.on('click', 'uscounties', function (e) {
      if (e.features.length > 0) {
        popup
        .setLngLat(e.lngLat)
        .setText(e.features[0].properties.NAMELSAD + " (Risk: " + newdata[e.features[0].id].risk + ")")
        .addTo(map);
      }
    });
    
    const setCountiesColor = () => {
      for (let key in newdata) {
        map.setFeatureState({
          source: 'counties',
          sourceLayer: 'us_counties',
          id: key
        }, {
          'color': getColor(newdata[key]['risk'])
        })
      }
    }
    
    const setAfterLoad = (e) => {
      if (e.sourceId === 'counties' && e.isSourceLoaded) {
        setCountiesColor();
        map.off('sourcedata', setAfterLoad)
      }
    }
    
    if (map.isSourceLoaded('counties')) {
      setCountiesColor();
    } else {
      map.on('sourcedata', setAfterLoad);
    }
  }
});
