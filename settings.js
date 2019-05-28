const { ipcRenderer } = require('electron')

document.addEventListener('DOMContentLoaded', (event) => {

  // register back button event handler
  const btn_back = document.getElementById('btn-back');

  btn_back.addEventListener("click", () => {
    ipcRenderer.send('settings-close', null)
  });

  // register general section save button event handler
  const btn_save_general = document.getElementById('save-general');

  btn_save_general.addEventListener("click", () => {
    let blur = document.getElementById('blur').checked;
    let width = document.getElementById('dimension-width').value;
    let height = document.getElementById('dimension-height').value;
    ipcRenderer.send('save-general', { 'blur': blur, 'width': width, 'height': height })
  });

  // register shortcuts section save button event handler
  const btn_save_shortcuts = document.getElementById('save-keyboardshortcuts');

  btn_save_shortcuts.addEventListener("click", () => {
    let element = {
      'keyboardShortcutsEnabled': Boolean(document.getElementById('keyboardShortcutsEnabled').checked),
      'keyboardShortcuts': {
        'volumeUp': document.getElementById('volumeUp').value,
        'volumeDown': document.getElementById('volumeDown').value,
        'playToggle': document.getElementById('playToggle').value,
        'playNext': document.getElementById('playNext').value,
        'playPrevious': document.getElementById('playPrevious').value,
        'openVolumio': document.getElementById('openVolumio').value,
      }
    }
    ipcRenderer.send('save-shortcuts', element)
  });

  // register url save button event handler
  const btn_save_url = document.getElementById('save-url');

  btn_save_url.addEventListener("click", () => {
    let url = document.getElementById('url').value;
    ipcRenderer.send('save-network', { 'url': url })
  });

  // value setters
  const inp_blur = document.getElementById('blur');
  const inp_width = document.getElementById('dimension-width');
  const inp_height = document.getElementById('dimension-height');
  ipcRenderer.on('set-general', function (event, arg) {
    console.log("set-general", arg);
    inp_blur.checked = Boolean(arg.blur);
    inp_width.value = Number(arg.width);
    inp_height.value = Number(arg.height);
  })

  const inp_url = document.getElementById('url');
  ipcRenderer.on('set-network', function (event, arg) {
    console.log("set-network", arg);
    inp_url.value = String(arg.url);
  })

})