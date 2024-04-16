import '@fontsource-variable/raleway'
import './styles.scss'
import Router from './managers/router'
import Scanner from './managers/websocket'
import Database from './managers/database'

if (window.location.pathname !== '/') window.location.href = '/'
if (window.location.hash !== '') window.location.hash = ''

await Database.instance.init()
Scanner.instance.init('192.168.1.107', 12345)
    .then(msg => {
        console.log(msg)
        Router.instance.init()
    })

    .catch(err => {
        console.error(err)

        if (confirm('Websocket not established. Launch the app anyway?')) {
            Router.instance.init()
        }
    })