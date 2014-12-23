// Copyright 2014 Rackspace Inc.
// All Rights Reserved
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.
//
// This SOFTWARE PRODUCT is provided by THE PROVIDER "as is" and "with all faults."
// THE PROVIDER makes no representations or warranties of any kind concerning the
// safety, suitability, lack of viruses, inaccuracies, typographical errors, or
// other harmful components of this SOFTWARE PRODUCT. There are inherent dangers
// in the use of any software, and you are solely responsible for determining
// whether this SOFTWARE PRODUCT is compatible with your equipment and other
// software installed on your equipment. You are also solely responsible for the
// protection of your equipment and backup of your data, and THE PROVIDER will
// not be liable for any damages you may suffer in connection with using,
// modifying, or distributing this SOFTWARE PRODUCT.


var width = 500,
    height = 500,
    radius = Math.min(width, height) / 2,
    innerRadius = 0.3 * radius;

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.width; });

var arc = d3.svg.arc()
  .innerRadius(innerRadius)
  .outerRadius(function (d) { 
    return (radius - innerRadius) * (d.data.score / 100.0) + innerRadius; 
  });

var outlineArc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);


function send_chart(data) {
  data.forEach(function(d) {
    d.order  = +d.order;
    d.color  =  d.color;
    d.weight = +d.weight;
    d.score  = +d.score;
    d.width  = +d.weight;
    d.label  =  d.label;
  });


  var svg = d3.select("svg")
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var path = svg.selectAll(".solidArc")
      .data(pie(data))
    .enter().append("path")
      .attr("fill", function(d) { return d.data.color; })
      .attr("class", "solidArc")
      .attr("stroke", "gray")
      .attr("d", arc);

  var outerPath = svg.selectAll(".outlineArc")
      .data(pie(data))
    .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", "lightgray")
      .attr("class", "outlineArc")
      .attr("d", outlineArc);  

  var score = 
    data.reduce(function(a, b) {
      return a + (b.score * b.weight); 
    }, 0) / 
    data.reduce(function(a, b) { 
      return a + b.weight; 
    }, 0);

  // Aster chart slice labels
  // The labels have hard coded text and positons which makes
  // this an excellent area for improvement.  Only the .text()
  // and the translate() parts should need to change.
  svg.append("svg:text")
    .attr("transform", "translate(40,-110) rotate(-75)")
    .attr("font-size", "20px")
    .text("#rackspace");

  svg.append("svg:text")
    .attr("transform", "translate(100,-65) rotate(-37)")
    .attr("font-size", "20px")
    .text("#hadoop");

  svg.append("svg:text")
    .attr("transform", "translate(100,10) rotate(0)")
    .attr("font-size", "20px")
    .text("#hadoopworld");

  svg.append("svg:text")
    .attr("transform", "translate(110,95) rotate(37)")
    .attr("font-size", "20px")
    .text("#spark");

  svg.append("svg:text")
    .attr("transform", "translate(35,130) rotate(75)")
    .attr("font-size", "20px")
    .text("#strata");

  svg.append("svg:text")
    .attr("transform", "translate(-50,190) rotate(-75)")
    .attr("font-size", "20px")
    .text("#nyc");

  svg.append("svg:text")
    .attr("transform", "translate(-180,140) rotate(-37)")
    .attr("font-size", "15px")
    .text("#twittersentimentdemo");

  svg.append("svg:text")
    .attr("transform", "translate(-190,10) rotate(0)")
    .attr("font-size", "20px")
    .text("#bigdata");

  svg.append("svg:text")
    .attr("transform", "translate(-160,-105) rotate(37)")
    .attr("font-size", "20px")
    .text("#onmetal");

  svg.append("svg:text")
    .attr("transform", "translate(-80,-210) rotate(67)")
    .attr("font-size", "20px")
    .text("#cloudbigdata");
};
