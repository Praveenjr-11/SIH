// Base Layers
var satellite = new ol.layer.Tile({
    title: "Satellite",
    name: "Satellite",
    visible: true,
    baseLayer: true,
    source: new ol.source.XYZ({
        url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    })
});
var osm = new ol.layer.Tile({
    title: "OSM",
    name: "OSM",
    opacity: 0.75,
    baseLayer: true,
    source: new ol.source.OSM(),
    visible: false
});
var bhuvan_satellite_source = new ol.source.TileWMS({
    url: 'https://bhuvan-ras2.nrsc.gov.in/tilecache/tilecache.py?',
    params: {
        'LAYERS': 'bhuvan_imagery2',
        'VERSION': '1.1.0',
    },
});
var bhuvan_satellite = new ol.layer.Tile({
    title: 'Bhuvan Satellite',
    type: 'wms',
    source: bhuvan_satellite_source,
    name: "Bhuvan Satellite",
    visible: false,
});

var projection = new ol.proj.get('EPSG:4326');
var projectionExtent = projection.getExtent();
var matrixIds = new Array(22);

for (var z = 0; z < 22; ++z) {
    matrixIds[z] = "EPSG:4326:" + z;
}
resolutions = [
    0.703125, 0.3515625, 0.17578125, 0.087890625,
    0.0439453125, 0.02197265625, 0.010986328125,
    0.0054931640625, 0.00274658203125, 0.001373291015625,
    6.866455078125E-4, 3.4332275390625E-4, 1.71661376953125E-4,
    8.58306884765625E-5, 4.291534423828125E-5, 2.1457672119140625E-5,
    1.0728836059570312E-5, 5.364418029785156E-6, 2.682209014892578E-6,
    1.341104507446289E-6, 6.705522537231445E-7, 3.3527612686157227E-7
];

var tngis_satellite_source = new ol.source.WMTS({
    url: 'https://192.168.4.247:8080/geoserver/satellite_image/gwc/service/wmts',
    layer: 'satellite_image:cartosat_2s_group',
    matrixSet: 'EPSG:4326',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds
    })
});
var tngis_satellite = new ol.layer.Tile({
    title: "TNGIS Satellite Image",
    baseLayer: true,
    source: tngis_satellite_source,
    visible: true,
});
// map.addLayer(tngis_satellite);

// DEM
var dem_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' generic_viewer' + ':' + 'elevation_raster',
        't': new Date().getMilliseconds(),
    },
    serverType: 'geoserver'
});
var dem = new ol.layer.Tile({
    title: 'DEM',
    type: 'wms',
    source: dem_source,
    name: "DEM",
    visible: false,
});

// Slope
var slope_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' generic_viewer' + ':' + 'tn_slope',
        't': new Date().getMilliseconds(),
    },
    serverType: 'geoserver'
});
var slope = new ol.layer.Tile({
    title: 'Slope',
    type: 'wms',
    source: slope_source,
    name: "Slope",
    visible: false,
});

// Aspects
var aspect_source = new ol.source.TileWMS({
    url: geoServerURL,
    params: {
        'LAYERS': ' generic_viewer' + ':' + 'tn_aspect',
        't': new Date().getMilliseconds(),
    },
    serverType: 'geoserver'
});
var aspect = new ol.layer.Tile({
    title: 'Aspect',
    type: 'wms',
    source: aspect_source,
    name: "Aspect",
    visible: false,
});

// Map Define
var map = new ol.Map({
    target: 'map',
    view: new ol.View({
        zoom: 6.8,
        maxZoom: 18,
        minZoom: 7,
        center: [8681480.570496075, 1224732.6162325153],
    }),
    layers: [osm, satellite, bhuvan_satellite, dem, slope, aspect],
});

// Scale
var scaleLineControl = new ol.control.CanvasScaleLine();
map.addControl(scaleLineControl);

// Legend
var legend = new ol.legend.Legend({
    title: 'Legend',
    margin: 5,
    maxWidth: 600
});
var legendCtrl = new ol.control.Legend({
    legend: legend,
    collapsed: false
});
// map.addControl(legendCtrl);

// Rotation Button
var button = document.createElement('button');
button.innerHTML = 'N';
// button.innerHTML = '<img src="assets/img/north.png" alt="North Arrow" width="25" height="25">';

var handleRotateNorth = function (e) {
    map.getView().setRotation(0);
};

button.addEventListener('click', handleRotateNorth, false);
var element = document.createElement('div');
element.className = 'rotate-north ol-unselectable ol-control';
element.setAttribute('title', 'Rotation');
element.appendChild(button);
var RotateNorthControl = new ol.control.Control({
    element: element
});
map.addControl(RotateNorthControl);

// goto location
$("#goto_location").click(function () {
    markers.getSource().removeFeature(marker);
    map.removeLayer(markers);
    var latitude = $('#getLatitude').val();
    var longitude = $('#getLongitude').val();
    if (!(latitude < 13.5628425807573 && latitude > 8.07761366959721)) {
        display_error_message("Enter Cordinates Within TamilNadu!");
        return false;
    }
    if (!(longitude < 80.3488179850324 && longitude > 76.2329830656992)) {
        display_error_message("Enter Cordinates Within TamilNadu!");
        return false;
    }
    map.addLayer(markers);
    marker = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude])));
    markers.getSource().addFeature(marker);
});

// Lat/Lon on mouse hover
map.on('pointermove', function (e) {
    var lonlat = ol.proj.toLonLat(e.coordinate);
    $("#lon").html(lonlat[0].toFixed(6));
    $("#lat").html(lonlat[1].toFixed(6));
});

// Zoom in/zoom Out
document.getElementById('zoom_in').onclick = function () {
    var view = map.getView();
    var zoom = view.getZoom();
    view.setZoom(zoom + 1);
};

document.getElementById('zoom_out').onclick = function () {
    var view = map.getView();
    var zoom = view.getZoom();
    view.setZoom(zoom - 1);
};

// Base Map Toggle
function basemapToggle(value) {
    if (value == 'google') {
        $("#google").addClass('img_border');
        $("#osm").removeClass('img_border');
        $("#bhuvan").removeClass('img_border');
        $("#tngis_satellite").removeClass('img_border');
        $("#dem").removeClass('img_border');
        $("#slope").removeClass('img_border');
        $("#aspect").removeClass('img_border');
        osm.setVisible(false);
        tngis_satellite.setVisible(true);
        bhuvan_satellite.setVisible(false);
        satellite.setVisible(true);
        dem.setVisible(false);
        slope.setVisible(false);
        aspect.setVisible(false);
    } else if (value == 'osm') {
        $("#osm").addClass('img_border');
        $("#google").removeClass('img_border');
        $("#bhuvan").removeClass('img_border');
        $("#tngis_satellite").removeClass('img_border');
        $("#dem").removeClass('img_border');
        $("#slope").removeClass('img_border');
        $("#aspect").removeClass('img_border');
        bhuvan_satellite.setVisible(false);
        tngis_satellite.setVisible(false);
        satellite.setVisible(false);
        osm.setVisible(true);
        dem.setVisible(false);
        slope.setVisible(false);
        aspect.setVisible(false);
    } else if (value == 'bhuvan') {
        $("#bhuvan").addClass('img_border');
        $("#osm").removeClass('img_border');
        $("#google").removeClass('img_border');
        $("#tngis_satellite").removeClass('img_border');
        $("#dem").removeClass('img_border');
        $("#slope").removeClass('img_border');
        $("#aspect").removeClass('img_border');
        osm.setVisible(false);
        satellite.setVisible(false);
        tngis_satellite.setVisible(false);
        bhuvan_satellite.setVisible(true);
        dem.setVisible(false);
        slope.setVisible(false);
        aspect.setVisible(false);
    }
    else if (value == 'tngis_satellite') {
        $("#tngis_satellite").addClass('img_border');
        $("#bhuvan").removeClass('img_border');
        $("#osm").removeClass('img_border');
        $("#google").removeClass('img_border');
        $("#dem").removeClass('img_border');
        $("#slope").removeClass('img_border');
        $("#aspect").removeClass('img_border');
        osm.setVisible(false);
        satellite.setVisible(false);
        bhuvan_satellite.setVisible(false);
        tngis_satellite.setVisible(true);
        dem.setVisible(false);
        slope.setVisible(false);
        aspect.setVisible(false);
    } else if (value == 'dem') {
        $("#dem").addClass('img_border');
        $("#slope").removeClass('img_border');
        $("#tngis_satellite").removeClass('img_border');
        $("#bhuvan").removeClass('img_border');
        $("#osm").removeClass('img_border');
        $("#google").removeClass('img_border');
        $("#aspect").removeClass('img_border');
        osm.setVisible(false);
        satellite.setVisible(false);
        bhuvan_satellite.setVisible(false);
        tngis_satellite.setVisible(false);
        dem.setVisible(true);
        slope.setVisible(false);
        aspect.setVisible(false);
    } else if (value == 'slope') {
        $("#slope").addClass('img_border');
        $("#dem").removeClass('img_border');
        $("#tngis_satellite").removeClass('img_border');
        $("#bhuvan").removeClass('img_border');
        $("#osm").removeClass('img_border');
        $("#google").removeClass('img_border');
        $("#aspect").removeClass('img_border');
        osm.setVisible(false);
        satellite.setVisible(false);
        bhuvan_satellite.setVisible(false);
        tngis_satellite.setVisible(false);
        dem.setVisible(false);
        slope.setVisible(true);
        aspect.setVisible(false);
    } else if (value == 'aspect') {
        $("#aspect").addClass('img_border');
        $("#slope").removeClass('img_border');
        $("#dem").removeClass('img_border');
        $("#tngis_satellite").removeClass('img_border');
        $("#bhuvan").removeClass('img_border');
        $("#osm").removeClass('img_border');
        $("#google").removeClass('img_border');
        osm.setVisible(false);
        satellite.setVisible(false);
        bhuvan_satellite.setVisible(false);
        tngis_satellite.setVisible(false);
        dem.setVisible(false);
        slope.setVisible(false);
        aspect.setVisible(true);
    }
}

function baseMapbutton(e) {
    if (e == 1) {
        document.getElementById("basemap").style.display = "block";
        $('#base').val(0);
    } else {
        document.getElementById("basemap").style.display = "none";
        $('#base').val(1);
    }

}

// Previous/Next Extent
var prev = new Array();
var nextval = new Array();
const view = map.getView();
const updatePermalink = function () {
    const center = view.getCenter();
    const state = {
        zoom: view.getZoom(),
        center: view.getCenter(),
        rotation: view.getRotation(),
    };
    prev.push(state);
    nextval.push(state);
};
map.on('moveend', updatePermalink);

function previous() {
    prev.pop();
    if (prev === undefined || prev.length == 0) {
        $(".previous").attr("disabled", true);
    } else {
        var value = prev.slice(-1)[0];
        map.getView().setCenter(value['center']);
        view.setZoom(value['zoom']);
        prev.pop();
    }
}

function next() {
    nextval.pop();
    if (nextval === undefined || nextval.length == 0) {
        $(".next").attr("disabled", true);
    } else {
        var value = nextval.slice(-1)[0];
        map.getView().setCenter(value['center']);
        view.setZoom(value['zoom']);
        nextval.pop();
    }
}

// Layer Load Spinner
map.on('loadstart', function () {
    map.getTargetElement().classList.add('spinner');
});
map.on('loadend', function () {
    map.getTargetElement().classList.remove('spinner');
});

// Address search

const searchmarker = new ol.Feature({
    geometry: new ol.geom.Point([[]])
});
searchmarker.setStyle(
    new ol.style.Style({
        image: new ol.style.Icon({
            src: "assets/img/marker-icon.png",
            anchor: [20, 2],
            anchorXUnits: "pixels",
            anchorYUnits: "pixels",
            anchorOrigin: "bottom-left"
        })
    })
);
const searchmarkerSource = new ol.source.Vector({
    features: [searchmarker]
});
const serachMarkerLayer = new ol.layer.Vector({
    'title': 'search marker',
    source: searchmarkerSource
});
map.addLayer(serachMarkerLayer);
$("#search_query_text").change(function () {
    var search_query = $('#search_query_text').val();
    if (search_query.length >= 1) {
        var data = {
            "format": "json",
            "countrycodes": "IN",
            "addressdetails": 1,
            "q": 'tamilnadu,' + search_query,
            // "q": search_query,
            "limit": 5
        };
        $.ajax({
            method: "GET",
            url: nominatium_api + "search.php",
            data: data
        })
            .done(function (msg) {
                if (msg.length > 0) {
                    var result_elements = '';
                    $('#result_search').empty();
                    for (var i = 0; i < msg.length; i++) {
                        //var bbox = msg[i].lat.toString();
                        // result_elements += '<li onclick="zoomtosearch('+msg[i].lat+','+msg[i].lon+')"; >'+msg[i].display_name+'</li>';
                        result_elements += `<li onclick="zoomtosearch(${msg[i].lat},${msg[i].lon},'${msg[i].display_name}')"; >${msg[i].display_name}</li>`;
                    }
                    $('#result_search').append(result_elements);
                    $('#result_search').removeClass('d-none');
                } else {
                    $('#result_search').empty();
                    $('#result_search').append('<li class="search_noresult">No Result Found</li>');
                    // $('#result_search').removeClass('d-none');
                }
            });
    } else {
        $('#result_search').empty();
    }
});
function zoomtosearch(lat, lon, display_name) {
    // console.log(display_name);
    var lat = parseFloat(lat);
    var long = parseFloat(lon);
    searchmarker.getGeometry().setCoordinates([]);
    //var proj_lat_long = ol.proj.fromLonLat([lat, long], 'EPSG:4326', 'EPSG:3857')
    //auto select feature based on search lat long
    var proj_lat_long = ol.proj.transform([long, lat], 'EPSG:4326', 'EPSG:3857');
    searchmarker.getGeometry().setCoordinates(proj_lat_long);
    var evt = {};
    evt.type = 'singleclick';
    evt.coordinate = [];
    evt.coordinate[0] = [proj_lat_long[0]];
    evt.coordinate[1] = [proj_lat_long[1]];
    map.dispatchEvent(evt);
    // Zoom to lat lon
    map.setView(
        new ol.View({
            center: ol.proj.fromLonLat([long, lat]),
            zoom: 16,
        })
    );
    $('#search_query_text').val(display_name);
    $('#result_search').addClass('d-none');
}

