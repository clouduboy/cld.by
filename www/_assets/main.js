// Capture Ctrl+S and save the doc instead of popping up the native save dialog
document.addEventListener('keydown', (e) => {
  if (e.key === "s" && (e.ctrlKey || e.cmdKey)) {
    e.preventDefault()

    console.log('Saving...')
    save()
  }
})

function save() {
  fetch(`/+admin`, {
      credentials: 'same-origin',
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SaveConfig', contents: document.querySelector('textarea').value })
  }).then(r => {
    notify('Saved!', 'Short link configuration updated.')
  }).catch(err => {
    notify('Error saving configuration!', err.toString())
  })
}

function notify(title, msg) {
  if ("Notification" in window) {
    Notification.requestPermission().then(function(result) {
      console.log('💬 '+title)
      var n = new Notification(title, { body: msg })
      setTimeout(n.close.bind(n), 2000)
    });
  }
}
