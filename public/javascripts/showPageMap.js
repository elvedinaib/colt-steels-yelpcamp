
    const map = L.map('map').setView(campground.geometry.coordinates, 10);  // Coordinates 

    // Add a tile layer (background map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Add a marker to the map
    L.marker(campground.geometry.coordinates).addTo(map)
      .bindPopup(`<h6>${campground.title}</h6><p>${campground.location}</p>`)
      .openPopup();