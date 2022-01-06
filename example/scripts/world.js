mapboxgl.accessToken = '';
mapboxgl.clearStorage();

const zoomThreshold = 4;

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
        // filter this into 3 maps based on int length
        const id = parseInt(row['id']);
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
    map.addSource('world', {
      'type': 'vector',
      'url': 'mapbox://thepublichealthco.world'
    });
    
    map.addLayer({
      'id': 'world',
      'type': 'fill',
      'source': 'world',
      'source-layer': 'world',
      'minzoom': 0,
      'maxzoom': 4,
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
      'id': 'usstates',
      'type': 'fill',
      'source': 'world',
      'source-layer': 'us_states',
      'maxzoom': zoomThreshold,
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
      'id': 'mystates',
      'type': 'fill',
      'source': 'world',
      'source-layer': 'my_states',
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
      'id': 'uscounties',
      'type': 'fill',
      'source': 'world',
      'source-layer': 'us_counties',
      'minzoom': zoomThreshold,
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
      'id': 'world-line',
      'type': 'line',
      'source': 'world',
      'source-layer': 'world',
      'minzoom': 0,
      'maxzoom': 4,
      'paint': {
          'line-color': '#b8b8b8',
          'line-opacity': .6
      }
    }, 'waterway-label');
   map.addLayer({
      'id': 'us-states-line',
      'type': 'line',
      'source': 'world',
      'source-layer': 'my_states',
      'maxzoom': zoomThreshold,
      'paint': {
          'line-color': '#b8b8b8',
          'line-opacity': .6
      }
    }, 'waterway-label');
   map.addLayer({
      'id': 'us-states-line',
      'type': 'line',
      'source': 'world',
      'source-layer': 'us_states',
      'maxzoom': zoomThreshold,
      'paint': {
          'line-color': '#b8b8b8',
          'line-opacity': .6
      }
    }, 'waterway-label');
   map.addLayer({
      'id': 'us-counties-line',
      'type': 'line',
      'source': 'world',
      'source-layer': 'us_counties',
      'minzoom': zoomThreshold,
      'paint': {
          'line-color': '#b8b8b8',
          'line-opacity': .6
      }
    }, 'waterway-label');
    
    let hoveredCountryId = null;
    map.on('mousemove', 'world', function (e) {
      if (e.features.length > 0) {
        if (hoveredCountryId) {
          map.setFeatureState({
            source: 'world',
            sourceLayer: 'world',
            id: hoveredCountryId
          }, {
            hover: false
          });
        }

        hoveredCountryId = e.features[0].id;

        map.setFeatureState({
          source: 'world',
          sourceLayer: 'world',
          id: hoveredCountryId
        }, {
          hover: true
        });
      }
    });
    let hoveredMyStateId = null;
    map.on('mousemove', 'mystates', function (e) {
      if (e.features.length > 0) {
        if (hoveredMyStateId) {
          map.setFeatureState({
            source: 'world',
            sourceLayer: 'my_states',
            id: hoveredMyStateId
          }, {
            hover: false
          });
        }

        hoveredMyStateId = e.features[0].id;

        map.setFeatureState({
          source: 'world',
          sourceLayer: 'my_states',
          id: hoveredMyStateId
        }, {
          hover: true
        });
      }
    });
    let hoveredStateId = null;
    map.on('mousemove', 'usstates', function (e) {
      if (e.features.length > 0) {
        if (hoveredStateId) {
          map.setFeatureState({
            source: 'world',
            sourceLayer: 'us_states',
            id: hoveredStateId
          }, {
            hover: false
          });
        }

        hoveredStateId = e.features[0].id;

        map.setFeatureState({
          source: 'world',
          sourceLayer: 'us_states',
          id: hoveredStateId
        }, {
          hover: true
        });
      }
    });
    let hoveredCountyId = null;
    map.on('mousemove', 'uscounties', function (e) {
      if (e.features.length > 0) {
        if (hoveredCountyId) {
          map.setFeatureState({
            source: 'world',
            sourceLayer: 'us_counties',
            id: hoveredCountyId
          }, {
            hover: false
          });
        }

        hoveredCountyId = e.features[0].id;

        map.setFeatureState({
          source: 'world',
          sourceLayer: 'us_counties',
          id: hoveredCountyId
        }, {
          hover: true
        });
      }
    });

    map.on('click', 'world', function (e) {
      if (e.features.length > 0) {
        popup
        .setLngLat(e.lngLat)
        .setText(e.features[0].properties['name'])
        .addTo(map);
      }
    });

    map.on('click', 'mystates', function (e) {
      if (e.features.length > 0) {
        popup
        .setLngLat(e.lngLat)
        .setText(e.features[0].properties['name_en'] + " (Risk: " + newdata[e.features[0].id].risk + ")")
        .addTo(map);
      }
    });

    map.on('click', 'usstates', function (e) {
      if (e.features.length > 0) {
        popup
        .setLngLat(e.lngLat)
        .setText(e.features[0].properties['NAME'] + " (Risk: " + newdata[e.features[0].id].risk + ")")
        .addTo(map);
      }
    });

    map.on('click', 'uscounties', function (e) {
      if (e.features.length > 0) {
        popup
        .setLngLat(e.lngLat)
//         .setText(JSON.stringify(e.features[0].properties) + " " + e.features[0].properties.NAMELSAD + " (Risk: " + newdata[e.features[0].id].risk + ")")
        .setText(e.features[0].properties['NAMELSAD'] + " (Risk: " + newdata[e.features[0].id].risk + ")")
        .addTo(map);
      }
    });

    const setCountryColor = () => {
      for (let key in newdata) {
        map.setFeatureState({
          source: 'world',
          sourceLayer: 'world',
          id: key
        }, {
          'color': getColor(newdata[key]['risk'])
        })
      }
    }
    const setMyStatesColor = () => {
      for (let key in newdata) {
        map.setFeatureState({
          source: 'world',
          sourceLayer: 'my_states',
          id: key
        }, {
          'color': getColor(newdata[key]['risk'])
        })
      }
    }
    const setStatesColor = () => {
      for (let key in newdata) {
        map.setFeatureState({
          source: 'world',
          sourceLayer: 'us_states',
          id: key
        }, {
          'color': getColor(newdata[key]['risk'])
        })
      }
    }
    const setCountiesColor = () => {
      for (let key in newdata) {
        map.setFeatureState({
          source: 'world',
          sourceLayer: 'us_counties',
          id: key
        }, {
          'color': getColor(newdata[key]['risk'])
        })
      }
    }
    
    const setAfterLoad = (e) => {
      if (e.sourceId === 'world' && e.isSourceLoaded) {
        setCountryColor();
        setMyStatesColor();
        setStatesColor();
        setCountiesColor();
        map.off('sourcedata', setAfterLoad)
      }
    }
    
    if (map.isSourceLoaded('world')) {
      setCountryColor();
      setMyStatesColor();
      setStatesColor();
      setCountiesColor();
    } else {
      map.on('sourcedata', setAfterLoad);
    }
  }
});
