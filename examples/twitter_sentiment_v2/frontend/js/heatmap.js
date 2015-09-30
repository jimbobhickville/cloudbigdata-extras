var map, heatmap, heatmapData;
var pointArrays = {'positive': [], 'negative': []};
var mapDataType = 'negative';

$(function(){
  $("input[name=optionsRadios]:radio").change(function () {
    mapDataType = $(this).val();
    initMap();
  });
});

function changeGradient(type) {
  if (type == 'positive') {
    var gradient = [
      'rgba(222,238,212, 0)',
      'rgba(222,238,212, 1)',
      'rgba(206,230,190, 1)',
      'rgba(189,221,169, 1)',
      'rgba(156,204,126, 1)',
      'rgba(140,196,105, 1)',
      'rgba(123,187,83, 1)',
      'rgba(106,178,61, 1)',
      'rgba(90,170,40, 1)'
    ];
    heatmap.set('gradient', gradient);
  } else {
    var gradient = [
      'rgba(243,204,211, 0)',
      'rgba(243,204,211, 1)',
      'rgba(231,153,167, 1)',
      'rgba(226,128,144, 1)',
      'rgba(220,102,122, 1)',
      'rgba(214,77,100, 1)',
      'rgba(208,51,78, 1)',
      'rgba(202,25,56, 1)',
      'rgba(196,0,34, 1)'
    ];
    heatmap.set('gradient', gradient);
  }
}

function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    center: {lat: 35.244634227246151, lng: -72.97359946542603},
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false
  });

  var dataArray = new google.maps.MVCArray(pointArrays[mapDataType]);
  var points    = pointArrays[mapDataType];

  if (points.length > 0) {
    var arrayBounds = getBounds(points);
    map.setCenter(arrayBounds.center);
    map.fitBounds(arrayBounds.bounds);
  } else {
    var mapCenter = new google.maps.LatLng(35.244634227246151, -72.97359946542603);
    map.setCenter(mapCenter);
    map.setZoom(2);
  }

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: dataArray,
    map: map
  });

  changeGradient(mapDataType);
}

function getBounds(data) {
  var bounds = new google.maps.LatLngBounds();

  for (x in data) {
    bounds.extend(data[x]);
  }

  return { 'center': bounds.getCenter(), 'bounds': bounds};
}

function mapReboot(data){
  for (sentiment in pointArrays) {
    for (var i=0; i<data[sentiment].length; i++) {
        var location = data[sentiment][i]['location'];
        if (location['lon'] != 0 || location['lat'] != 0) {
            pointArrays[sentiment].push(new google.maps.LatLng(location['lat'], location['lon']));
        }
    }
  }
  initMap();
}

$('#heatMapTab').on('shown.bs.tab', function (e) {
  google.maps.event.trigger(map, 'resize');
});
