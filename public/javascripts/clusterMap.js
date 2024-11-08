const map = L.map('cluster-map').setView([37.6922361, -97.3375448], 4);  // Coordinates 

    // Add a tile layer (background map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const markers = L.markerClusterGroup();

    // Add markers to the cluster group
    campgrounds.forEach(camp => {
      const marker = L.marker(camp.geometry.coordinates)
        .bindTooltip(`<strong><a href="/campgrounds/${camp._id}"><h6>${camp.title}</h6></a></strong><p>${camp.description.substring(0,30)}...</p>`)
        .openTooltip();
        markers.addLayer(marker);
    });

    // Add the marker cluster group to the map
    map.addLayer(markers);