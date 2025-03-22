let data = [];
let commits = [];
// let brushSelection = null;
let xScale;
let yScale;
let selectedCommits;
let brushSelection;



let filteredCommits;
let filteredData;

let files = [];

let commitProgress = 100;
const commitTime = document.getElementById('slider-time');
const slider = document.getElementById('slider');

let timeScale;
let commitMaxTime;



async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  processCommits();
  timeScale = d3.scaleTime()
    .domain([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)])
    .range([0, 100]);

  getStats();
  showTime();
  brushSelector();
  // displayStats();

  slider.addEventListener('input', showTime);

}

document.addEventListener('DOMContentLoaded', async () => {
await loadData();
});

function showTime() {
  commitProgress = slider.value;
  let commitMaxTime = timeScale.invert(commitProgress);
  commitTime.textContent = commitMaxTime.toLocaleString();
  filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
  filteredData = data.filter(d => d.datetime <= commitMaxTime);
  displayStats();

  // let lines = filteredCommits.flatMap((d) => d.lines);
  // files = d3
  // .groups(lines, (d) => d.file)
  // .map(([name, lines]) => {
  //   return { name, lines };
  // });

  // console.log(files.map(f => f.name))
  

  // d3.select('.files').selectAll('div').remove(); // don't forget to clear everything first so we can re-render

  // let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div'); 
  // filesContainer.append('dt').append('code').text(d => files.map(f => f.name));
  // filesContainer.append('dd').text(d => files.map(f=>`${f.lines.length} lines`));
  
  // filesContainer.append('dd')
  //             .selectAll('div')
  //             .data(d => d.lines);

  createScatterplot();

  
}


function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          writable: true,
          enumerable: true,
          configurable: true,
          // What other options do we need to set?
          // Hint: look up configurable, writable, and enumerable
        });
  
        return ret;
      });
  }

let totalLOC;
let max_depth;
let averageFileLength;
let maxPeriod;
let maxDay;

const date_num_reference = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thrusday',
  5: 'Friday',
  6: 'Saturday',
}
function getStats() {
  totalLOC = data.length;
  max_depth = d3.max(data, d => d.length)

  const fileLengths = d3.rollups(
    data,
    (v) => d3.max(v, (v) => v.line),
    (d) => d.file
  );

  averageFileLength = Math.round(d3.mean(fileLengths, (d) => d[1]));

  const workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
  );

  maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

  const workbyDay = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).getDay());

 maxDay = d3.greatest(workbyDay, (d) => d[1])?.[0];
    
}
function displayStats() {
// Process commits first


// Create the dl element
const dl = d3.select('#stats').html('').append('dl').attr('class', 'stats');

// Add total LOC
dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
dl.append('dd').text(totalLOC);

// Add total commits
dl.append('dt').text('Total commits');
dl.append('dd').text(filteredCommits.length);

// // Add max length
dl.append('dt').text('Max Depth');
dl.append('dd').text(max_depth);


// Add average file length
dl.append('dt').text('Average File Length');
dl.append('dd').text(averageFileLength);

// // Add the most common day
dl.append('dt').text('Day of the Week');
dl.append('dd').text(date_num_reference[maxDay]);

// // get most productive time of day
dl.append('dt').text('Best Time of Day');
dl.append('dd').text(maxPeriod);

}

function createScatterplot() {
    const width = 1000;
    const height = 600;
    const sortedCommits = d3.sort(filteredCommits, (d) => -d.totalLines);
    
    const svg = d3
      .select('#chart')
      .html('')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');
      
    xScale = d3
    .scaleTime()
    .domain(d3.extent(filteredCommits, (d) => d.datetime))
    .range([0, width])
    .nice();
    
    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
    
    const dots = svg.append('g').attr('class', 'dots');
    
    dots
      .selectAll('circle')
      .data(sortedCommits)
      .join('circle')
      .attr('cx', (d) => xScale(d.datetime))
      .attr('cy', (d) => yScale(d.hourFrac))
      .attr('r', 5)
      .attr('fill', 'steelblue');


    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };
      
      // Update scales with new ranges
      xScale.range([usableArea.left, usableArea.right]);
      yScale.range([usableArea.bottom, usableArea.top]);

      // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    // Add Y axis
    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

    // Add gridlines BEFORE the axes
    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    const [minLines, maxLines] = d3.extent(filteredCommits, (d) => d.totalLines);
    const rScale = d3
    .scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);

    dots
    .selectAll('circle')
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
        d3.select(event.currentTarget).style('fill-opacity', 1); 
        updateTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
        d3.select(event.currentTarget).style('fill-opacity', 0.7);
        updateTooltipContent({}); // Clear tooltip content
        updateTooltipVisibility(false);
    });

}

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const authors = document.getElementById('commit-author');
    const time = document.getElementById('commit-time');
    const lines = document.getElementById('commit-lines');

  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;

    authors.href = 'https://github.com/vivianlinnn';
    authors.textContent = commit.author;

    time.textContent = commit.time;

    lines.textContent = commit.lines.length;

    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });

  }

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

function brushSelector() {
    const svg = document.querySelector('svg');
    // d3.select(svg).call(d3.brush());

    // Create brush
    d3.select(svg).call(d3.brush().on('start brush end', brushed));

    // Raise dots and everything after overlay
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

function brushed(event) {
    // console.log(event);

    brushSelection = event.selection;
    // console.log(!brushSelection)
    selectedCommits = !brushSelection
    ? []
    : filteredCommits.filter((commit) => {
        let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        let x = xScale(commit.date);
        let y = yScale(commit.hourFrac);

        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });

    // brushSelection = event.selection;
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

function updateSelection() {
    // Update visual state of dots based on selection
    d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];
    const container = document.getElementById('language-breakdown');

    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);

    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type
    );

    // Update DOM with breakdown
    container.innerHTML = '';

    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format('.1~%')(proportion);

        container.innerHTML += `
                <dt>${language}</dt>
                <dd>${count} lines (${formatted})</dd>
            `;
    }

    return breakdown;
}







  

  






