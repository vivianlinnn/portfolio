let data = [];
let commits = [];


async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    displayStats();
  }

document.addEventListener('DOMContentLoaded', async () => {
await loadData();
});



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

function displayStats() {
// Process commits first
processCommits();
// console.log(commits);

// Create the dl element
const dl = d3.select('#stats').append('dl').attr('class', 'stats');

// Add total LOC
dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
dl.append('dd').text(data.length);

// Add total commits
dl.append('dt').text('Total commits');
dl.append('dd').text(commits.length);

// Add max length

let max_depth = d3.max(data, d => d.length)
dl.append('dt').text('Max Depth');
dl.append('dd').text(max_depth);

// Add average file length
const fileLengths = d3.rollups(
    data,
    (v) => d3.max(v, (v) => v.line),
    (d) => d.file
  );

const averageFileLength = Math.round(d3.mean(fileLengths, (d) => d[1]));

dl.append('dt').text('Average File Length');
dl.append('dd').text(averageFileLength);


// Add the most common day

const date_num_reference = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thrusday',
    5: 'Friday',
    6: 'Saturday',
}

const workbyDay = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).getDay());

const maxDay = d3.greatest(workbyDay, (d) => d[1])?.[0];

dl.append('dt').text('Day of the Week');
dl.append('dd').text(date_num_reference[maxDay]);


// get most productive time of day
const workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
  );

// console.log(workByPeriod);
const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

dl.append('dt').text('Best Time of Day');
dl.append('dd').text(maxPeriod);

console.log(data);

}


