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

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);

    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }

}




