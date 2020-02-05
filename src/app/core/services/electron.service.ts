import { Injectable } from '@angular/core'

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote } from 'electron'
import * as childProcess from 'child_process'
import * as fs from 'fs'
import * as util from 'util'
import { IPCEvents } from '../../../electron/shared/IPCHandler'

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer
  webFrame: typeof webFrame
  remote: typeof remote
  childProcess: typeof childProcess
  fs: typeof fs
  util: typeof util

  get isElectron() {
    return !!(window && window.process && window.process.type)
  }

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer
      this.webFrame = window.require('electron').webFrame
      this.remote = window.require('electron').remote

      this.childProcess = window.require('child_process')
      this.fs = window.require('fs')
      this.util = window.require('util')
    }
  }

  /**
   * Calls an async function in the main process.
   * @param event The name of the IPC event to invoke.
   * @param data The data object to send across IPC.
   * @returns A promise that resolves to the output data.
   */
  async invoke<E extends keyof IPCEvents>(event: E, data: IPCEvents[E]['input']) {
    return this.ipcRenderer.invoke(event, data) as Promise<IPCEvents[E]['output']>
  }
}