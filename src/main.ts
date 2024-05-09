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

const a = (document.getElementById('to-admin') as HTMLAnchorElement)
const href = a.href

a.href = ''

Database.instance.init().then(() => {    
	document.getElementById('to-admin')?.style.setProperty('pointer-events', '')
	document.body.style.opacity = '1'

	if (debug.bypass_ws) Router.instance.init()
	else
		Scanner.instance
			// .init('localhost', 6969)
			.init('192.168.1.1', 6969)
			.then(msg => {
				console.log(msg)
                
				Router.instance.init()
			})

			.catch(err => {
				console.error(err)

				Swal.fire({
					icon: 'error',
					html: 'The application cannot find the scanner.<br>Run the app anyway?',
					allowEscapeKey: true,
					allowOutsideClick: false,
					showCancelButton: true,

					confirmButtonText: 'Run',
					cancelButtonText: 'Exit App',
				}).then(result => {
					if (result.isConfirmed) Router.instance.init()
					else exit(1)
				})
			})
            
            .finally(() => a.href = href)
})