console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}


let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contacts'},
    { url: 'resume/', title: 'Resume'},
    { url: 'https://github.com/vivianlinnn', title: 'Profile'},
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);
const ARE_WE_HOME = document.documentElement.classList.contains('home');


for (let p of pages) {
    let url = p.url;
    let title = p.title;

    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;


    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }
    if (a.host !== location.host) {
        a.target = "_blank"
    }
    nav.append(a);
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `  <div class="color-scheme">
      <label>
          Theme:
          
          <select>
              <option value="light dark">Automatic</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
          </select>
      </label>
      </div>`
);


const select = document.querySelector('.color-scheme');

if ("colorScheme" in localStorage) {
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
    select.value = localStorage.colorScheme;
} else {
    select.value = 'light dark';
}
console.log(select)
select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value;
    
});

export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);
        console.log(response)

        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        const data = await response.json();
        return data; 


    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}
