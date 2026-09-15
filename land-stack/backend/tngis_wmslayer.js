var wmsLayers = [];
var checkboxes = [];
var wmsLayerIndex=0;
//Load the WMSURL
function loadWMSLayer() {
    document.getElementById("wmslayerList").style.display = "block";
    var wmsUrlLayers = document.getElementById('wms-url-layers').value;
    var urlParts = wmsUrlLayers.split('?');
    var wmsUrl = urlParts[0];
    var layersParam = urlParts[1].split('=')[1];
    var layersArray = layersParam.split(',');

    var wmsLayer = new ol.layer.Tile({
        title: "Wmsvector",
        name: "Wmsurl",
        source: new ol.source.TileWMS({
            url: wmsUrl,
            params: {
                'LAYERS': layersArray
            }
        })
    });
    wmsLayers.push(wmsLayer);

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'layer-' +wmsLayerIndex;
    checkbox.className = 'custom-checkbox';
    checkbox.checked = true;
    checkbox.addEventListener('change', function () {
        wmsLayerload(this); // Call loadFile when checkbox state changes
    });

    var deleteBtn = document.createElement('i');
    deleteBtn.className = 'bi bi-trash';
    deleteBtn.style.marginLeft = '25px';
    deleteBtn.addEventListener('click', deleteWMSLayer.bind(null, wmsLayer,checkbox));
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

    var fileName = document.createTextNode(layersArray.join(', '));
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
    var layerList = document.getElementById('wmslayerList');
    display_success_message(layersArray+' WMSLayer Uploaded Successfully');
    layerList.appendChild(fileItem);
    wmsLayerIndex++;
    wmsLayerload(checkbox);
}

//Delete WMS Layer
function deleteWMSLayer(layer, checkbox) {
    wmsLayers.pop(layer);
    console.log(wmsLayers);
    map.removeLayer(layer);
    checkbox.parentNode.remove(); // Remove the parent element containing the checkbox and other elements
    document.getElementById('wms-url-layers').value = '';
    wmsLayerIndex--;
    if(wmsLayers.length==0){
        var wmsLayerList = document.getElementById('wmslayerList');
    if (wmsLayerList) {
      wmsLayerList.style.display = "none";
    }
    }
}

function wmsLayerload(checkbox){
    var wmslayerId = checkbox.id.split('-')[1]; // Extract the file index from checkbox id
    var wmsLayer = wmsLayers[ wmslayerId];
    if (checkbox.checked) {
    map.addLayer(wmsLayer);
    }
    else{
        map.removeLayer(wmsLayer);
    }
}