var baseURL = String(document.location.href).replace(/#/, "");

$(document).ajaxStart(function () {
  // Show image container
  $("#Spinner").show();
});
$(document).ajaxComplete(function () {
  // Hide image container
  $("#Spinner").hide();
});

// Log Page Hits
$(window).on('load', function () {
  $.ajax({
    type: 'POST',
    url: api + 'api/data.php',
    cache: false,
    data: { 'case': 'pagelog' },
    dataType: 'json',
    success: function (result) {
      var queryString = window.location.search;
      if (!queryString) queryString = location.search;
      var query = queryString.substr(1);
      var result1 = {};
      query.split("&").forEach(function (part) {
        var item = part.split("=");
        result1[item[0]] = decodeURIComponent(item[1]);
      });
      if (result1 != undefined) {
        var para = $('#' + result1.lyr_id + '_Ele');
        var eye_icon = $('#' + result1.lyr_id + '_Ele').find("i:first");
        if (eye_icon.hasClass("visibility")) {
        } else {
          eye_icon.removeClass('bi bi-eye-slash c-pointer Nvisibility');
          eye_icon.addClass('bi bi-eye c-pointer visibility');
          fetch_layerServices(result1.lyr_id);
          $('#search').val(result1.layer_name);
          $('#search').keyup();
        }
      }
    }
  });
});

// Display Error message
function display_error_message(value) {
  swal({
    title: value,
    icon: "error",
    timer: 3000,
  });
}

// Display Success message
function display_success_message(value) {
  swal({
    title: value,
    icon: "success",
    timer: 3000,
  });
}

(function () {
  "use strict";
  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach(e => e.addEventListener(type, listener))
    } else {
      select(el, all).addEventListener(type, listener)
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Sidebar toggle
   */
  if (select('.toggle-sidebar-btn')) {
    on('click', '.toggle-sidebar-btn', function (e) {
      select('body').classList.toggle('toggle-sidebar')

    })
  }

  /**
   * Search bar toggle
   */
  if (select('.search-bar-toggle')) {
    on('click', '.search-bar-toggle', function (e) {
      select('.search-bar').classList.toggle('search-bar-show')
    })
  }

  /**
   * Navbar links active state on scroll
   */
  // let navbarlinks = select('#navbar .scrollto', true)
  // const navbarlinksActive = () => {
  //   let position = window.scrollY + 200
  //   navbarlinks.forEach(navbarlink => {
  //     if (!navbarlink.hash) return
  //     let section = select(navbarlink.hash)
  //     if (!section) return
  //     if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
  //       navbarlink.classList.add('active')
  //     } else {
  //       navbarlink.classList.remove('active')
  //     }
  //   })
  // }
  // window.addEventListener('load', navbarlinksActive)
  // onscroll(document, navbarlinksActive)

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Initiate tooltips
   */
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })
})();

// Aoi
// var aoiSource = new ol.source.Vector();
// var aoiFormat = new ol.format.GeoJSON();
// var aoiLayer = new ol.layer.Vector({
//   source: aoiSource,
//   visible: false,
//   style: new ol.style.Style({
//     fill: new ol.style.Fill({
//       color: 'rgba(248, 248, 248, 0.17)',
//     }),
//     stroke: new ol.style.Stroke({
//       color: 'rgba(109, 118, 214, 0.8)',
//       width: 3,
//     }),
//   }),
// });



// open all layer toggle 
var toggle_flag = 0;
$('body').on('click', 'i.all_toggle', function () {
  if (toggle_flag == 0) {
    if ($('#layer_vis_check').is(":checked")) {
    } else {
      $('.layer_toggle').toggleClass("icon-toggle-layer-view");
      $('.all_toggle').css("color", "#3FFF33");
      toggle_flag = 1;
    }
  } else {
    if ($('#layer_vis_check').is(":checked")) {
    } else {
      $('.layer_toggle').toggleClass("icon-toggle-layer-view");
      $('.all_toggle').css("color", "#bc70b5");
      toggle_flag = 0;
    }
  }
});

// Fetch layer Service
function fetch_layerServices(lyr_id, layer_name, service, column, value) {
  var aoi_service; var aoi_column; var aoi_value;
  var type = aoi_radio_chk();
  if (lyr_id == 1518) {
    $.ajax({
      type: "POST",
      url: api + 'api/data.php',
      data: { 'lyr_id': lyr_id, 'case': 'layer_service' },
      success: function (result) {
        var data = JSON.parse(result);
        if (data['status'] == 0) {
          display_error_message(data['message']);
        } else {
          var condition = data.slice(1);
          condition = condition[0];
          filter = null;
          var data = data.slice(2);
          data.forEach((result, index, array) => {
            display_layer(result['layer_id'], result['layer_name'], result['service_name'], filter);
          })
        }
      }
    });
  } else if (type == 'rural') {
    var district = $('#aoi_district').val();
    var block = $('#aoi_block').val();
    var pvill = $('#aoi_pvill').val();
    if (pvill != '-1' && block != '-1' && district) {

    } else if (block != '-1' && district) {
      aoi_service = 'generic_viewer:blocks';
      aoi_column = 'block_lgd_code';
      aoi_value = block;
    } else {
      aoi_service = 'generic_viewer:districts';
      aoi_column = 'district_lgd_code';
      aoi_value = district;
    }
    if (lyr_id) {
      $.ajax({
        type: "POST",
        url: api + 'api/data.php',
        data: { 'lyr_id': lyr_id, 'case': 'layer_service' },
        success: function (result) {
          var data = JSON.parse(result);
          if (data['status'] == 0) {
            display_error_message(data['message']);
          } else {
            var condition = data.slice(1);
            condition = condition[0];
            if (condition['filter'] == 0) {
              if (aoi_service && aoi_column && aoi_value) {
                filter = "Within(the_geom, collectGeometries(queryCollection('" + aoi_service + "','the_geom','" + aoi_column + " = " + aoi_value + "')));" + aoi_column + " = " + aoi_value + " OR INTERSECTS(the_geom, collectGeometries(queryCollection('" + aoi_service + "','the_geom','" + aoi_column + " = " + aoi_value + "')));" + aoi_column + " =" + aoi_value;
              } else {
                filter = null;
              }
            } else {
              if (aoi_service && aoi_column && aoi_value) {
                filter = "Within(the_geom, collectGeometries(queryCollection('" + aoi_service + "','the_geom','" + aoi_column + " = " + aoi_value + "')));" + aoi_column + " = " + aoi_value + " OR INTERSECTS(the_geom, collectGeometries(queryCollection('" + aoi_service + "','the_geom','" + aoi_column + " = " + aoi_value + "')));" + aoi_column + " =" + aoi_value;
              } else {
                service = condition['serv'];
                column = condition['colum'];
                value = condition['vale'];
                if (service && column && value) {
                  filter = "Within(the_geom, collectGeometries(queryCollection('" + service + "','the_geom','" + column + " = " + value + "')));" + column + " = " + value + " OR INTERSECTS(the_geom, collectGeometries(queryCollection('" + service + "','the_geom','" + column + " = " + value + "')));" + column + " =" + value;
                } else if (service) {
                  filter = "Within(the_geom, collectGeometries(queryCollection('" + service + "','the_geom','INCLUDE')));INCLUDE";
                }
              }
            }
            var data = data.slice(2);
            data.forEach((result, index, array) => {
              display_layer(result['layer_id'], result['layer_name'], result['service_name'], filter);
            })
          }
        }
      });
    }

  } else if (type == 'revenue') {
    var district = $('#aoi_district').val();
    var taluk = $('#aoi_taluk').val();
    var rvill = $('#aoi_rvill').val();
    if (rvill != '-1' && taluk != '-1' && district) {

    } else if (taluk != '-1' && district) {
      aoi_service = 'generic_viewer:taluks';
      aoi_column = 'sub_district_code';
      aoi_value = taluk;
    } else {
      aoi_service = 'generic_viewer:districts';
      aoi_column = 'district_lgd_code';
      aoi_value = district;
    }
    if (lyr_id) {
      $.ajax({
        type: "POST",
        url: api + 'api/data.php',
        data: { 'lyr_id': lyr_id, 'case': 'layer_service' },
        success: function (result) {
          var data = JSON.parse(result);
          if (data['status'] == 0) {
            display_error_message(data['message']);
          } else {
            var condition = data.slice(1);
            condition = condition[0];
            if (condition['filter'] == 0) {
              if (aoi_service && aoi_column && aoi_value) {
                filter = "Within(the_geom, collectGeometries(queryCollection('" + aoi_service + "','the_geom','" + aoi_column + " = " + aoi_value + "')));" + aoi_column + " = " + aoi_value + " OR INTERSECTS(the_geom, collectGeometries(queryCollection('" + aoi_service + "','the_geom','" + aoi_column + " = " + aoi_value + "')));" + aoi_column + " =" + aoi_value;
              } else {
                filter = null;
              }
            } else {
              if (aoi_service && aoi_column && aoi_value) {
                filter = "Within(the_geom, collectGeometries(queryCollection('" + aoi_service + "','the_geom','" + aoi_column + " = " + aoi_value + "')));" + aoi_column + " = " + aoi_value + " OR INTERSECTS(the_geom, collectGeometries(queryCollection('" + aoi_service + "','the_geom','" + aoi_column + " = " + aoi_value + "')));" + aoi_column + " =" + aoi_value;
              } else {
                service = condition['serv'];
                column = condition['colum'];
                value = condition['vale'];
                if (service && column && value) {
                  filter = "Within(the_geom, collectGeometries(queryCollection('" + service + "','the_geom','" + column + " = " + value + "')));" + column + " = " + value + " OR INTERSECTS(the_geom, collectGeometries(queryCollection('" + service + "','the_geom','" + column + " = " + value + "')));" + column + " =" + value;
                } else if (service) {
                  filter = "Within(the_geom, collectGeometries(queryCollection('" + service + "','the_geom','INCLUDE')));INCLUDE";
                }
              }
            }
            var data = data.slice(2);
            data.forEach((result, index, array) => {
              display_layer(result['layer_id'], result['layer_name'], result['service_name'], filter);
            })
          }
        }
      });
    }
  } else if (type == 'urban') {
  } else {
    if (lyr_id) {
      $.ajax({
        type: "POST",
        url: api + 'api/data.php',
        data: { 'lyr_id': lyr_id, 'case': 'layer_service' },
        success: function (result) {
          var data = JSON.parse(result);
          if (data['status'] == 0) {
            display_error_message(data['message']);
          } else {
            var condition = data.slice(1);
            condition = condition[0];
            if (condition['filter'] == 0) {
              if (aoi_service && aoi_column && aoi_value) {
                filter = "Within(the_geom, collectGeometries(queryCollection('" + aoi_service + "','the_geom','" + aoi_column + " = " + aoi_value + "')));" + aoi_column + " = " + aoi_value + " OR INTERSECTS(the_geom, collectGeometries(queryCollection('" + aoi_service + "','the_geom','" + aoi_column + " = " + aoi_value + "')));" + aoi_column + " =" + aoi_value;
              } else {
                filter = null;
              }
            }
            var data = data.slice(2);
            data.forEach((result, index, array) => {
              display_layer(result['layer_id'], result['layer_name'], result['service_name'], filter);
            })
          }
        }
      });
    }
  }
}

// Datatables
function buildTable(labels, objects, container, tableID) {
  var table = document.createElement('table');
  var thead = document.createElement('thead');
  var tbody = document.createElement('tbody');
  table.className = "table table-striped table-hover";
  table.id = tableID;
  var theadTr = document.createElement('tr');
  for (var i = 0; i < labels.length; i++) {
    var theadTh = document.createElement('th');
    theadTh.innerHTML = labels[i];
    theadTr.appendChild(theadTh);
  }
  thead.appendChild(theadTr);
  table.appendChild(thead);
  for (j = 0; j < objects.length; j++) {
    var tbodyTr = document.createElement('tr');
    for (k = 0; k < labels.length; k++) {
      var tbodyTd = document.createElement('td');
      tbodyTd.innerHTML = objects[j][labels[k].toLowerCase()];
      tbodyTr.appendChild(tbodyTd);
    }
    // console.log(objects[j])
    // tbodyTr.setAttribute("onclick", `getExtent(${objects[j]['id']})`);
    // tbodyTr.style.cursor = "pointer";
    tbody.appendChild(tbodyTr);
  }
  table.appendChild(tbody);
  container.appendChild(table);
}

// Attribute Table
var attribute_layer_id;
var attributes_offset;
var attributes_total_count;
$('body').on('click', 'i.details_dialog', function () {
  $('.table_layer').hide();
  $('#attributes_previous').val(500);
  $('#attributes_previous').val(500);
  var last;
  var lyr_id = $(this).closest('div').attr('id');
  lyr_id = lyr_id.split(/_/);
  lyr_id = lyr_id[0];
  attribute_layer_id = lyr_id;
  $('#download_attributes').val(lyr_id);
  show_details(lyr_id);
  var dialogOptions = {
    "title": "Layer Attributes",
    "width": 600,
    "height": 480,
    "autoOpen": true,
    "resizable": $("#is-resizable").is(":checked"),
    "draggable": $("#is-draggable").is(":checked"),
    "close": function () {
      if (last[0] != this) {
        $(this).remove();
      }
      $("#detailsTableDiv").empty();
    }
  };
  // if ( $("#button-cancel").is(":checked") ) {
  //    dialogOptions.buttons = { "Close" : function(){ $(this).dialog("close"); } };
  // }
  // dialog-extend options
  var dialogExtendOptions = {
    "closable": $("#button-close").is(":checked"),
    "maximizable": $("#button-maximize").is(":checked"),
    "minimizable": $("#button-minimize").is(":checked"),
    "collapsable": $("#button-collapse").is(":checked"),
  };
  // open dialog
  last = $("#detailsDialogBox").dialog(dialogOptions).dialogExtend(dialogExtendOptions);
});

// Fetch table data
function show_details(layer_id, offset) {
  if (layer_id) {
    $('#detailsTableDiv').empty();
    var aoi_filter_text;
    var aoi_dist = $("#aoi_district").val();
    var aoi_tlk = $("#aoi_taluk").val();
    var aoi_blk = $("#aoi_block").val();
    var aoi_pvill = $("#aoi_pvill").val();
    var aoi_rvill = $("#aoi_rvill").val();
    var dept_type = $("#depart_aoi").val();
    var dept_value = $("#depart_aoi_value").val();
    if (aoi_rvill != '-1' && aoi_tlk != '-1' && aoi_dist != -1) {
    } else if (aoi_tlk != '-1' && aoi_dist != -1) {
      aoi_filter_text = [1011, 'district_lgd_code', aoi_dist, 'sub_district_code', aoi_tlk];
    } else if (aoi_pvill != '-1' && aoi_blk != '-1' && aoi_dist != -1) {
    } else if (aoi_blk != '-1' && aoi_dist != -1) {
      aoi_filter_text = [1013, 'district_lgd_code', aoi_dist, 'block_lgd_code', aoi_blk];
    } else if (dept_type != '-1' && dept_value) {
    } else if (aoi_dist != -1) {
      aoi_filter_text = [1002, 'district_lgd_code', aoi_dist];
    } else {
    }

    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'layer_id': layer_id, 'offset': offset, 'aoi_filter_text': aoi_filter_text, 'case': 'tableValues' },
      beforeSend: function () {
        $('#attributesSpinner').fadeIn();
      },
      success: function (result) {
        var table_data = JSON.parse(result);
        if (table_data['status'] == 0) {
          display_error_message(table_data['message']);
          $("#detailsDialogBox").dialog("close");
        } else {
          layer_name = table_data[0];
          var table_name = table_data[1];
          attributes_total_count = table_data[2]['count'];
          if (parseInt(attributes_total_count) <= 500) {
            $('.current').html(attributes_total_count);
            $('#attributes_next').prop('disabled', true);
          } else {
            $('.current').html(500);
            $('#attributes_next').prop('disabled', false);
          }
          $('.total_count').html(attributes_total_count);
          $('.table_layer').show();
          $('.table_layer_name').html(layer_name.toUpperCase());
          table_data = table_data.slice(3);
          var keys = Object.keys(table_data[0]);
          var labels = [];
          jQuery.each(keys, function (index, item) {
            item = item.toUpperCase();
            labels.push(item);
          });
          buildTable(labels, table_data, document.getElementById('detailsTableDiv'), 'detailsTable');
          $('#detailsTable').DataTable({
            responsive: false,
            // responsive: true,
            pagingType: "simple",
            dom: 'Brtip',
            'info': false,
            bPaginate: false,
            buttons: [
              {
                extend: 'excelHtml5',
                title: layer_name
              },
              {
                extend: 'pdfHtml5',
                title: layer_name
              }
            ]
          });
          $('.dataTable').on('click', 'tbody tr', function () {
            if ($("#" + layer_id + "_Ele").find("i").hasClass("visibility")) {
              var row_data = $(this).find("td").eq(1).text();
              $.ajax({
                type: 'POST',
                url: api + 'api/data.php',
                data: { 'id': row_data, 'layer_id': layer_id, 'case': 'getExtent' },
                success: function (result) {
                  var layerDatas = JSON.parse(result);
                  if (layerDatas['status'] == 0) {
                    display_error_message(layerDatas['message']);
                  } else {
                    zoom_extent = Array.from(layerDatas[0].extent.split(','), Number);
                    zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
                    map.getView().fit(zoom_extent, { duration: 3000, padding: [500, 300, 500, 300] });
                    // map.getView().getZoom() - 5;
                  }
                },
              });
            } else {
              var layerDatas = Array();
              layerDatas['message'] = 'Please Enable Layer Visibility';
              display_error_message(layerDatas['message']);
            }
          });
        }
      },
      complete: function () {
        $('#attributesSpinner').fadeOut();
      },
    });
  }
}

// Pagination
$(document).on('click', '#attributes_previous', function (e) {
  attributes_offset = $('#attributes_previous').val();
  if (parseInt(attributes_offset) == 0 || parseInt(attributes_offset) == 500) {
    $('#attributes_previous').prop('disabled', true);
    $('#attributes_previous').val(attributes_offset);
  } else {
    $('#attributes_offset').prop('disabled', false);
    attributes_offset = parseInt(attributes_offset) - 500;
    show_details(attribute_layer_id, parseInt(attributes_offset) - 500);
    $('#attributes_previous').val(attributes_offset);
    $('#attributes_next').val(attributes_offset);
  }
});

$(document).on('click', '#attributes_next', function (e) {
  $('#attributes_previous').prop('disabled', false);
  attributes_offset = $('#attributes_next').val();
  if (parseInt(attributes_offset) >= parseInt(attributes_total_count)) {
    $('#attributes_next').prop('disabled', true);
  } else {
    show_details(attribute_layer_id, attributes_offset);
    attributes_offset = parseInt(attributes_offset) + 500;
    $('#attributes_previous').val(attributes_offset);
    $('#attributes_next').val(attributes_offset);
    $('#attributes_next').prop('disabled', false);
  }
});

// download Attribute data
// function createDownloadExcel(labels,download,layer_name){
//   /* generate worksheet and workbook */
//   const worksheet = XLSX.utils.json_to_sheet(download);
//   const workbook = XLSX.utils.book_new();
//   /* Fix Sheet Name */
//   XLSX.utils.book_append_sheet(workbook, worksheet, layer_name);
//   /* fix headers */
//   XLSX.utils.sheet_add_aoa(worksheet, [labels], { origin: "A1" });
//   /*Fix File name and Write*/
//   XLSX.writeFile(workbook, ""+layer_name+".xlsx", { compression: true });
// }
// $('#download_attributes').on('click',function(){
//   var layer_id = $('#download_attributes').val();
//   var aoi_filter_text;
//   var aoi_dist = $("#aoi_district").val();
//   var aoi_tlk = $("#aoi_taluk").val();
//   var aoi_blk = $("#aoi_block").val();
//   var aoi_pvill = $("#aoi_pvill").val();
//   var aoi_rvill = $("#aoi_rvill").val();
//   var dept_type = $("#depart_aoi").val();
//   var dept_value = $("#depart_aoi_value").val();
//   if(aoi_rvill != '-1' && aoi_tlk != '-1' && aoi_dist != -1){
//   }else if(aoi_tlk != '-1' && aoi_dist != -1){
//     aoi_filter_text = [1011,'district_lgd_code',aoi_dist,'sub_district_code',aoi_tlk];
//   }else if (aoi_pvill != '-1' && aoi_blk != '-1' && aoi_dist != -1){
//   }else if(aoi_blk != '-1' && aoi_dist != -1){
//     aoi_filter_text = [1013,'district_lgd_code',aoi_dist,'block_lgd_code',aoi_blk];
//   }else if (dept_type != '-1' && dept_value){
//   }else if (aoi_dist != -1){
//     aoi_filter_text = [1002,'district_lgd_code',aoi_dist];
//   }else{ 
//   }
//   $.ajax({
//     type:"POST",
//     url:api+'api/data.php',
//     data:{'layer_id':layer_id,"aoi_filter_text":aoi_filter_text,'case':'downloadAttributesData'},
//     beforeSend: function () {
//       $('#attributesSpinner').fadeIn();
//     },
//     success:function(result){
//       result = JSON.parse(result);
//       if(result[0]['status'] == 0){
//         display_error_message(layer_lists['message']);
//       }else{
//         download = result.slice(2);
//         var keys = Object.keys(download[0]);
//         var labels = [];
//         jQuery.each(keys, function(index, item) {
//           item = item.toUpperCase();
//           labels.push(item);
//         });
//         createDownloadExcel(labels,download,result[0])
//       }
//     },
//     complete: function () {
//       $('#attributesSpinner').fadeOut();
//     },
//   });
// });

// Label layer
var label_flag = 0;

function label_layer(label_name, layer_name, service_name, lyr_id, element, filter) {
  remove_Layers(lyr_id);
  var label_layer = new ol.layer.Tile({
    title: lyr_id,
    type: 'wms',
    source: new ol.source.TileWMS({
      url: geoServerURL,
      params: {
        'LAYERS': service_name,
        'SLD': null,
        't': new Date().getMilliseconds(),
        'CQL_FILTER': filter

      },
      serverType: 'geoserver'
    }),
    name: layer_name,
    visible: true,
  });
  map.addLayer(label_layer);
  var label_layer1 = new ol.layer.Tile({
    title: lyr_id,
    type: 'wms',
    source: new ol.source.TileWMS({
      url: geoServerURL,
      params: {
        'LAYERS': service_name,
        'SLD': null,
        't': new Date().getMilliseconds(),
        'CQL_FILTER': filter
      },
      serverType: 'geoserver'
    }),
    name: layer_name,
    visible: false,
  });
  map.addLayer(label_layer1);
  if (label_flag == 0) {
    $.ajax({
      type: "POST",
      url: api + "api/getLabelSld.php",
      dataType: "xml",
      data: { 'label_name': label_name, 'service_name': service_name },
      success: function (result) {
        label_layer1.getSource().updateParams({ 'SLD': api + 'tmp/label.xml', 't': new Date().getMilliseconds() });
        label_layer1.setVisible(true);
      }
    });
    element.addClass('iClicked');
    label_flag = 1;
  } else {
    remove_Layers(lyr_id);
    label_flag = 0;
    element.removeClass('iClicked');
  }
}

$('body').on('click', 'i.layer_label', function () {
  var element = $(this);
  var lyr_id = $(this).closest('div').attr('id');
  lyr_id = lyr_id.split(/_/);
  lyr_id = lyr_id[0];
  if ($("#" + lyr_id + "_Ele").find("i").hasClass("visibility")) {
    $.ajax({
      type: "POST",
      url: api + 'api/data.php',
      data: { 'lyr_id': lyr_id, 'case': 'getLabel' },
      success: function (result) {
        var data = JSON.parse(result);
        condition = data[0];
        if (condition['status'] == 1) {
          filter = null;
          var label = data[1];
          var layer = data[2];
          var service = data[3];
          var lyr_id = data[4];
          label_layer(label, layer, service, lyr_id, element, null);
        } else {
          filter = "Within(the_geom, collectGeometries(queryCollection('" + condition['serv'] + "','the_geom','" + condition['colum'] + "=" + condition['vale'] + "')));" + condition['colum'] + "=" + condition['vale'] + " OR INTERSECTS(the_geom, collectGeometries(queryCollection('" + condition['serv'] + "','the_geom','" + condition['colum'] + "=" + condition['vale'] + "')));" + condition['colum'] + "=" + condition['vale'];
          var label = data[1];
          var layer = data[2];
          var service = data[3];
          var lyr_id = data[4];
          label_layer(label, layer, service, lyr_id, element, filter);
        }
      }
    });
  } else {
    var layerDatas = Array();
    layerDatas['message'] = 'Enable Layer Visibility';
    display_error_message(layerDatas['message']);
  }
});

// Current Location
function current_location() {
  const geolocation = new ol.Geolocation({
    // enableHighAccuracy must be set to true to have the heading value.
    trackingOptions: {
      enableHighAccuracy: true,
    },
    projection: map.getView().getProjection(),
  });

  const accuracyFeature = new ol.Feature();
  geolocation.on('change:accuracyGeometry', function () {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });

  const positionFeature = new ol.Feature();
  positionFeature.setStyle(
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          color: '#3399CC',
        }),
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 4,
        }),
      }),
    })
  );

  var currentLocation = new ol.layer.Vector({
    name: 'current Location',
    source: new ol.source.Vector({
      features: [accuracyFeature, positionFeature],
    }),
    visible: false,
  });
  map.addLayer(currentLocation);

  let isTracking = true;
  if (isTracking) {
    currentLocation.setVisible(true);
    geolocation.setTracking(true);
  } else {
    currentLocation.setVisible(false);
    geolocation.setTracking(false);
  }
  isTracking = !isTracking;

  // handle geolocation error.
  geolocation.on('error', function (error) {
    alert(error.message);
    currentLocation.setVisible(false);
    geolocation.setTracking(false);
  });

  geolocation.on('change:position', function () {
    const coordinates = geolocation.getPosition();
    positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
  });
}

// Get Application content 
function appContent() {
  $.ajax({
    type: "POST",
    url: api + 'api/data.php',
    data: { 'case': 'getApplicationContent' },
    success: function (result) {
      var content = JSON.parse(result);
      if (content['status'] == 0) {
        display_error_message(content['message']);
      } else {
        if (content[0]['application_name'] != null) {
          $('#application_name').html(content[0]['application_name']);
        }
        if (content[0]['logo_path'] != null) {
          $('#app_logo').attr("src", "assets/img/" + content[0]['logo_path'] + "");
        }
        if (content[0]['dept_app_url'] != null) {
          $('#app_href').attr("href", content[0]['dept_app_url']);
        }
        if (content[0]['extent'] != null) {
          zoomExtent(content[0]['extent']);
        } else {
          zoomExtent([73.94541678333862, 7.940482947168725, 82.63638426682029, 13.699973303285539]);
        }
      }
    }
  });
}
$(document).ready(function () {
  appContent();
});

function zoomExtent(value) {
  if (Array.isArray(value) == true) {
    zoom_extent = value;
    zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
    map.getView().fit(zoom_extent, { duration: 3000, padding: [500, 300, 500, 300] });
  } else {
    zoom_extent = Array.from(value.split(','), Number);
    zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
    map.getView().fit(zoom_extent, { duration: 3000, padding: [500, 300, 500, 300] });
  }
}

// buffer for Distance
var geojsonSource = new ol.source.Vector();
var geojsonFormat = new ol.format.GeoJSON();
var geojsonLayer = new ol.layer.Vector({
  name: 'Buffer Circle',
  source: geojsonSource,
  visible: true,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(248, 248, 248, 0.17)',
    }),
    stroke: new ol.style.Stroke({
      color: 'rgba(109, 118, 214, 0.8)',
      width: 3,
    }),
  }),
});

// Theme Group Toggle
var grpcollapse = 0;
function themeGrpCollaspe(id) {
  if (grpcollapse == 0) {
    $(`#${id}_body`).show();
    grpcollapse = 1;
  } else {
    $(`#${id}_body`).hide();
    grpcollapse = 0;
  }

}

// Fetch All Layer List
function fetch_layer(layer_lists) {
  if (!jQuery.isEmptyObject(layer_lists)) {
    var themes = new Array();
    var theme = new Array();
    var vis_layer = [...new Set(layer_lists.map(x => x.enable_vis_layer))];
    var vis_enable = vis_layer[0].split(",");
    themes = [...new Set(layer_lists.map(x => x.theme_order_id))];
    var theme_name = [...new Set(layer_lists.map(x => x.theme))];
    for (i in themes) {
      themecontent = themes[i];
      var element = `<div class="accordion showLayerInfos" id="theme_${themecontent}"><div class="accordion-item"><h2 class="accordion-header">
      <button class="accordion-button py-1 font18" type="button" data-bs-toggle="collapse" data-bs-target="#thm_${themecontent}" aria-expanded="true" aria-controls="collapseOne">${theme_name[i]}</button></h2>`;
      element += `<div id="thm_${themecontent}" class="accordion-collapse collapse show" data-bs-parent="#theme_${themecontent}"><a href="#" class="btn btn-success custom-btn px-2 mgexpandclass" style = "background-color:rgb(23, 121, 136);" onclick="exp_colfunction(${themecontent})" data-value="1">Expand Map Group</a><div class="accordion-body">`;
      // if(i == 0){
      //   element += `<div id="${themecontent}" class="accordion-collapse collapse show" data-bs-parent="#${themecontent}_theme"><div class="accordion-body px-2 py-0">`;
      // }else{
      //   element += `<div id="${themecontent}" class="accordion-collapse collapse" data-bs-parent="#${themecontent}_theme"><div class="accordion-body">`;
      // }
      var mapgroup = [...new Set(layer_lists.filter(function (el) { return el.theme_order_id == themes[i]; }).map(function (el) { return el.map_group_order_id; }))];
      var mapgroup_name = [...new Set(layer_lists.filter(function (el) { return el.theme_order_id == themes[i]; }).map(function (el) { return el.map_group; }))];
      for (j in mapgroup) {
        map_groupcontent = mapgroup[j];
        element += `<div class="accordion showLayerInfos1" id="map_${themecontent}_${map_groupcontent}"><div class="accordion-item"><h2 class="accordion-header">`;
        if (j == 0) {
          element += `<button class="accordion-button py-1 font18" type="button" data-bs-toggle="collapse" data-bs-target="#mg_${themecontent}_${map_groupcontent}" aria-expanded="true" aria-controls="collapseOne">${mapgroup_name[j]}</button></h2><div id="mg_${themecontent}_${map_groupcontent}" class="accordion-collapse collapse show " data-bs-parent="#map_${themecontent}_${map_groupcontent}"><div class="accordion-body px-1 py-0">`;
        } else {
          element += `<button class="accordion-button py-1 font18 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#mg_${themecontent}_${map_groupcontent}" aria-expanded="true" aria-controls="collapseOne">${mapgroup_name[j]}</button></h2><div id="mg_${themecontent}_${map_groupcontent}" class="accordion-collapse collapse" data-bs-parent="#map_${themecontent}_${map_groupcontent}"><div class="accordion-body px-1 py-0">`;
        }
        var layerGrpArray = layer_lists.filter(function (el) { return el.map_group_order_id == mapgroup[j] && el.theme_order_id == themes[i]; });
        layerGrpArray.forEach((layer, index, array) => {
          element += `<div id="${layer.layer_id}_MaDiv" style="margin-left: 20px;"><p class="mb-1 text-white" id="${layer.layer_id}_Ele">`;
          if (jQuery.inArray(layer['layer_id'].toString(), vis_enable) != -1) {
            element += `<i class="bi bi-eye c-pointer visibility" data-bs-toggle="tooltip" data-bs-placement="view" data-bs-title="Visiblity"></i>`;
            fetch_layerServices(layer['layer_id'], layer['layer_name']);
          } else {
            element += `<i class="bi bi-eye-slash c-pointer Nvisibility" data-bs-toggle="tooltip" data-bs-placement="view" data-bs-title="Visiblity"></i>`;
          }
          element += `<span class="layer_name px-3">${layer.layer_name}</span><label class="form-check-label icon-toggle-layer" style="float: right;cursor: pointer;"><i class="bi bi-gear" aria-hidden="true"></i></label></p><div class="card layer_toggle" id="${layer.layer_id}" style="display:none;"><div class="card-body text-white py-2" id="${layer.layer_id}_Div"><a class="card-link text-white " href="#" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Attribute Display" title="Attribute Display"><i class="bi bi-journal-check font-18 deta details_dialog"></i></a><a class="card-link text-white" data-bs-toggle="tooltip" href="#" data-bs-placement="top" data-bs-title="Label" title="Label"><i class="bi bi-tag font-18 layer_label"></i></a><a class="card-link text-white" href="#" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Identifier" title="Identifier"><i class="bi bi-geo font-18 map_popup"></i></a><a class="card-link text-white" href="#" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Meta Data" title="Meta Data"><i class="bi bi-check2-circle font-18 meta_data_fetch" data-bs-toggle="offcanvas" data-bs-target=".viewdetails"></i></a><a class="card-link text-white" href="#" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Feature Count" title="Feature Count"><i class="bi bi-123 font-18 showcount"></i></a><input type="range" min="1" max="100" value="100" class="transparency" title="Transparency"></div></div></div>`;
        });
        element += `</div></div></div></div>`;
      }
      $("#layer_list").append(element);
    }
  }
}

// search layer
$("#search").on("keyup", function () {
  // $("#layer_list").empty();
  var query = $(this).val();
  if (query !== "") {
    $.ajax({
      type: "POST",
      url: api + 'api/data.php',
      data: { 'query': query, 'case': 'getLayers' },
      success: function (result) {
        var layer_lists = JSON.parse(result);
        if (layer_lists['status'] == 0) {
          display_error_message(layer_lists['message']);
          var layers = layer_lists[0];
          if (!jQuery.isEmptyObject(layers)) {
            layers.forEach((lyr, index, array) => {
              $('#' + lyr['layer_id']).css("display", "none");
              $('#' + lyr['layer_id'] + '_Ele').css("display", "block");
              $('#' + lyr['layer_id']).removeClass("icon-toggle-layer-view");
            });
          };
        } else {
          var search = layer_lists[0];
          var layers = layer_lists[1];
          if (!jQuery.isEmptyObject(search)) {
            search.forEach((lyr, index, array) => {
              $('#' + lyr['layer_id']).css("display", "none");
              $('#' + lyr['layer_id'] + '_Ele').css("display", "block");
              $('#layer_list > div').map(function () {
                var check_vis_thm = new Array();
                var theme = $(this).attr('id');
                $("#" + theme + "> div").map(function () {
                  var mg_Div = $('#' + theme).find('.showLayerInfos1');
                  for (var mg of mg_Div) {
                    var check_vis_mg = new Array();
                    mgDiv = mg.getElementsByTagName('div')[1],
                      layerstack = mgDiv.getElementsByTagName('div')[0];
                    $(layerstack).children('div').map(function () {
                      visi = $(this).find("p").css('display') == 'block';
                      check_vis_mg.push(visi);
                      check_vis_thm.push(visi);
                    });
                    if (jQuery.inArray(true, check_vis_mg) == -1) {
                      mg.style.display = "none";
                      mgDiv.classList.remove('show');
                    } else {
                      mg.style.display = "block";
                      mgDiv.classList.add('show');
                    }
                  }
                });
                if (jQuery.inArray(true, check_vis_thm) == -1) {
                  this.style.display = "none";
                } else {
                  this.style.display = "block";
                }
              });
            });
          }
          if (!jQuery.isEmptyObject(layers)) {
            layers.forEach((lyr, index, array) => {
              $('#' + lyr['layer_id']).css("display", "none");
              $('#' + lyr['layer_id'] + '_Ele').css("display", "none");
              $('#' + lyr['layer_id']).removeClass("icon-toggle-layer-view");
            });
          };

        }
      }
    });
  }
  else {
    $.ajax({
      type: "POST",
      url: api + 'api/data.php',
      data: { 'case': 'getLayers' },
      success: function (result) {
        var layer_lists = JSON.parse(result);
        if (layer_lists['status'] == 0) {
          display_error_message(layer_lists['message']);
        } else {
          if (!jQuery.isEmptyObject(layer_lists)) {
            layer_lists.forEach((lyr, index, array) => {
              var theme = lyr['theme'].replace(/[^A-Z0-9]/ig, "_");
              theme = theme.toLowerCase();
              $('#' + theme).css("display", "block");
              $('#' + lyr['layer_id']).css("display", "none");
              $('#' + lyr['layer_id'] + '_Ele').css("display", "block");
              $('#layer_list > div').map(function () {
                var check_vis_thm = new Array();
                var theme = $(this).attr('id');
                $("#" + theme + "> div").map(function () {
                  var mg_Div = $('#' + theme).find('.showLayerInfos1');
                  for (var mg of mg_Div) {
                    var check_vis_mg = new Array();
                    mgDiv = mg.getElementsByTagName('div')[1],
                      layerstack = mgDiv.getElementsByTagName('div')[0];
                    $(layerstack).children('div').map(function () {
                      visi = $(this).find("p").css('display') == 'none';
                      check_vis_mg.push(visi);
                      check_vis_thm.push(visi);
                    });
                    if (jQuery.inArray(true, check_vis_mg) == -1) {
                      mg.style.display = "block";
                      mgDiv.classList.add('show');
                    } else {
                      mg.style.display = "none";
                      mgDiv.classList.remove('show');
                    }
                  }
                });
                if (jQuery.inArray(true, check_vis_thm) == -1) {
                  this.style.display = "block";
                } else {
                  this.style.display = "none";
                }
              });
            });
          };
        }
      }
    });
  }
});

// Initial Get layers
$(document).ready(function () {
  $.ajax({
    type: "POST",
    url: api + 'api/data.php',
    data: { 'case': 'getLayers' },
    success: function (result) {
      var layer_lists = JSON.parse(result);
      if (layer_lists['status'] == 0) {
        display_error_message(layer_lists['message']);
      } else {
        fetch_layer(layer_lists);
      }
    }
  });
});

// Zoom Layer
function zoom(e) {
  extent = e.slice(-1)[0].extent;
  zoom_extent = Array.from(extent.split(','), Number);
  zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
  map.getView().fit(zoom_extent, { duration: 3000, padding: [500, 300, 500, 300] });
}

// Remove specific layer
function remove_Layers(lyr_id) {
  map.getLayers().forEach(function (layer) {
    if (layer != undefined) {
      if (layer.get('title') == lyr_id) {
        layer.setVisible(false);
        map.removeLayer(layer);
      }
    }
  });
}

// Remove all layers
function remove_allLayers() {
  map.getLayers().forEach(function (layer) {
    if (layer != undefined) {
      if (layer.get('name') == 'OSM' || layer.get('name') == 'Satellite' || layer.get('name') == 'markers' || layer.get('name') == 'udb_buffer' || layer.get('name') == 'measure' || layer.get('name') == 'Bhuvan Satellite' || layer.get('name') == 'current Location' || layer.get('name') == 'shapefiles_upload' || layer.get('title') == 'search marker' || layer.get('name') == 'Buffer Circle' || layer.get('name') == 'DEM' || layer.get('name') == 'Slope' || layer.get('name') == 'Aspect') {
      } else {
        layer.setVisible(false);
        map.removeLayer(layer);
      }
    }
  });
}

// Expand/Collapse theme
$('.thmexpandclass').on('click', function () {
  if ($('.thmexpandclass').css('background-color') == "rgb(28, 30, 196)") {
    $('#layer_list > div').map(function () {
      theme = this.getElementsByTagName('div')[1];
      var thm_button = $(this).find('button')[0];
      thm_button.classList.add('collapsed');
      theme.classList.remove('show');
      $('.thmexpandclass').text('Expand Theme');
      $('.thmexpandclass').css("background-color", "rgb(204, 36, 235, 0.64)");
    });
  } else {
    $('#layer_list > div').map(function () {
      theme = this.getElementsByTagName('div')[1];
      var thm_button = $(this).find('button')[0];
      thm_button.classList.remove('collapsed');
      theme.classList.add('show');
      $('.thmexpandclass').text('Collapse Theme');
      $('.thmexpandclass').css("background-color", "rgb(28, 30, 196)");
    });
  }
});

// Expand/Collapse Map Group
function exp_colfunction(theme) {
  if ($('#theme_' + theme).find('.mgexpandclass').css('background-color') == "rgb(23, 121, 136)") {
    $('#theme_' + theme).find('.mgexpandclass').text('Collapse Map Group');
    $('#theme_' + theme).find('.mgexpandclass').css("background-color", "rgb(47, 116, 75)");
    $("#theme_" + theme + "> div").map(function () {
      var mg_Div = $('#theme_' + theme).find('.showLayerInfos1');
      for (var mg of mg_Div) {
        var check_vis_mg = new Array();
        mgDiv = mg.getElementsByTagName('div')[1];
        var mg_button = mg.getElementsByTagName('div')[0];
        var button = mg_button.querySelectorAll("button")[0];
        mgDiv.classList.add('show');
        button.classList.remove('collapsed');
      }
    });
  } else {
    $('#theme_' + theme).find('.mgexpandclass').text('Expand Map Group');
    $('#theme_' + theme).find('.mgexpandclass').css("background-color", "rgb(23, 121, 136)");
    $("#theme_" + theme + "> div").map(function () {
      []
      var mg_Div = $('#theme_' + theme).find('.showLayerInfos1');
      for (var mg of mg_Div) {
        var check_vis_mg = new Array();
        mgDiv = mg.getElementsByTagName('div')[1];
        var mg_button = mg.getElementsByTagName('div')[0];
        var button = mg_button.querySelectorAll("button")[0];
        mgDiv.classList.remove('show');
        button.classList.add('collapsed');
      }
    });
  }
}

// Layer Display Visibility Toggle
$('body').on('click', 'i.visibility', function () {
  $(this).attr("class", "bi bi-eye-slash c-pointer Nvisibility");
  var lyr_id = $(this).closest('p').attr('id');
  var layer_name = $("#" + lyr_id).find("span").text();
  lyr_id = lyr_id.split(/_/);
  remove_Layers(lyr_id[0]);
});
$('body').on('click', 'i.Nvisibility', function () {
  $(this).removeClass("Nvisibility");
  $(this).attr("class", "bi bi-eye c-pointer visibility");
  var lyr_id = $(this).closest('p').attr('id');
  var layer_name = $("#" + lyr_id).find("span").text();
  lyr_id = lyr_id.split(/_/);
  fetch_layerServices(lyr_id[0], layer_name);
});

// show Feature Count
function getCount(layer_id, aoi_filter_text) {
  $.ajax({
    type: "POST",
    url: api + 'api/data.php',
    async: false,
    data: { 'lyr_id': layer_id, 'aoi_filter_text': aoi_filter_text, 'case': 'getFeatureCount' },
    success: function (result) {
      result = JSON.parse(result);
      if (result[0]['status'] == 0) {
        display_error_message(layer_lists['message']);
      } else {
        feature_count = result[1]['count'];
        $('#' + layer_id + '_Ele').find('label').after('<br><span class="displaycount"> Feature Count : ' + feature_count + '</span>');
      }
    }
  });
}
$("body").on("dblclick", 'i.showcount', function () {
});
$('body').on('click', 'i.showcount', function () {
  var lyr_id = $(this).closest('div').attr('id');
  lyr_id = lyr_id.split(/_/);
  layer_id = lyr_id[0];
  if ($('#' + layer_id + '_Div').find('i').hasClass("iShowClicked")) {
    $('#' + layer_id + '_Ele').find('br').remove();
    $('#' + layer_id + '_Ele').find('.displaycount').remove();
    $(this).attr("class", "bi bi-123 font-18 showcount");
  } else {
    $(this).attr("class", "bi bi-123 font-18 showcount iShowClicked");
    var aoi_filter_text;
    var aoi_dist = $("#aoi_district").val();
    var aoi_tlk = $("#aoi_taluk").val();
    var aoi_blk = $("#aoi_block").val();
    var aoi_pvill = $("#aoi_pvill").val();
    var aoi_rvill = $("#aoi_rvill").val();
    var dept_type = $("#depart_aoi").val();
    var dept_value = $("#depart_aoi_value").val();
    if (aoi_rvill != '-1' && aoi_tlk != '-1' && aoi_dist != -1) {
    } else if (aoi_tlk != '-1' && aoi_dist != -1) {
      aoi_filter_text = [1011, 'district_lgd_code', aoi_dist, 'sub_district_code', aoi_tlk];
    } else if (aoi_pvill != '-1' && aoi_blk != '-1' && aoi_dist != -1) {
    } else if (aoi_blk != '-1' && aoi_dist != -1) {
      aoi_filter_text = [1013, 'district_lgd_code', aoi_dist, 'block_lgd_code', aoi_blk];
    } else if (dept_type != '-1' && dept_value) {
    } else if (aoi_dist != -1) {
      aoi_filter_text = [1002, 'district_lgd_code', aoi_dist];
    } else {
    }
    getCount(layer_id, aoi_filter_text);
  }
});

// Selected Layer only display
function selected_layer_toggle() {
  if ($('#layer_vis_check').is(":checked")) {
    $('.all_toggle').css("color", "gray");
    $.ajax({
      type: "POST",
      url: api + 'api/data.php',
      data: { 'case': 'getLayers' },
      success: function (result) {
        var layer_lists = JSON.parse(result);
        if (layer_list['status'] == 0) {
          display_error_message(layer_lists['message']);
        } else {
          $('#layer_list > div').map(function () {
            var check_vis_thm = new Array();
            var theme = $(this).attr('id');
            $("#" + theme + "> div").map(function () {
              var mg_Div = $('#' + theme).find('.showLayerInfos1');
              for (var mg of mg_Div) {
                var check_vis_mg = new Array();
                mgDiv = mg.getElementsByTagName('div')[1],
                  layerstack = mgDiv.getElementsByTagName('div')[0];
                $(layerstack).children('div').map(function () {
                  visi = $(this).find("i").hasClass("visibility");
                  check_vis_mg.push(visi);
                  check_vis_thm.push(visi);
                });
                if (jQuery.inArray(true, check_vis_mg) == -1) {
                  mg.style.display = "none";
                } else {
                  mg.style.display = "block";
                }
              }
            });
            if (jQuery.inArray(true, check_vis_thm) == -1) {
              this.style.display = "none";
            } else {
              this.style.display = "block";
            }
          });
          var theme = new Array();
          var value = new Array();
          themes = [...new Set(layer_lists.map(x => x.theme))];
          if (!jQuery.isEmptyObject(layer_lists)) {
            layer_lists.forEach((lyr, index, array) => {
              var theme = lyr['theme'].replace(/[^A-Z0-9]/ig, "_");
              theme = theme.toLowerCase();
              for (i in themes) {
                if ($('#' + lyr['layer_id'] + '_Ele').find('i').hasClass("visibility")) {
                  if (lyr['theme'] == i) {
                    $('#' + theme).css("display", "block");
                    $('#' + lyr['layer_id']).css("display", "none");
                    $('#' + lyr['layer_id'] + '_Ele').css("display", "block");
                  }
                } else {
                  $('#' + lyr['layer_id']).css("display", "none");
                  $('#' + lyr['layer_id'] + '_Ele').css("display", "none");
                }
              }
            });
          };
        }
      }
    });
  } else {
    $('.all_toggle').css("color", "#bc70b5");
    $.ajax({
      type: "POST",
      url: api + 'api/data.php',
      data: { 'case': 'getLayers' },
      success: function (result) {
        var layer_lists = JSON.parse(result);
        if (layer_list['status'] == 0) {
          display_error_message(layer_lists['message']);
        } else {
          $('#layer_list > div').map(function () {
            this.style.display = "block";
            var theme = $(this).attr('id');
            $("#" + theme + "> div").map(function () {
              var mg_Div = $('#' + theme).find('.showLayerInfos1');
              for (var mg of mg_Div) {
                mg.style.display = "block";
              }
            });
          });
          if (!jQuery.isEmptyObject(layer_lists)) {
            layer_lists.forEach((lyr, index, array) => {
              var theme = lyr['theme'].replace(/[^A-Z0-9]/ig, "_");
              theme = theme.toLowerCase();
              $('#' + lyr['layer_id']).css("display", "none");
              $('#' + lyr['layer_id'] + '_Ele').css("display", "block");
            });
          };
        }
      }
    });
  }
}

$(document).on('change', '#layer_vis_check', function () {
  $('.layer_toggle').removeClass("icon-toggle-layer-view");
  selected_layer_toggle();
});

// Enable all layer visibility if AOI is not State
$("#allLayersToggle").click(function () {
  var allLayerId = Array();
  var allLayerName = Array();
  if ($(".bi-eye-slash")[0]) {
    $(this).attr("class", "bi bi-eye c-pointer align-icon txt-red");
    document.querySelectorAll('.bi-eye-slash').forEach(e => {
      e.classList.replace('bi-eye-slash', 'bi-eye');
      e.classList.replace('Nvisibility', 'visibility');
      var lyr_id = $(e).closest('p').attr('id');
      var layer_name = $("#" + lyr_id).find("span").text();
      lyr_id = lyr_id.split(/_/);
      allLayerName.push(layer_name);
      allLayerId.push(lyr_id[0]);
    });
    fetch_layerServices(allLayerId, allLayerName);
  } else {
    $(this).attr("class", "bi bi-eye-slash c-pointer align-icon txt-red");
    document.querySelectorAll('.bi-eye').forEach(e => {
      e.classList.replace('bi-eye', 'bi-eye-slash');
      e.classList.replace('visibility', 'Nvisibility');
      // remove_allLayers();
    });
  }
});

// Get fields for table attribute query
function getFeilds(layers) {
  $.ajax({
    type: "POST",
    url: api + 'api/data.php',
    data: { 'layers': layers, 'case': 'getFields' },
    success: function (result) {
      $("#attribute_fields").html(result);
    }
  });
}

var selected_pointLayer = Array();
var selectflag = 0;
$('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
  var target = $(e.target).attr("href");
  if (target == '#layer1' || target == '#layer2' || target == '#layer3') {
    $("#results_button").css("display", "none");
    $("#buffer_results_div").empty();
    $('#buffer_content').empty();
    // remove_allLayers();
    markers.getSource().removeFeature(marker);
    map.removeLayer(markers);
    if (target == '#layer3') {
      $("#buffer_point").empty();
      var pointList = '';
      $.ajax({
        type: "POST",
        url: api + 'api/data.php',
        data: { 'case': 'getAllLayers' },
        success: function (result) {
          result = JSON.parse(result);
          if (result[0]['status'] == 0) {
            display_error_message(result[0]['message']);
          } else {
            data = result.slice(1);
            data.forEach((value, index, array) => {
              pointList += `<a class="m-1 font-14 txt-red c-pointer" data-value=${value['layer_id']} onclick="selectvalue('${value['layer_id']}','${value['layer_name']}');">${value['layer_name']}</a><br>`;
            });
          }
          $("#buffer_point").html(pointList);
        }
      });
      $("#maxlayer").hide();
      selected_pointLayer = [];
      $('.deleteboxinfo').empty();
      $('#PointLayer').empty();
      $("select#attribute_fields").prop('selectedIndex', 0);
    } else if (target == '#layer1' || target == '#layer2') {
      $("#buffer_point").empty();
      var pointList = '';
      $.ajax({
        type: "POST",
        url: api + 'api/data.php',
        data: { 'case': 'getPointLayers' },
        success: function (result) {
          result = JSON.parse(result);
          if (result[0]['status'] == 0) {
            display_error_message(result[0]['message']);
          } else {
            data = result.slice(1);
            data.forEach((value, index, array) => {
              pointList += `<a class="m-1 font-14 txt-red c-pointer" data-value=${value['layer_id']} onclick="selectvalue('${value['layer_id']}','${value['layer_name']}');">${value['layer_name']}</a><br>`;
            });
          }
          $("#buffer_point").html(pointList);
        }
      });
      selected_pointLayer = [];
      $('.deleteboxinfo').empty();
      // selectflag = 0;
    }

  }
});

// Point Layer for Buffer
$(document).ready(function () {
  var pointList = '';
  $.ajax({
    type: "POST",
    url: api + 'api/data.php',
    data: { 'case': 'getPointLayers' },
    success: function (result) {
      result = JSON.parse(result);
      if (result[0]['status'] == 0) {
        display_error_message(result[0]['message']);
      } else {
        data = result.slice(1);
        data.forEach((value, index, array) => {
          pointList += `<a class="m-1 font-14 txt-red c-pointer" data-value=${value['layer_id']} onclick="selectvalue('${value['layer_id']}','${value['layer_name']}');">${value['layer_name']}</a><br>`;
        });
      }
      $("#buffer_point").html(pointList);
    }
  });
});

var value = '';
function selectvalue(point_layerId, point_layerName) {
  if ($('#layer3').hasClass('active')) {
    selected_pointLayer = [];
    $('.deleteboxinfo').empty();
    value = '<p class="mb-1 font18 text-white" id="' + point_layerId + '_pt"><span class="greentxt">' + point_layerName + '</span><i class="bi bi-trash3 float-end txt-red c-pointer" onClick="deleteptlayer(' + point_layerId + ')"></i></p>';
    selected_pointLayer.push(point_layerId);
    getFeilds(selected_pointLayer);
    $('.deleteboxinfo').append(value);
    $('#filter_text').val('');
    if (selected_pointLayer.length > 1) {
      display_error_message("Select Only 1 Layer!");
      selected_pointLayer = [];
      $('.deleteboxinfo').empty();
      $('#filter_text').val('');
    }
  } else {
    if (selectflag > 2) {
      $("#maxlayer").show();
    } else {
      value = `<p class="mb-1 font18 text-white" id="${point_layerId}_pt"><span class="greentxt">${point_layerName}</span><i class="bi bi-trash3 float-end txt-red c-pointer" onClick="deleteptlayer(${point_layerId})"></i></p>`;
      selected_pointLayer.push(point_layerId);
      selectflag += 1;
      $('.deleteboxinfo').append(value);
    }
  }
}

function deleteptlayer(layer_id) {
  $('.deleteboxinfo > p').map(function () {
    var lyr = $(this).attr('id');
    if (layer_id + '_pt' == lyr) {
      $(this).remove();
      selectflag -= 1;
      selected_pointLayer.pop(layer_id);
      if (selectflag > 2) {
        $("#maxlayer").show();
      } else {
        $("#maxlayer").hide();
      }
    }
  })
}

// Admin Layer Fetch for Buffer
$(document).ready(function () {
  $.ajax({
    type: "POST",
    url: api + 'api/data.php',
    data: { 'case': 'getPolygonLayers' },
    success: function (result) {
      $("#buffer_polygon").html(result);
    }
  });
});

// Marker for buffer
var markers = new ol.layer.Vector({
  title: 'markers',
  name: 'markers',
  source: new ol.source.Vector(),
  style: new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 0.5],
      src: './assets/img/marker.png',
    })
  })
});
var marker, lon, lat;

// Distance / Quantity Onchange
$(document).on('change', '#buffer_quantity', function () {
  $("#buffer_distance").val('');
  // remove_allLayers();
});

$(document).on('change', '#buffer_distance', function () {
  $("select#buffer_quantity").prop('selectedIndex', 0);
  // remove_allLayers();
});

function display_layer(layer_id, layer_name, service_name, filter) {
  var id = new ol.layer.Tile({
    title: layer_id,
    type: 'wms',
    source: new ol.source.TileWMS({
      url: geoServerURL,
      params: {
        'LAYERS': service_name,
        'CQL_FILTER': filter,
      },
      serverType: 'geoserver'
    }),
    name: layer_name,
    visible: true,
  });
  map.addLayer(id);
  // var layerLegend = new ol.legend.Legend({layer: id});
  // var resolution = map.getView().getResolution();
  // var legend_url = id.getSource().getLegendUrl(resolution);
  // const img = document.createElement("img");
  // img.src = legend_url+'&LEGEND_OPTIONS=forceLabels:on;fontColor:0x000000;fontAntiAliasing:true&transparent=true&fontSize=20';
  // $("#legendImg").append(img);
  // $("#legendImg").append('<br>');
  // layerLegend.addItem(new ol.legend.Image({src: legend_url}))
  // legend.addItem(layerLegend);
}


// Nearest 5/10 points
function nearest(lon, lat, quantity, layers) {
  $("#results_button").css("display", "none");
  // remove_allLayers(); 
  $.ajax({
    type: "POST",
    url: api + 'api/data.php',
    data: { 'quantity': quantity, 'layers': layers, 'lon': lon, 'lat': lat, 'case': 'getNearbyPointsQty' },
    success: function (result) {
      var result = JSON.parse(result);
      if (result['status'] == 0) {
        display_error_message(result['message']);
        map.removeLayer(markers);
      } else {
        result = result.slice(1);
        if (!jQuery.isEmptyObject(result)) {
          $("#results_button").css("display", "block");
          $("#buffer_results_div").empty();
          $('#buffer_content').empty();
          result.forEach((datas, index, array) => {
            var filter = Array();
            var distance = Array();
            var layer_id = datas[0]['layer_id'];
            var service_name = datas[0]['service_name'];
            var layer_name = datas[0]['layer_name'];
            datas.forEach((data, index, array) => {
              filter.push(data['object_id']);
              distance.push({ 'distance': data['distance'], 'object_id': data['object_id'] });
            });
            var cql = 'object_id IN (' + filter + ')';
            display_layer(layer_id, layer_name, service_name, cql);
            let liElement = document.createElement("li");
            liElement.className = ("nav-item");
            liElement.setAttribute('role', 'presentation');
            let aElement = document.createElement("a");
            if (index == 0) {
              aElement.className = ("nav-link mx-2 buffer_tab  active");
            } else {
              aElement.className = ("nav-link mx-2 buffer_tab");
            }
            aElement.setAttribute('id', layer_id + '_Buff');
            aElement.setAttribute('data-bs-toggle', 'tab');
            aElement.setAttribute('href', layer_id + '_Buff');
            aElement.setAttribute('role', 'tab');
            aElement.setAttribute('aria-controls', layer_id + '_Buff');
            aElement.setAttribute("aria-selected", "True");
            aElement.innerText = layer_name;
            let parent = document.querySelector('#buffer_results_div');
            liElement.appendChild(aElement);
            parent.appendChild(liElement);
            show_buffer_details(layer_id, filter, layer_id + '_Buff', index, distance);
          })
        }
      }
    }
  });
}

// Polygon Buffer
function polygonBuffer(buffer_type, buffer_lat, buffer_lon, layers, distance, unit, buffer_aoi) {
  $("#results_button").css("display", "none");
  // console.log(buffer_type+','+distance+','+unit+','+buffer_aoi);
  if (distance != null && unit != null && buffer_type != null) {
    var layer_id;
    // remove_allLayers();
    if (buffer_aoi != "null") {
      geojsonLayer.getSource().clear();
      geojsonLayer.setVisible(false);
      map.addLayer(geojsonLayer);
      if (buffer_type != 3) {
        var point = turf.point([Number(buffer_lon), Number(buffer_lat)]);
        var buffered = turf.buffer(point, distance, { units: 'meters' });
        buffered.id = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
        var buffer_circle = geojsonFormat.readFeature(buffered);
        buffer_circle.getGeometry().transform('EPSG:4326', 'EPSG:3857');
        geojsonSource.addFeature(buffer_circle);
        geojsonLayer.setVisible(true);
      }
      $.ajax({
        type: "POST",
        url: api + 'api/data.php',
        data: { 'buffer_aoi': buffer_aoi, 'buffer_lon': buffer_lon, 'buffer_lat': buffer_lat, 'case': 'getBufferFeature' },
        success: function (result) {
          var result = JSON.parse(result);
          if (result['status'] == 0) {
            display_error_message(result['message']);
          } else {
            result = result['extent'];
            $.ajax({
              type: "POST",
              url: api + 'api/data.php',
              data: { 'buffer_aoi': buffer_aoi, 'layers': layers, 'buffer_type': buffer_type, 'result': result, 'buffer_lon': buffer_lon, 'buffer_lat': buffer_lat, 'distance': distance, 'unit': unit, 'case': 'buffer' },
              success: function (result) {
                result = JSON.parse(result);
                if (result['status'] == 0) {
                  display_error_message(result['message']);
                  $("#buffer_distance").val('');
                  $("select#buffer_quantity").prop('selectedIndex', 0);
                  map.removeLayer(markers);
                } else {
                  result = result.slice(1);
                  if (!jQuery.isEmptyObject(result)) {
                    $("#results_button").css("display", "block");
                    $("#buffer_results_div").empty();
                    $('#buffer_content').empty();
                    result.forEach((datas, index, array) => {
                      var filter = Array();
                      layer_id = datas[0]['layer_id'];
                      var service_name = datas[0]['service_name'];
                      var layer_name = datas[0]['layer_name'];
                      datas.forEach((data, index, array) => {
                        filter.push(data['object_id']);
                      });
                      var cql = 'object_id IN (' + filter + ')';
                      display_layer(layer_id, layer_name, service_name, cql);
                      let liElement = document.createElement("li");
                      liElement.className = ("nav-item");
                      liElement.setAttribute('role', 'presentation');
                      let aElement = document.createElement("a");
                      if (index == 0) {
                        aElement.className = ("nav-link mx-2 buffer_tab  active");
                      } else {
                        aElement.className = ("nav-link mx-2 buffer_tab");
                      }
                      aElement.setAttribute('id', layer_id + '_Buff');
                      aElement.setAttribute('data-bs-toggle', 'tab');
                      aElement.setAttribute('href', layer_id + '_Buff');
                      aElement.setAttribute('role', 'tab');
                      aElement.setAttribute('aria-controls', layer_id + '_Buff');
                      aElement.setAttribute("aria-selected", "True");
                      aElement.innerText = layer_name;
                      let parent = document.querySelector('#buffer_results_div');
                      liElement.appendChild(aElement);
                      parent.appendChild(liElement);
                      show_buffer_details(layer_id, filter, layer_id + '_Buff', index);
                    });
                  } else {
                    display_error_message('No Data');
                  }
                }
              },
            });
          }
        }
      });
    } else {
      $("#results_button").css("display", "none");
      geojsonLayer.getSource().clear();
      geojsonLayer.setVisible(false);
      map.addLayer(geojsonLayer);
      var point = turf.point([Number(buffer_lon), Number(buffer_lat)]);
      var buffered = turf.buffer(point, distance, { units: 'meters' });
      // console.log(buffered['geometry']['coordinates']);
      buffered.id = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
      var buffer_circle = geojsonFormat.readFeature(buffered);
      buffer_circle.getGeometry().transform('EPSG:4326', 'EPSG:3857');
      geojsonSource.addFeature(buffer_circle);
      geojsonLayer.setVisible(true);
      $.ajax({
        type: "POST",
        url: api + 'api/data.php',
        data: { 'distance': distance, 'unit': unit, 'layers': layers, 'buffer_lon': buffer_lon, 'buffer_lat': buffer_lat, 'buffer_type': buffer_type, 'case': 'buffer' },
        success: function (result) {
          var result = JSON.parse(result);
          if (result['status'] == 0) {
            display_error_message(result['message']);
            $("#buffer_distance").val('');
            $("select#buffer_quantity").prop('selectedIndex', 0);
            map.removeLayer(markers);
          } else {
            result = result.slice(1);
            if (!jQuery.isEmptyObject(result)) {
              $("#results_button").css("display", "block");
              $("#buffer_results_div").empty();
              $('#buffer_content').empty();
              result.forEach((datas, index, array) => {
                var filter = Array();
                var layer_id = datas[0]['layer_id'];
                var service_name = datas[0]['service_name'];
                var layer_name = datas[0]['layer_name'];
                datas.forEach((data, index, array) => {
                  filter.push(data['object_id']);
                });
                var cql = 'object_id IN (' + filter + ')';
                display_layer(layer_id, layer_name, service_name, cql);
                let liElement = document.createElement("li");
                liElement.className = ("nav-item");
                liElement.setAttribute('role', 'presentation');
                let aElement = document.createElement("a");
                if (index == 0) {
                  aElement.className = ("nav-link mx-2 buffer_tab  active");
                } else {
                  aElement.className = ("nav-link mx-2 buffer_tab");
                }
                aElement.setAttribute('id', layer_id + '_Buff');
                aElement.setAttribute('data-bs-toggle', 'tab');
                aElement.setAttribute('href', layer_id + '_Buff');
                aElement.setAttribute('role', 'tab');
                aElement.setAttribute('aria-controls', layer_id + '_Buff');
                aElement.setAttribute("aria-selected", "True");
                aElement.innerText = layer_name;
                let parent = document.querySelector('#buffer_results_div');
                liElement.appendChild(aElement);
                parent.appendChild(liElement);
                show_buffer_details(layer_id, filter, layer_id + '_Buff', index);
              })
            } else {
              display_error_message('No Data');
            }
          }
        },
      });
    }
  } else if (buffer_aoi != null && buffer_type != null) {
    $("#results_button").css("display", "none");
    var layer_id;
    $.ajax({
      type: "POST",
      url: api + 'api/data.php',
      data: { 'buffer_aoi': buffer_aoi, 'buffer_lon': buffer_lon, 'buffer_lat': buffer_lat, 'case': 'getBufferFeature' },
      success: function (result) {
        buffer_result = JSON.parse(result);
        if (buffer_result['status'] == 0) {
          display_error_message(buffer_result['message']);
        } else {
          buffer_result = buffer_result['extent'];
          $.ajax({
            type: "POST",
            url: api + 'api/data.php',
            data: { 'buffer_aoi': buffer_aoi, 'layers': layers, 'buffer_type': buffer_type, 'result': buffer_result, 'case': 'buffer' },
            success: function (result) {
              result = JSON.parse(result);
              if (result['status'] == 0) {
                display_error_message(result['message']);
                $("#buffer_distance").val('');
                $("select#buffer_quantity").prop('selectedIndex', 0);
                map.removeLayer(markers);
              } else {
                result = result.slice(1);
                if (!jQuery.isEmptyObject(result)) {
                  $("#results_button").css("display", "block");
                  $("#buffer_results_div").empty();
                  $('#buffer_content').empty();
                  result.forEach((datas, index, array) => {
                    var filter = Array();
                    layer_id = datas[0]['layer_id'];
                    var service_name = datas[0]['service_name'];
                    var layer_name = datas[0]['layer_name'];
                    datas.forEach((data, index, array) => {
                      filter.push(data['object_id']);
                    });
                    var cql = 'object_id IN (' + filter + ')';
                    display_layer(layer_id, layer_name, service_name, cql);
                    let liElement = document.createElement("li");
                    liElement.className = ("nav-item");
                    liElement.setAttribute('role', 'presentation');
                    let aElement = document.createElement("a");
                    if (index == 0) {
                      aElement.className = ("nav-link mx-2 buffer_tab  active");
                    } else {
                      aElement.className = ("nav-link mx-2 buffer_tab");
                    }
                    aElement.setAttribute('id', layer_id + '_Buff');
                    aElement.setAttribute('data-bs-toggle', 'tab');
                    aElement.setAttribute('href', layer_id + '_Buff');
                    aElement.setAttribute('role', 'tab');
                    aElement.setAttribute('aria-controls', layer_id + '_Buff');
                    aElement.setAttribute("aria-selected", "True");
                    aElement.innerText = layer_name;
                    let parent = document.querySelector('#buffer_results_div');
                    liElement.appendChild(aElement);
                    parent.appendChild(liElement);
                    show_buffer_details(layer_id, filter, layer_id + '_Buff', index);
                  })
                } else {
                  display_error_message('No Data');
                }
              }
            },
          });
        }
      }
    });
  }
}

var udb_source = new ol.source.Vector();
var udb = new ol.layer.Vector({
  source: udb_source,
  name: 'udb_buffer',
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: '#ff0000',
      width: 4
    }),
  })
});
map.addLayer(udb);

let buffer_bound; // global so we can remove it later
function addBufferInteraction() {
  var value = 'Polygon';
  buffer_bound = new ol.interaction.Draw({
    source: udb_source,
    type: value,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(244, 4, 4, 0.8)',
        lineDash: [10, 10],
        width: 4
      }),
    })
  });
  map.addInteraction(buffer_bound);
  buffer_bound.on('drawend', function (event) {
    user_buffer(event);
  });
}

function user_buffer(event) {
  $("#results_button").css("display", "none");
  var geom = event.feature.getGeometry();
  geom.transform('EPSG:3857', 'EPSG:4326');
  var feature = new ol.Feature({
    geometry: geom
  });
  var obj = new ol.format.GeoJSON().writeFeatures([feature]);
  var geoObject = JSON.parse(obj).features[0].geometry;
  geoObject = JSON.stringify(geoObject);
  var layers = selected_pointLayer;
  udb.setVisible(true);
  $.ajax({
    type: "POST",
    url: api + 'api/data.php',
    data: { 'geom': geoObject, 'layers': layers, 'case': 'buffer' },
    success: function (result) {
      result = JSON.parse(result);
      if (result['status'] == 0) {
        display_error_message(result['message']);
      } else {
        result = result.slice(1);
        if (!jQuery.isEmptyObject(result)) {
          $("#results_button").css("display", "block");
          $("#buffer_results_div").empty();
          $('#buffer_content').empty();
          result.forEach((datas, index, array) => {
            // console.log(result);
            var filter = Array();
            var layer_id = datas[0]['layer_id'];
            var service_name = datas[0]['service_name'];
            var layer_name = datas[0]['layer_name'];
            datas.forEach((data, index, array) => {
              filter.push(data['object_id']);
            });
            var cql = 'object_id IN (' + filter + ')';
            display_layer(layer_id, layer_name, service_name, cql);
            let liElement = document.createElement("li");
            liElement.className = ("nav-item");
            liElement.setAttribute('role', 'presentation');
            let aElement = document.createElement("a");
            if (index == 0) {
              aElement.className = ("nav-link mx-2 buffer_tab  active");
            } else {
              aElement.className = ("nav-link mx-2 buffer_tab");
            }
            aElement.setAttribute('id', layer_id + '_Buff');
            aElement.setAttribute('data-bs-toggle', 'tab');
            aElement.setAttribute('href', layer_id + '_Buff');
            aElement.setAttribute('role', 'tab');
            aElement.setAttribute('aria-controls', layer_id + '_Buff');
            aElement.setAttribute("aria-selected", "True");
            aElement.innerText = layer_name;
            let parent = document.querySelector('#buffer_results_div');
            liElement.appendChild(aElement);
            parent.appendChild(liElement);
            show_buffer_details(layer_id, filter, layer_id + '_Buff', index);
          })
        } else {
          display_error_message('No Data');
        }
      }
    },
  });
}

function draw_boundary() {
  // map.removeInteraction(buffer_bound); 
  // udb.getSource().clear();
  addBufferInteraction();
  udb.setVisible(true);
}

function placeMarker(value) {
  var layers = selected_pointLayer;
  if (layers.length > 0) {
    // remove_allLayers();
    markers.getSource().removeFeature(marker);
    map.removeLayer(markers);
    var type = $('input[name="buffer"]:checked').val();
    var i = 1;
    map.on('click', function (evt) {
      // remove_allLayers();
      // markers.getSource().removeFeature(marker);
      // map.removeLayer(markers);
      if (i == 1) {
        var coords = ol.proj.toLonLat(evt.coordinate);
        lat = coords[1];
        lon = coords[0];
        if (!(lat < 13.5628425807573 && lat > 8.07761366959721)) {
          display_error_message("select within TamilNadu Boundary!");
          return false;
          map.removeLayer(markers);
          // remove_allLayers();
        }
        if (!(lon < 80.3488179850324 && lon > 76.2329830656992)) {
          display_error_message("select within TamilNadu Boundary!");
          return false;
          map.removeLayer(markers);
          // remove_allLayers();
        }
        map.addLayer(markers);
        marker = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([lon, lat])));
        markers.getSource().addFeature(marker);
        i = 0;
        if (value == 1) {
          var quantity = $("#buffer_quantity").val();
          if (layers.length > 0) {
            if (quantity) {
              nearest(lon, lat, quantity, layers);
            } else {
              display_error_message("Select Number Of features for Data!");
              map.removeLayer(markers);
            }
          } else {
            display_error_message("Select Atleast 1 Layer for Buffer!");
            return false;
            map.removeLayer(markers);
            // remove_allLayers();
          }
        } else if (value == 2) {
          var distance = $("#buffer_distance").val();
          var unit = $("#buffer_unit").val();
          var type = $('input[name="buffer"]:checked').val();
          var buffer_aoi = $("#buffer_polygon").val();
          if (layers.length > 0) {
            if (type == 4) {
              map.removeLayer(markers);
              map.removeInteraction(buffer_bound);
              udb.getSource().clear();
              draw_boundary();
            } else if (distance && unit && type == 1) {
              polygonBuffer(type, lat, lon, layers, distance, unit, buffer_aoi);
            } else if (distance && unit && type) {
              if (buffer_aoi != 'null') {
                polygonBuffer(type, lat, lon, layers, distance, unit, buffer_aoi);
              } else {
                display_error_message("Select Boundary for Buffer!");
                return false;
                map.removeLayer(markers);
                // remove_allLayers();
              }
            } else if (buffer_aoi && type == 1) {
              polygonBuffer(type, lat, lon, layers, null, null, buffer_aoi);
            } else if (buffer_aoi && type) {
              if (distance && unit) {
                polygonBuffer(type, lat, lon, layers, distance, unit, buffer_aoi);
              } else {
                display_error_message("Select Distance for Buffer!");
                return false;
                map.removeLayer(markers);
                // remove_allLayers();
              }
            } else if (!buffer_aoi) {
              display_error_message("Select Boundary for Buffer!");
              return false;
              map.removeLayer(markers);
              // remove_allLayers();
            }
          } else {
            display_error_message("Select Atleast One Layer for Buffer!");
            map.removeLayer(markers);
            return false;
            // remove_allLayers();
          }
        }
      }
    });
  } else {
    display_error_message('Select Atleast 1 Point Layer for Analysis');
  }
}

$('.clear_nearest_filter').on('click', function () {
  $('#results_button').hide();
  $('#buffer_results_div').empty();
  var allSpanTags = $('.deleteboxinfo').find('span');
  allSpanTags.each(function (index, element) {
    layer_name = $(element).text();
    map.getLayers().forEach(function (layer) {
      if (layer != undefined) {
        if (layer.get('name') == 'OSM' || layer.get('name') == 'Satellite' || layer.get('name') == 'markers' || layer.get('name') == 'udb_buffer' || layer.get('name') == 'measure' || layer.get('name') == 'Bhuvan Satellite' || layer.get('name') == 'current Location' || layer.get('name') == 'shapefiles_upload' || layer.get('title') == 'search marker' || layer.get('name') == 'Buffer Circle') {
        } else {
          if (layer.get('name') == layer_name) {
            layer.setVisible(false);
            map.removeLayer(layer);
          }
        }
      }
    });
  });
  map.removeLayer(markers);
});

$(document).on('change', '#buffer_polygon', function () {
  var value = 2;
  placeMarker(value);
});

// Buffer Toggle
$(document).on('change', 'input[name="buffer"]', function () {
  // remove_allLayers();
  var type = $('input[name="buffer"]:checked').val();
  if (type == 4) {
    $("#buffer_distance").val('');
    $("#buffer_polygon").prop('selectedIndex', 0);
  }
  // if(type== 3){
  //   $.ajax({
  //     type:"POST",
  //     url:api+'api/data.php',
  //     data:{'buffer_polygon':buffer_polygon,'case':'getBuffer2'},
  //     success:function(result){
  //       $("#buffer_2").show();
  //       $("#buffer2").html(result);
  //     }
  //   });
  // }else if (type == 4){
  //   $("#buffer_2").hide();
  //   $(".user_buffer").show();
  // }else{
  //   $("#buffer_2").hide();
  //   $(".user_buffer").hide();
  // }
});

// Attribute Filter
$(document).on('change', '#attribute_fields', function () {
  var field = $(this).val();
  var fieldName = field[0].split('__');
  var fieldName = fieldName[0];
  $.ajax({
    type: "POST",
    url: api + 'api/data.php',
    data: { 'field': field, 'case': 'getValues' },
    success: function (result) {
      $("#attributes_values").html(result);
      $("#filter_text").val($("#filter_text").val() + ' ' + fieldName);
    }
  });
});

$(document).on('change', '#attributes_values', function () {
  var value = $(this).val();
  $("#filter_text").val($("#filter_text").val() + ' ' + "'" + value + "'");
});

function operators(op) {
  var ari = ["=", "<", " >", " %", " <=", " >=", " !=", ",", "(", ")"];
  var log = ["and ", "or ", "not ", "in ", "not in "];
  if ($("#filter_text").val().includes("and")) {
    if (ari.includes($("#filter_text").val().split('and')[2])) {
      display_error_message("Select Another Field For Comparison!");
    } else if (op) {
      var field = $('#attribute_fields').val();
      var filter = $("#filter_text").val().split('and')[0];
      var field1 = $("#filter_text").val().split('and')[1];
      $.ajax({
        type: "POST",
        url: api + 'api/data.php',
        data: { 'field': field, 'field1': field1, 'filter': filter, 'case': 'getValues' },
        success: function (result) {
          $("#attributes_values").html(result);
        }
      });
      $("#filter_text").val($("#filter_text").val() + ' ' + op);
    }
  } else {
    $("#filter_text").val($("#filter_text").val() + ' ' + op);
  }
}

$('#query_attribute').click(function () {
  aoi = $('input[name="aoi"]:checked').val();
  $("#results_button").css("display", "none");
  // remove_allLayers();
  var filter = $("#filter_text").val();
  var layers = selected_pointLayer;
  $.ajax({
    type: "POST",
    url: api + 'api/data.php',
    processData: false,
    // contentType: false,
    data: 'filter=' + filter + '&layers=' + layers + '&aoi=' + aoi + '&case=attributeQuery',
    // data:{'filter':filter,'layers':layers,'aoi':aoi,'case':'attributeQuery'},
    success: function (result) {
      var data = JSON.parse(result);
      if (data[0]['status'] == 0) {
        display_error_message(data[0]['message']);
      } else {
        table_data = data.slice(3);
        var filter1 = Array();
        if (table_data.length > 0) {
          $("#results_button").css("display", "block");
          $("#buffer_results_div").empty();
          $('#buffer_content').empty();
          table_data.forEach((data, index, array) => {
            $("#buffer_results_div").empty();
            $('#buffer_content').empty();
            filter1.push(data['object_id']);
            let liElement = document.createElement("li");
            liElement.className = ("nav-item");
            liElement.setAttribute('role', 'presentation');
            let aElement = document.createElement("a");
            if (index == 0) {
              aElement.className = ("nav-link mx-2 buffer_tab  active");
            } else {
              aElement.className = ("nav-link mx-2 buffer_tab");
            }
            aElement.setAttribute('id', layers + '_Buff');
            aElement.setAttribute('data-bs-toggle', 'tab');
            aElement.setAttribute('href', layers + '_Buff');
            aElement.setAttribute('role', 'tab');
            aElement.setAttribute('aria-controls', layers + '_Buff');
            aElement.setAttribute("aria-selected", "True");
            aElement.innerText = data[1];
            let parent = document.querySelector('#buffer_results_div');
            liElement.appendChild(aElement);
            parent.appendChild(liElement);
          });
          show_buffer_details(layers, filter1, layers + '_Buff', 0);
          id = new ol.layer.Tile({
            title: layers,
            type: 'wms',
            source: new ol.source.TileWMS({
              // TODO: Change URL
              url: geoServerURL,
              params: {
                'LAYERS': data[2],
                'CQL_FILTER': filter,
                // 'LAYERS': data[1]+','+data[0],
                // 'CQL_FILTER':filter+';INCLUDE',
              },
              serverType: 'geoserver'
            }),
            name: data[1],
            visible: true,
          });
          map.addLayer(id);
        } else {
          display_error_message('No Data Found For this Selection');
          $("select#attribute_fields").prop('selectedIndex', 0);
          $("select#attributes_values").prop('selectedIndex', 0);
          $("#filter_text").empty();
        }
      }
    }
  });
});

$('#reset_attribute').click(function () {
  $("select#attribute_fields").prop('selectedIndex', 0);
  $("select#attributes_values").prop('selectedIndex', 0);
  $("#filter_text").val('');
  var allSpanTags = $('.deleteboxinfo').find('span');
  allSpanTags.each(function (index, element) {
    layer_name = $(element).text();
    map.getLayers().forEach(function (layer) {
      if (layer != undefined) {
        if (layer.get('name') == 'OSM' || layer.get('name') == 'Satellite' || layer.get('name') == 'markers' || layer.get('name') == 'udb_buffer' || layer.get('name') == 'measure' || layer.get('name') == 'Bhuvan Satellite' || layer.get('name') == 'current Location' || layer.get('name') == 'shapefiles_upload' || layer.get('title') == 'search marker' || layer.get('name') == 'Buffer Circle' || layer.get('name') == 'DEM' || layer.get('name') == 'Slope' || layer.get('name') == 'Aspect') {
        } else {
          if (layer.get('name') == layer_name) {
            layer.setVisible(false);
            map.removeLayer(layer);
          }
        }
      }
    });
  });
});

// Measure Layer
var measurementSource = new ol.source.Vector();
var measurementVectorLayer = new ol.layer.Vector({
  title: 'measure',
  name: 'measure',
  source: measurementSource,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(244, 4, 4, 0.8)'
    }),
    stroke: new ol.style.Stroke({
      color: 'rgba(244, 4, 4, 0.8)',
      lineDash: [10, 10],
      width: 4
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: '#ffcc33'
      })
    })
  })
});
map.addLayer(measurementVectorLayer);

// Measure Tool
var measuretype;
var sketch;
var draw;
var helpTooltipElement;
var helpTooltip;
var measureTooltipElement;
var measureTooltip;
var continuePolygonMsg = 'Click to continue drawing the polygon';
var continueLineMsg = 'Click to continue drawing the line';
// map.getViewport().addEventListener('mouseout', function() {
//    helpTooltipElement.classList.add('hidden');
// });

var pointerMoveHandler = function (evt) {
  if (evt.dragging) {
    return;
  }
  var helpMsg = 'Click to start drawing';
  if (sketch) {
    var geom = (sketch.getGeometry());
    if (geom instanceof ol.geom.Polygon) {
      helpMsg = continuePolygonMsg;
    } else if (geom instanceof ol.geom.LineString) {
      helpMsg = continueLineMsg;
    }
  }
  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);
  helpTooltipElement.classList.remove('hidden');
};
var formatLength = function (line) {
  var length = ol.sphere.getLength(line, { projection: 'EPSG:3857' });
  // var length = getLength(line);
  // var length = line.getLength({projection:'EPSG:4326'});
  var output;
  if (length > 1000) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};
var formatArea = function (polygon) {
  // var area = getArea(polygon);
  var area = ol.sphere.getArea(polygon, { projection: 'EPSG:3857' });
  // var area = polygon.getArea();
  //alert(area);
  var output;
  if (area > 10000) {
    output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
  } else {
    output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
  }
  return output;
};

function addInteraction() {
  var type = measuretype;
  draw = new ol.interaction.Draw({
    source: measurementSource,
    type: type,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(244, 4, 4, 0.36)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(244, 4, 4, 0.8)',
        lineDash: [10, 10],
        width: 4
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.7)'
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.5)'
        })
      })
    })
  });
  map.addInteraction(draw);
  createMeasureTooltip();
  createHelpTooltip();
  var listener;
  draw.on('drawstart', function (evt) {
    // set sketch
    // measurementVectorLayer.getSource().clear();
    sketch = evt.feature;
    var tooltipCoord = evt.coordinate;
    listener = sketch.getGeometry().on('change', function (evt) {
      var geom = evt.target;
      var output;
      if (geom instanceof ol.geom.Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof ol.geom.LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  }, this);
  draw.on('drawend', function () {
    measureTooltipElement.className = 'mtooltip tooltip-static';
    measureTooltip.setOffset([0, -7]);
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    ol.Observable.unByKey(listener);
  }, this);
}
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'mtooltip hidden';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',
  });
  map.addOverlay(helpTooltip);
}

function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'mtooltip tooltip-measure';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
  });
  map.addOverlay(measureTooltip);
}

function removeMeasureTooltip() {
  map.removeOverlay(measureTooltip);
  map.removeOverlay(helpTooltip);
  if (measureTooltipElement) {
    var elem = document.getElementsByClassName("mtooltip tooltip-static");
    for (var i = elem.length - 1; i >= 0; i--) {
      elem[i].remove();
    }
  }
}

function changeMeasurement(e) {
  measuretype = e;
  if (measuretype == 'None') {
    measurementVectorLayer.getSource().clear();
    removeMeasureTooltip();
    map.removeInteraction(draw);
  } else {
    map.removeInteraction(draw);
    addInteraction();
    map.on('pointermove', pointerMoveHandler);
  }
}

// Buffer Div
$('#results_button').click(function (e) {
  e.preventDefault();
  var aoi = $("#aoi").val();
  var last;
  var dialogOptions = {
    "title": "Buffer Results",
    "width": 800,
    "height": 460,
    "autoOpen": true,
    "resizable": $("#is-resizable").is(":checked"),
    "draggable": $("#is-draggable").is(":checked"),
    "close": function () {
      if (last[0] != e) {
        $(e).remove();
      }
      $("#bufferTableDiv").empty();
    }
  };
  // if ( $("#button-cancel").is(":checked") ) {
  //    dialogOptions.buttons = { "Close" : function(){ $(e).dialog("close"); } };
  // }
  // dialog-extend options
  var dialogExtendOptions = {
    "closabl": $("#button-close").is(":checked"),
    "maximizable": $("#button-maximize").is(":checked"),
    "minimizable": $("#button-minimize").is(":checked"),
    "collapsable": $("#button-collapse").is(":checked"),
  };
  // open dialog
  last = $("#bufferDialogBox").dialog(dialogOptions).dialogExtend(dialogExtendOptions);
});

// Fetch Buffer data
function show_buffer_details(layer_id, filter, div_id, index, distance) {
  if (layer_id) {
    let divElement = document.createElement("div");
    if (index == 0) {
      divElement.className = ("tab-pane fade buffer_table_div_toogle active show");
    } else {
      divElement.className = ("tab-pane fade buffer_table_div_toogle");
    }
    divElement.setAttribute('id', layer_id + '_BuffCon');
    divElement.setAttribute('role', 'tabpanel');
    divElement.setAttribute('aria-labelledby', 'div_id');
    let parent = document.querySelector('#buffer_content');
    parent.appendChild(divElement);
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'layer_id': layer_id, 'filter': filter, 'distance': distance, 'case': 'bufferValues' },
      success: function (result) {
        var table_data = JSON.parse(result);
        if (table_data['status'] == 0) {
          display_error_message(table_data['message']);
        } else {
          layer_name = table_data[0];
          var table_name = table_data[1];
          table_data = table_data.slice(2);
          var keys = Object.keys(table_data[0]);
          var labels = [];
          jQuery.each(keys, function (index, item) {
            item = item.toUpperCase();
            labels.push(item);
          });
          $(layer_id + 'table').empty();
          buildTable(labels, table_data, document.getElementById(layer_id + '_BuffCon'), layer_id + 'table');
          $('#' + layer_id + 'table').DataTable({
            paging: true,
            searching: true,
            dom: 'lBfrtip',
            buttons: [
              'copyHtml5',
              {
                extend: 'excelHtml5',
                autoFilter: true,
                sheetName: layer_name,
              },
              'csvHtml5',
              {
                extend: 'pdfHtml5',
                orientation: 'landscape',
                pageSize: 'A3',
              },
            ]
          });
          $('.dataTable').on('click', 'tbody tr', function () {
            var row_data = $(this).find("td").eq(0).text();
            $.ajax({
              type: 'POST',
              url: api + 'api/data.php',
              data: { 'id': row_data, 'layer_id': layer_id, 'case': 'getExtent' },
              success: function (result) {
                var layerDatas = JSON.parse(result);
                if (layerDatas['status'] == 0) {
                  display_error_message(layerDatas['message']);
                } else {
                  zoom_extent = Array.from(layerDatas[0].extent.split(','), Number);
                  zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
                  map.getView().fit(zoom_extent, { duration: 3000, padding: [500, 300, 500, 300] });
                }
              },
            });
          });
        }
      },
    });
  }
}

// Buffer Result Tab Toggle
$('body').on('click', 'a.buffer_tab', function () {
  $('a.buffer_tab').removeClass("active");
  $(this).addClass("active");
  var lyr_id = $(this).closest('a').attr('id');
  lyr = lyr_id.split('_');
  $(".buffer_table_div_toogle").removeClass("active show");
  $("#" + lyr[0] + '_BuffCon').addClass("active show");
});

// Transparency
function update(opacityValue, lyr_id) {
  const opacity = opacityValue / 100;
  map.getLayers().forEach(function (layer) {
    if (layer != undefined) {
      if (layer.get('title') == lyr_id) {
        layer.setOpacity(opacity);
      }
    }
  });
}

$('body').on('change', '.transparency', function () {
  var lyr_id = $(this).closest('div').attr('id');
  lyr_id = lyr_id.split(/_/);
  lyr_id = lyr_id[0];
  var opacityValue = $("#" + lyr_id + "_Div").find("input").val();
  if ($("#" + lyr_id + "_Ele").find("i").hasClass("visibility")) {
    update(opacityValue, lyr_id);
  } else {
    var layerDatas = Array();
    layerDatas['message'] = 'Please Enable Layer Visibility';
    display_error_message(layerDatas['message']);
  }
});

// Popup 
var container = document.getElementById('popup');
var overlay_popup = new ol.Overlay({
  name: "popup",
  element: container,
  positioning: 'bottom-center',
  offset: [0, 0],
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});
map.addOverlay(overlay_popup);

var obj_id;
function showExtraDetails(layer_id, obj_id, layer_name) {
  $("#mis_data_div").empty();
  $("#mis_content").empty();
  $.ajax({
    type: 'POST',
    url: api + 'api/data.php',
    data: { 'layer_id': layer_id, 'obj_id': obj_id, 'case': 'getMisInfo' },
    success: function (result) {
      result = JSON.parse(result);
      if (result[0]['status'] == 0) {
        $('.extraInfoModal').hide();
        display_error_message(result['message']);
      } else {
        $('.extraInfoModal').modal('toggle');
        result = result.slice(1);
        var mis_tab = '';
        var mis_info_div = '';
        $.each(result, function (key, value) {
          value = value[0];
          var no = 1;
          mis_tab += `<li class="nav-item" role="presentation"><a class="nav-link mx-2 misinfo_tab  active" id="'${layer_id}_${obj_id}_ui'" data-bs-toggle="tab" href="'${layer_id}_${obj_id}'" role="tab" aria-controls="'${layer_id}_${obj_id}'" aria-selected="True">Tab${no}</a></li></ul>`;
          if (key == 0) {
            mis_info_div += `<div class="tab-pane fade active show" id="'${layer_id}_${obj_id}'" role="tabpanel"><table class="table table-dark table-striped popup_mis_table"><thead><tr><th colspan = 2 class="text-center">${layer_name.toUpperCase()}</th></tr></thead>`;
            $.each(value, function (key, data) {
              mis_info_div += `<tr style='background-color:#ffffff;'><td>${key}</td><td>${data}</td></tr>`;
            });
          } else {
            mis_info_div += `<div class="tab-pane fade" id="'${layer_id}_${obj_id}'" role="tabpanel">`;
            $.each(value, function (key, data) {
              mis_info_div += `<tr style='background-color:#ffffff;'><td>${key}</td><td>${data}</td></tr>`;
            });
          }
          $("#mis_content").append(mis_info_div);
          $("#mis_data_div").append(mis_tab);
        });
      }
    }
  });
}

// map popup
function popup_content(lyr, latitude, longitude, coords) {
  var layer_id = lyr;
  // fetch('assets/js/layers.json', {
  //   method: 'GET',
  //   headers: {
  //       'Accept': 'application/json',
  //   },
  // })
  // .then(response => response.json())
  // .then(response => {
  //   for(i in response){
  //     if(response[i].layer_code == layer_id){
  //       console.log('test');
  //     }else{
  //       console.log("not test");
  //     }
  //   }
  // });
  $.ajax({
    type: 'POST',
    headers: { 'X-APP-NAME': 'tngis_generic_viewer' },
    // url:api+'api/attributes.php',
    url: generic_api + '/v1/attributes',
    data: { 'layer_id': layer_id, 'latitude': latitude, 'longitude': longitude, 'case': 'gis_attributes' },
    success: function (result) {
      result = result[0];
      if (result['status'] == 0) {
        display_error_message(result['message']);
      } else {
        var popupvalues = {};
        var popupContent = '';
        var key = Object.keys(result);
        layer_name = key[0];
        $('#popup').show();
        popupContent += `<table class="table table-dark table-striped w-auto popup_table"><thead><tr><th colspan = 2 class="text-center">${layer_name.toUpperCase()}<button type="button" class="btn-close popupclosebtn" aria-label="Close" onclick="$('#popup').hide();"></button></th></tr></thead>`
        for (var [key, value] of Object.entries(result[layer_name])) {
          if (key == 'object_id') {
            obj_id = value;
          }
          if (typeof value == 'string') {
            value = value.replace(/\b[a-z]/g, function (value) {
              return value.toUpperCase();
            });
          }
          key = key.replace(/_/g, ' ');
          key = key.replace(/\b[a-z]/g, function (key) {
            return key.toUpperCase();
          });
          popupContent += `<tr style='background-color:#ffffff;'><td>${key}</td><td>${value}</td></tr>`;
        }
        // console.log(layer_name);
        popupContent += `</table><div id ="more_details" style="float:right;"><button type="button" class="btn" onClick="showExtraDetails(${layer_id},${obj_id},'${layer_name}');"  style="text-decoration: underline; color: white;">More Info</button></div>`;
        overlay_popup.setPosition(coords);
        document.getElementById('popup-content').innerHTML = popupContent;
        // overlay_popup.getElement().style.display = 'block';
      }
    },
  });
}
var popup_flag = 0;
$('body').on('click', 'i.map_popup', function () {
  var element = $(this);
  if (popup_flag == 0) {
    element.addClass("iClicked");
    var lyr_id = $(this).closest('div').attr('id');
    lyr = lyr_id.split('_');
    lyr = lyr[0];
    if ($("#" + lyr + "_Ele").find("i").hasClass("Nvisibility")) {
      var layerDatas = Array();
      layerDatas['message'] = 'Please Enable Layer Visibility';
      display_error_message(layerDatas['message']);
      element.removeClass("iClicked");
      popup_flag = 1;
    } else {
      $('#map').css('cursor', 'pointer');
      popup_flag = 1;
      key = map.on('click', async function (evt) {
        map.getLayers().forEach(function (layer) {
          if (layer != undefined) {
            if (layer.get('name') == 'OSM' || layer.get('name') == 'Satellite' || layer.get('name') == 'markers' || layer.get('name') == 'udb_buffer' || layer.get('name') == 'measure' || layer.get('name') == 'Bhuvan Satellite' || layer.get('name') == 'current Location' || layer.get('name') == 'shapefiles_upload' || layer.get('title') == 'search marker' || layer.get('name') == 'Buffer Circle') {
            } else {
              if (lyr == layer.get('title')) {
                var coordinates = evt.coordinate;
                var coords = ol.proj.toLonLat(coordinates);
                latitude = coords[1];
                longitude = coords[0];
                layer_id = lyr;
                var layer_url = layer.get('source');
                popup_content(layer_id, latitude, longitude, coordinates);
              }
            }
          }
        });
      });
    }
  } else {
    popup_flag = 0;
    element.removeClass("iClicked");
    $('#map').css('cursor', 'context-menu');
    ol.Observable.unByKey(key);
  }
});

// Distance / Quantity Onchange
$(document).on('change', '#buffer_quantity', function () {
  $("#buffer_distance").val('');
  // remove_allLayers();
});

// Legend
map.on('moveend', function (e) {
  $("#legendImg").empty();
  map.getLayers().forEach(function (layer) {
    if (layer != undefined|| layer.get('name') == undefined) {
      if (layer.get('name') == 'OSM' || layer.get('name') == 'Satellite' || layer.get('name') == 'markers' || layer.get('name') == 'udb_buffer' || layer.get('name') == 'measure' || layer.get('name') == 'Bhuvan Satellite' || layer.get('name') == 'current Location' || layer.get('name') == 'shapefiles_upload' || layer.get('name') == 'ExcelFile' || layer.get('name') == 'KmlFile' || layer.get('name') == 'Wfsurl' || layer.get('name') == 'ShapeFile' || layer.get('name') == 'Wmsurl' || layer.get('title') == 'search marker' || layer.get('name') == 'Buffer Circle') {
      } else {
        if (layer.getVisible() == true) {
          var layerLegend = new ol.legend.Legend({ layer: layer });
          var resolution = map.getView().getResolution();
          var legend_url = layer.getSource().getLegendUrl(resolution);
          const img = document.createElement("img");
          img.src = legend_url + '&LEGEND_OPTIONS=forceLabels:on;fontColor:0x000000;fontAntiAliasing:true&transparent=true&fontSize=20';
          $("#legendImg").append(img);
          $("#legendImg").append('<br>');
        }
      }
    }
  });
});

function fetch_metadata(lyr_id) {
  $.ajax({
    type: 'POST',
    url: api + 'api/data.php',
    data: { 'lyr_id': lyr_id, 'case': 'getMetaData' },
    success: function (result) {
      result = JSON.parse(result);
      console.log(result);
      if (result[0]['status'] == 0) {
        display_error_message(result[0]['message']);
      } else {
        $('#meta_data_layer_name').val(result[1]['data'][0]['layer_name']);
        $('#meta_data_dept_name').val(result[1]['data'][0]['department']);
        $('#meta_data_sub_dept_name').val(result[1]['data'][0]['sub_department']);
        $('#meta_data_source').val(result[1]['data'][0]['source_department']);
        $('#meta_data_added_date').val(result[1]['data'][0]['updated_date']);
        $('#meta_data_updated_date').val(result[1]['data'][0]['updated_date']);
        $('#meta_data_desc').val();
      }
    },
  });
}

metadataflag = true;
$('body').on('click', 'i.meta_data_fetch', function () {
  var lyr_id = $(this).closest('div').attr('id');
  lyr_id = lyr_id.split(/_/);
  lyr_id = lyr_id[0];
  if (metadataflag == true) {
    $('#layer_list').find('.imetaClicked').removeClass('imetaClicked');
    $(this).attr("class", "bi bi-check2-circle font-18 meta_data_fetch imetaClicked");
    fetch_metadata(lyr_id);
    metadataflag = false;
  } else {
    $('#layer_list').find('.imetaClicked').removeClass('imetaClicked');
    // $(this).attr("class", "bi bi-check2-circle font-18 meta_data_fetch imetaClicked");
    metadataflag = true;
    // let openCanvas = document.querySelector('[data-bs-target=".viewdetails"]');
    // openCanvas.click();
    // fetch_metadata(lyr_id);
  }
});

var url = baseURL.split('/');
var folder = url['3'];
if (folder == 'health') {

  $(document).ready(function () {
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'case': 'getChcDist' },
      success: function (result) {
        $("#dist_bhc").html(result);
      },
    });
  });

  $(document).ready(function () {
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'case': 'getChcHospitals' },
      success: function (result) {
        $("#bhc").html(result);
      },
    });
  });

  $(document).ready(function () {
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'case': 'getChcBlock' },
      success: function (result) {
        $("#block_bhc").html(result);
      },
    });
  });

  $("#dist_bhc").on('change', function () {
    var chc_dist = $("#dist_bhc").val();
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'chc_dist': chc_dist, 'case': 'getExtent' },
      success: function (result) {
        var layerDatas = JSON.parse(result);
        if (layerDatas['status'] == 0) {
          display_error_message(layerDatas['message']);
        } else {
          zoom_extent = Array.from(layerDatas[0].extent.split(','), Number);
          zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
          map.getView().fit(zoom_extent, { duration: 3000, padding: [500, 300, 500, 300] });
        }
      },
    });
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'chc_dist': chc_dist, 'case': 'getChcBlock' },
      success: function (result) {
        $("#block_bhc").html(result);
      },
    });
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'chc_dist': chc_dist, 'case': 'getChcHospitals' },
      success: function (result) {
        $("#bhc").html(result);
      },
    });
  });

  $("#block_bhc").on('change', function () {
    var chc_dist = $("#dist_bhc").val();
    var chc_block = $("#block_bhc").val();
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'chc_dist': chc_dist, 'chc_block': chc_block, 'case': 'getExtent' },
      success: function (result) {
        var layerDatas = JSON.parse(result);
        if (layerDatas['status'] == 0) {
          display_error_message(layerDatas['message']);
        } else {
          zoom_extent = Array.from(layerDatas[0].extent.split(','), Number);
          zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
          map.getView().fit(zoom_extent, { duration: 3000, padding: [500, 300, 500, 300] });
        }
      },
    });
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'chc_dist': chc_dist, 'chc_block': chc_block, 'case': 'getChcHospitals' },
      success: function (result) {
        $("#bhc").html(result);
      },
    });
  });

  var route = new ol.layer.Tile({
    title: 'CHC Route',
    type: 'wms',
    source: new ol.source.TileWMS({
      url: geoServerURL,
      params: {
        'LAYERS': 'generic_viewer:health_phc_route',
      },
      serverType: 'geoserver'
    }),
    name: 'CHC Route',
    visible: true,
  });
  map.addLayer(route);

  // var buffer = new ol.layer.Tile({
  //   title: 'Route Buffer',
  //   type: 'wms',
  //   source:new ol.source.TileWMS({
  //     url: geoServerURL,
  //     params: {
  //        'LAYERS': 'generic_viewer:health_buffer',
  //     },
  //     serverType: 'geoserver'
  //   }),
  //   name: 'Route Buffer',
  //   visible: false,
  // });
  // map.addLayer(buffer);


  var r = 0;
  $("#health_route").on('click', function () {
    if (r == 0) {
      $("#health_route").addClass('bi-eye-slash').removeClass('bi-eye');
      route.setVisible(false);
      r = 1;
    } else {
      $("#health_route").addClass('bi-eye').removeClass('bi-eye-slash');
      route.setVisible(true);
      r = 0;
    }
  });
  var b = 0;
  $("#route_buffer").on('click', function () {
    if (b == 0) {
      $("#route_buffer").addClass('bi-eye').removeClass('bi-eye-slash');
      route.setVisible(true);
      b = 1;
    } else {
      $("#route_buffer").addClass('bi-eye-slash').removeClass('bi-eye');
      route.setVisible(false);
      b = 0;
    }
  });

  map.on('moveend', function (e) {
    legend.getItems().clear();
    map.getLayers().forEach(function (layer) {
      if (layer != undefined|| layer.get('name') == undefined) {
        if (layer.get('name') == 'OSM' || layer.get('name') == 'Satellite' || layer.get('name') == 'markers' || layer.get('name') == 'udb_buffer' || layer.get('name') == 'measure' || layer.get('name') == 'Bhuvan Satellite' || layer.get('name') == 'current Location' || layer.get('name') == 'shapefiles_upload' || layer.get('name') == 'ExcelFile' || layer.get('name') == 'KmlFile' || layer.get('name') == 'Wfsurl' || layer.get('name') == 'ShapeFile' || layer.get('name') == 'Wmsurl' || layer.get('title') == 'search marker' || layer.get('name') == 'Buffer Circle') {
        } else {
          if (layer.getVisible()) {
            var layerLegend = new ol.legend.Legend({ layer: layer });
            var resolution = map.getView().getResolution();
            var legend_url = layer.getSource().getLegendUrl(resolution);
            legend_url = legend_url + '&LEGEND_OPTIONS=forceLabels:on;fontColor:0x000000;fontAntiAliasing:true&transparent=true&fontSize=20';
            layerLegend.addItem(new ol.legend.Image({ src: legend_url }))
            legend.addItem(layerLegend);
          }
        }
      }
    });
  });

  var selected_route = new ol.layer.Tile({
    title: 'Route Selected',
    type: 'wms',
    source: new ol.source.TileWMS({
      url: geoServerURL,
      params: {
        'LAYERS': 'generic_viewer:health_phc_route',
        'STYLES': 'selected_route_health'
      },
      serverType: 'geoserver'
    }),
    name: 'Route Selected',
    visible: false,
  });
  map.addLayer(selected_route);

  function phcAssoc(phc_ids, phc_length) {
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'phc_ids': phc_ids, 'phc_length': phc_length, 'case': 'getphcDetails' },
      success: function (result) {
        var layerDatas = JSON.parse(result);
        if (layerDatas['status'] == 0) {
          display_error_message(layerDatas['message']);
        } else {
          layerDatas = layerDatas.slice(1);
          labels = ['District', 'Block', 'Name', 'Type', 'NiNo', 'Length(meter)']
          buildTable(labels, layerDatas, document.getElementById('phcTableDiv'), 'phcTable');
          $('#phcTable').DataTable({
            paging: true,
            searching: true,
            // dom: 'lBfrtip',
            dom: 'Brtip',
            buttons: [
              'copyHtml5',
              {
                extend: 'excelHtml5',
                autoFilter: true,
                sheetName: 'PHC',
              },
              'csvHtml5',
              {
                extend: 'pdfHtml5',
                orientation: 'landscape',
                pageSize: 'A3',
              },
            ]
          });
          $('.dataTable').on('click', 'tbody tr', function () {
            var row_data = $(this).find("td").eq(4).text();
            var table_name = 'phc_gis';
            var column_name = 'nin_no';
            $.ajax({
              type: 'POST',
              url: api + 'api/data.php',
              data: { 'id': row_data, 'table_name': table_name, 'column_name': column_name, 'case': 'getExtent' },
              success: function (result) {
                var layerDatas = JSON.parse(result);
                zoom(layerDatas);
              },
            });
          });
        }
      },
    });
  }

  $("#bhc").on('change', function () {
    $('#phcTableDiv').empty();
    selected_route.getSource().updateParams({ 'CQL_FILTER': null });
    selected_route.setVisible(false);
    var chc = $("#bhc").val();
    var phc_ids = Array();
    var route_ids = Array();
    var phc_length = Array();
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'chc': chc, 'case': 'getAssocPhc' },
      success: function (result) {
        var data = JSON.parse(result);
        if (data[0]['status'] == 1) {
          // $("#dist_bhc option[value="+data[1][0]['district']+"]").attr("selected", "selected");
          // $("#block_bhc option[value="+data[1][0]['block']+"]").attr("selected", "selected");
          data = data.slice(2);
          var bhc_id = data[0]['bh_nin_no'];
          data.forEach((value, index, array) => {
            phc_ids.push(value[0]['phc_nin_no']);
            phc_length.push({ name: value[0]['phc_nin_no'], length: Math.round(value[0]['total_leng'] * 100) / 100 });
            route_ids.push(value[0]['objectid']);
          });
          phcAssoc(phc_ids, phc_length);
          var cql = 'objectid IN (' + route_ids + ')';
          selected_route.getSource().updateParams({ 'CQL_FILTER': cql });
          selected_route.setVisible(true);
        } else {
          display_error_message(data[0]['message']);
        }
      },
    });
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'chc': chc, 'case': 'getExtent' },
      success: function (result) {
        var layerDatas = JSON.parse(result);
        if (layerDatas['status'] == 0) {
          display_error_message(layerDatas['message']);
        } else {
          zoom_extent = Array.from(layerDatas[0].extent.split(','), Number);
          zoom_extent = ol.proj.transformExtent(zoom_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
          map.getView().fit(zoom_extent, { duration: 3000, padding: [500, 300, 500, 300] });
        }
      },
    });
  });

  $("#route_tab").on('click', function () {
    $("#route_analysis").show();
    $("#chc_gaps").hide();
    $('#phcTableDiv').empty();
    document.getElementById('block_bhc').selectedIndex = 0;
    document.getElementById('dist_bhc').selectedIndex = 0;
    document.getElementById('bhc').selectedIndex = 0;
  });

  $("#chc_gap_tab").on('click', function () {
    $("#route_analysis").hide();
    $("#chc_gaps").show();
    $("#chcGapsTableDiv").empty();
    $.ajax({
      type: 'POST',
      url: api + 'api/data.php',
      data: { 'case': 'chcGaps' },
      success: function (result) {
        var layerDatas = JSON.parse(result);
        if (layerDatas['status'] == 0) {
          display_error_message(layerDatas['message']);
        } else {
          layerDatas = layerDatas.slice(1);
          labels = ['District', 'Block', 'Name', 'NiNo']
          buildTable(labels, layerDatas, document.getElementById('chcGapsTableDiv'), 'chcGapsTable');
          $('#chcGapsTable').DataTable({
            paging: true,
            searching: true,
            // dom: 'lBfrtip',
            dom: 'Brtip',
            buttons: [
              'copyHtml5',
              {
                extend: 'excelHtml5',
                autoFilter: true,
                sheetName: 'CHC Not Associated With Any PHC',
              },
              'csvHtml5',
              {
                extend: 'pdfHtml5',
                orientation: 'landscape',
                pageSize: 'A3',
              },
            ]
          });
          $('.dataTable').on('click', 'tbody tr', function () {
            var row_data = $(this).find("td").eq(3).text();
            var table_name = 'chc_gis';
            var column_name = 'nin_no';
            $.ajax({
              type: 'POST',
              url: api + 'api/data.php',
              data: { 'id': row_data, 'table_name': table_name, 'column_name': column_name, 'case': 'getExtent' },
              success: function (result) {
                var layerDatas = JSON.parse(result);
                // console.log(layerDatas);
                zoom(layerDatas);
              },
            });
          });
        }
      },
    });
  });
}