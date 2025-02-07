import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
// console.log(projects)
renderProjects(projects, projectsContainer, 'h2');

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let arc = arcGenerator({
//     startAngle: 0,
//     endAngle: 2 * Math.PI,
//   });

// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

// let data = [1, 2, 3, 4, 5, 5];

// let data = [
//     { value: 1, label: 'apples' },
//     { value: 2, label: 'oranges' },
//     { value: 3, label: 'mangos' },
//     { value: 4, label: 'pears' },
//     { value: 5, label: 'limes' },
//     { value: 5, label: 'cherries' },
//   ];

let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
  );

console.log(rolledData);

let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });
  
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));



// let total = 0;

// for (let d of data) {
//   total += d;
// }

// let angle = 0;
// let arcData2 = [];

// for (let d of data) {
//   let endAngle = angle + (d / total) * 2 * Math.PI;
//   arcData2.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// }

// console.log(arcData2);

// let arcs = arcData.map((d) => arcGenerator(d));

// let colors = ['gold', 'purple'];
let colors = d3.scaleOrdinal(d3.schemeObservable10);

arcs.forEach((arc, idx) => {
    // TODO, fill in step for appending path to svg using D3
    d3.select('svg').append('path').attr('d', arc).attr('fill', colors(idx) );
})

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
})

