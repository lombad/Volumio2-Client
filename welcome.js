const {ipcRenderer} = require('electron')

document.addEventListener('DOMContentLoaded', (event) => {

  // register url save button event handler
  const btn_save_url = document.getElementById('save-url');

  btn_save_url.addEventListener("click", () => {
    let url = document.getElementById('url').value;
    ipcRenderer.send('save-network', {'url': url})
    ipcRenderer.send('settings-close', null)
  });

})
