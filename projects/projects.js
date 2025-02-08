import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
// console.log(projects)
renderProjects(projects, projectsContainer, 'h2');

function renderPieChart(projectsGiven) {
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
      );

    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));

    let colors = d3.scaleOrdinal(d3.schemeObservable10);

    let newSVG = d3.select('svg')
    newSVG.selectAll('path').remove();

    arcs.forEach((arc, idx) => {
        // TODO, fill in step for appending path to svg using D3
        newSVG.append('path').attr('d', arc).attr('fill', colors(idx) );
    })

    let legend = d3.select('.legend');

    legend.selectAll('li').remove();

    data.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
    })

    let selectedIndex = -1;
    let svg = d3.select('svg');
    svg.selectAll('path').remove();
    arcs.forEach((arc, i) => {
        svg
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(i))
        .on('click', () => {
            selectedIndex = selectedIndex === i ? -1 : i;
            console.log('hi');
            svg
            .selectAll('path')
            .attr('class', (_, idx) => (
                idx === selectedIndex ? 'selected' : null
            ));

            legend
            .selectAll('li')
            .attr('class', (_, idx) => (
                idx === selectedIndex ? 'selected' : null
            ));
        });
    });
}

renderPieChart(projects);



/* search bar */
let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});

