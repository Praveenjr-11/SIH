var wfsLayers = [];
var checkboxes = [];
var wfsLayerIndex=0;
//Load WFSLayer
function loadWFSLayerFromURL() {
    document.getElementById("wfsLayerList").style.display = "block";
    var wfsLayer = new ol.layer.Vector({
        title: "Wfsvector",
        name: "Wfsurl",
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: function (extent) {
                return (
                    wfsUrl +
                    '?service=WFS&version=1.1.0&request=GetFeature&typename=' +
                    typeName +
                    '&' +
                    'outputFormat=application/json&srsname=EPSG:3857&' +
                    'bbox=' +
                    extent.join(',') +
                    ',EPSG:3857'
                );
            },
            strategy: ol.loadingstrategy.bbox
        }),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            })
        })
    });

  wfsLayers.push(wfsLayer);
   // wfsLayers.push(wfsLayer);
    var wfsUrlInput = document.getElementById('wfs-url').value;

    // Extract WFS URL
    var wfsUrlMatch = wfsUrlInput.match(/^(.*\/wfs)\b/);
    var wfsUrl = wfsUrlMatch ? wfsUrlMatch[1] : '';
    console.log(wfsUrl);

    // Extract typename
    var typenameMatch = wfsUrlInput.match(/typename=([^&]+)/);
    var typeName = typenameMatch ? typenameMatch[1] : '';
    console.log(typeName);

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'layer-' +wfsLayerIndex;
    checkbox.className = 'custom-checkbox';
    checkbox.checked = true;
  checkbox.addEventListener('change', function () {
        wfsLayerload(this); // Call loadFile when checkbox state changes
    })


    var deleteBtn = document.createElement('i');
    deleteBtn.className = 'bi bi-trash';
    deleteBtn.style.marginLeft = '25px';
    deleteBtn.addEventListener('click', deleteWFSLayer.bind(null, wfsLayer,checkbox));
    var infoIcon = document.createElement('i');
    infoIcon.className = 'bi bi-info-circle';
    infoIcon.style.cursor = 'pointer';
    infoIcon.addEventListener('click', function () {
        if (document.body.style.cursor === 'pointer') {
            document.body.style.cursor = 'auto';
        } else {
            document.body.style.cursor = 'pointer';
        }
    });
    infoIcon.style.marginLeft = '10px';

    var fileName = document.createTextNode(typeName);
    var fileNameContainer = document.createElement('span');
    fileNameContainer.className = 'file-name';
    fileNameContainer.appendChild(fileName);
    fileNameContainer.style.marginLeft = '10px';

    var fileItem = document.createElement('div');
    fileItem.appendChild(checkbox);
    fileItem.appendChild(fileNameContainer);
    fileItem.appendChild(document.createElement('br'));
    fileItem.appendChild(deleteBtn);
    fileItem.appendChild(infoIcon);
    display_success_message(typeName + ' WFSLayer Uploaded Successfully');
    var layerListContainer = document.getElementById('wfsLayerList');
    layerListContainer.appendChild(fileItem);

      wfsLayerIndex++;
    wfsLayerload(checkbox);
}


function deleteWFSLayer(layer, checkbox) {
    wfsLayers.pop(layer);
    checkbox.parentNode.remove(); // Remove the parent element containing the checkbox and other elements
    document.getElementById('wfs-url').value = '';
    wfsLayerIndex--;
    map.removeLayer(layer);
    if(wfsLayers.length==0){
        var wmsLayerList = document.getElementById('wfsLayerList');
    if (wmsLayerList) {
      wmsLayerList.style.display = "none";
    }
    }
}
function wfsLayerload(checkbox){
    var wfslayerId = checkbox.id.split('-')[1]; // Extract the file index from checkbox id
    var wfsLayer = wfsLayers[ wfslayerId];
    console.log(wfsLayer);
    if (checkbox.checked) {
    map.addLayer(wfsLayer);
    }
    else{
        map.removeLayer(wfsLayer);
    }
}