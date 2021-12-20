mapboxgl.accessToken = '${MAPBOX_KEY}';
const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
  center: [-97, 39],
  interactive: false,
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
  getJSON('https://raw.githubusercontent.com/clatko/mapbox/master/usPresResults.json', (err, data) => {
    if (err !== null) {
      console.log('error fetching file')
    } else {
      data.forEach((row) => {
        if (!row['combined_fips']) {
          return;
        }
        // get winner
        const winner = row['votes_dem'] > row['votes_gop'] ? 'dem' : 'gop';
        const id = row['combined_fips'];
        newdata[id] = {
          winner: winner,
          diff: row['per_point_diff'] * 100
        }
      })

    }
    initLayers();
  })

  const initLayers = () => {

    const blueScale = d3.scaleLinear()
      .domain([0, 100])
      .range(['#bad2f0', '#1868d1']);

    const redScale = d3.scaleLinear()
      .domain([0, 100])
      .range(['#f2cbcb', '#be2d1e']);


    map.addSource('counties', {
      'type': 'vector',
      'url': 'mapbox://thepublichealthco.2yy4ft1e'
    });
    
    map.addLayer({
      'id': 'counties-join',
      'type': 'fill',
      'source': 'counties',
      'source-layer': 'uscounties',
      'paint': {
        'fill-color': ['feature-state', 'color']
      }
    }, 'waterway-label');
    
    const setCountiesColor = () => {
      for (let key in newdata) {
        map.setFeatureState({
          source: 'counties',
          sourceLayer: 'uscounties',
          id: key
        }, {
          'color': newdata[key]['winner'] === 'dem' ? blueScale(newdata[key]['diff']) : redScale(newdata[key]['diff'])
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
