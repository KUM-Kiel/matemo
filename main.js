const en = () => {
  return {
    message: code => {
      if (code === 1) return 'The selected file is not a valid Matemo.bin file.'
      if (code === 2) return 'Please select a Matemo.bin file.'
      if (code === 3) return 'Processing the file ...'
      return ''
    }
  }
}
const leftpad = (s, n) => {
  s = '' + s
  while (s.length < n) s = ' ' + s
  return s
}
const downloadURL = (data, fileName) => {
  const a = document.createElement('a')
  a.href = data
  a.download = fileName
  document.body.appendChild(a)
  a.style.display = 'none'
  a.click()
  a.remove()
}
const downloadBlob = (data, fileName, mimeType) => {
  const blob = new Blob([data], {
    type: mimeType
  })
  const url = window.URL.createObjectURL(blob)
  downloadURL(url, fileName)
  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}
const comma = s => (s + '').replace(/\./g, ',')
const app = Vue.createApp({
  data() {
    return {
      message: 2,
      file: null,
      locale: en()
    }
  },
  computed: {
    txt() {
      if (this.file === null) return ''
      let s = 'Time                     X [°]     Y [°]   Inc [°]\n'
      for (let i = 0; i < this.file.data.length; ++i) {
        const d = this.file.data[i]
        s += d.t + leftpad(d.x.toFixed(1), 10) + leftpad(d.y.toFixed(1), 10) + leftpad(d.inc.toFixed(1), 10) + '\n'
      }
      return s
    }
  },
  methods: {
    select(event) {
      const files = event.target.files
      if (files.length > 0) {
        if (files[0].size < 1024 * 1024) {
          this.message = 3
          setTimeout(() => {
            files[0].arrayBuffer().then(b => {
              try {
                this.file = matemo(new Uint8Array(b))
                this.message = 0
              } catch (e) {
                this.message = 1
              }
            })
          }, 50)
        } else {
          this.message = 1
        }
      }
    },
    saveJson() {
      if (this.file === null) return
      downloadBlob(new TextEncoder().encode(JSON.stringify(this.file, null, 2)), 'Matemo.json', 'application/octet-stream')
    },
    saveTxt() {
      if (this.file === null) return
      downloadBlob(new TextEncoder().encode(this.txt), 'Matemo.txt', 'application/octet-stream')
    },
    saveCsv() {
      if (this.file === null) return
      let s = 'Time,X [°],Y [°],Inc [°]\n'
      for (let i = 0; i < this.file.data.length; ++i) {
        const d = this.file.data[i]
        s += d.t + ',' + d.x.toFixed(1) + ',' + d.y.toFixed(1) + ',' + d.inc.toFixed(1) + '\n'
      }
      downloadBlob(new TextEncoder().encode(s), 'Matemo.csv', 'application/octet-stream')
    },
    saveExcelCsv() {
      if (this.file === null) return
      let s = '\ufeff"Time","X [°]","Y [°]","Inc [°]"\n'
      for (let i = 0; i < this.file.data.length; ++i) {
        const d = this.file.data[i]
        s += '"' + d.t + '",' + d.x.toFixed(1) + ',' + d.y.toFixed(1) + ',' + d.inc.toFixed(1) + '\n'
      }
      downloadBlob(new TextEncoder().encode(s), 'Matemo.csv', 'application/octet-stream')
    },
    saveExcelCsv2() {
      if (this.file === null) return
      let s = '\ufeff"Time";"X [°]";"Y [°]";"Inc [°]"\n'
      for (let i = 0; i < this.file.data.length; ++i) {
        const d = this.file.data[i]
        s += '"' + d.t + '";' + comma(d.x.toFixed(1)) + ';' + comma(d.y.toFixed(1)) + ';' + comma(d.inc.toFixed(1)) + '\n'
      }
      downloadBlob(new TextEncoder().encode(s), 'Matemo.csv', 'application/octet-stream')
    }
  }
}).mount('#app')
