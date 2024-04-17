import '@fontsource-variable/raleway'
import './styles.scss'
import '@phosphor-icons/web/bold'

import Router from './managers/router'
import Scanner from './managers/websocket'
import Database from './managers/database'
import { debug } from './dev'

import { exit } from '@tauri-apps/plugin-process'

import Swal from 'sweetalert2'

if (window.location.pathname !== '/') window.location.href = '/'
if (window.location.hash !== '') window.location.hash = ''

Database.instance.init().then(() => {
    if (debug.bypass_ws) Router.instance.init()
    
    else 
    Scanner.instance.init('192.168.1.107', 12345)
        .then(msg => {
            console.log(msg)
            Router.instance.init()
        })
    
        .catch(err => {
            console.error(err)
    
            Swal.fire({
                text: 'The application cannot find the scanner. Launch the app anyway?'
            }).then(result => {
                if (result.isConfirmed)
                    Router.instance.init()
    
                else exit(1)
            })
        })
})