import '@fontsource-variable/raleway'
import './styles.scss'
import '@phosphor-icons/web/bold'

import Router from './managers/router'
import Scanner from './managers/websocket'
import Database from './managers/database'
import { debug } from './dev'

if (window.location.pathname !== '/') window.location.href = '/'
if (window.location.hash !== '') window.location.hash = ''

await Database.instance.init()
if (debug.bypass_ws) Router.instance.init()

else 
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