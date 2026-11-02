(function () {
    "use strict";

    var officeLocation = { lat: -26.2041, lng: 28.0473 };
    var map;
    var officeMarker;
    var userMarker;

    function setStatus(message) {
        var statusEl = document.getElementById('map-status');

        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    function formatKm(distanceMeters) {
        return (distanceMeters / 1000).toFixed(1);
    }

    function haversineDistanceMeters(a, b) {
        var toRad = Math.PI / 180;
        var dLat = (b.lat - a.lat) * toRad;
        var dLng = (b.lng - a.lng) * toRad;
        var lat1 = a.lat * toRad;
        var lat2 = b.lat * toRad;

        var sinLat = Math.sin(dLat / 2);
        var sinLng = Math.sin(dLng / 2);
        var h =
            sinLat * sinLat +
            Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

        var c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

        return 6371000 * c;
    }

    function updateDistance(userPosition) {
        var distanceMeters = haversineDistanceMeters(
            userPosition,
            officeLocation
        );

        setStatus(
            'You are approximately ' +
            formatKm(distanceMeters) +
            ' km from our Johannesburg service base.'
        );
    }

    function placeUserMarker(position, label) {
        if (!map) {
            return;
        }

        if (!userMarker) {
            userMarker = L.marker(
                [position.lat, position.lng],
                { title: 'Your location' }
            ).addTo(map);
        } else {
            userMarker.setLatLng([position.lat, position.lng]);
        }

        if (label) {
            userMarker.bindPopup(label);
        }

        map.setView([position.lat, position.lng], 12);
        updateDistance(position);
    }

    function setupSearch() {
        var input = document.getElementById('map-search');

        if (!input) {
            return;
        }

        input.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter') {
                return;
            }

            event.preventDefault();

            var query = input.value.trim();

            if (!query) {
                setStatus('Enter a suburb or address to search.');
                return;
            }

            setStatus('Searching for location...');

            var encoded = encodeURIComponent(query + ', South Africa');

            fetch(
                'https://nominatim.openstreetmap.org/search' +
                '?format=json&limit=1&q=' +
                encoded,
                {
                    headers: {
                        Accept: 'application/json'
                    }
                }
            )
                .then(function (response) {
                    return response.json();
                })
                .then(function (results) {
                    if (!results || results.length === 0) {
                        setStatus(
                            'No matching location found. Try a nearby suburb.'
                        );
                        return;
                    }

                    var first = results[0];

                    var position = {
                        lat: parseFloat(first.lat),
                        lng: parseFloat(first.lon)
                    };

                    placeUserMarker(position, first.display_name);

                    setStatus(
                        'Showing route context for ' +
                        first.display_name +
                        '.'
                    );
                })
                .catch(function () {
                    setStatus('Search failed. Please try again.');
                });
        });
    }

    function setupLocateMe() {
        var locateBtn = document.getElementById('locate-me-btn');

        if (!locateBtn) {
            return;
        }

        locateBtn.addEventListener('click', function () {
            if (!navigator.geolocation) {
                setStatus(
                    'Geolocation is not supported in your browser.'
                );
                return;
            }

            setStatus('Detecting your location...');

            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    var position = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };

                    placeUserMarker(position, 'Your location');
                },
                function () {
                    setStatus(
                        'Could not retrieve your location. ' +
                        'Please search manually.'
                    );
                }
            );
        });
    }

    function initMap() {
        if (!window.L) {
            setStatus('Map library failed to load.');
            return;
        }

        var mapElement = document.getElementById('service-map');

        if (!mapElement) {
            return;
        }

        map = L.map('service-map', {
            center: [officeLocation.lat, officeLocation.lng],
            zoom: 10
        });

        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
            }
        ).addTo(map);

        officeMarker = L.marker([
            officeLocation.lat,
            officeLocation.lng
        ]).addTo(map);

        officeMarker.bindPopup(
            '<strong>Bright Spark Electrical Services</strong>' +
            '<br>Johannesburg, South Africa'
        );

        setupSearch();
        setupLocateMe();

        setStatus(
            'Map ready. Enter a suburb/address and press Enter, ' +
            'or use your current position.'
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMap);
    } else {
        initMap();
    }
}());