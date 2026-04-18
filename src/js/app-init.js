import './components/site-nav'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
  { label: 'Behaviors', href: '/behaviors/'}
];

window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('site-nav').forEach(nav => {
        nav.items = navItems

        /* For testing out listening to events from custom components */
        nav.addEventListener('item-click', (e) => {
            console.log(JSON.stringify(e.detail))
        })
    })
})

