const matemo = (() => {
  const bcd = (n) => (n & 15) + 10 * ((n >> 4) & 15)
  const bcd0 = (n) => {
    n = bcd(n)
    return n < 80 ? n : 0
  }
  const pad = n => {
    n = '' + n
    while (n.length < 2) n = '0' + n
    return n
  }
  const bcds = n => pad(bcd(n))
  const bcdtime = (data, offset) => {
    return '20' +
      bcds(data[offset + 5]) + '-' +
      bcds(data[offset + 4]) + '-' +
      bcds(data[offset + 3]) + 'T' +
      bcds(data[offset + 2]) + ':' +
      bcds(data[offset + 1]) + ':' +
      bcds(data[offset + 0]) + 'Z'
  }
  const int16 = (data, offset) => {
    let n = data[offset] * 256 + data[offset + 1]
    return n > 32767 ? n - 65536 : n
  }
  const iso = date => {
    return date.getUTCFullYear() + '-' +
      pad(date.getUTCMonth() + 1) + '-' +
      pad(date.getUTCDate()) + 'T' +
      pad(date.getUTCHours()) + ':' +
      pad(date.getUTCMinutes()) + ':' +
      pad(date.getUTCSeconds()) + 'Z'
  }
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ]
  const angle = (r, r0) => Math.acos(
    dot(r, r0) / Math.sqrt(dot(r, r) * dot(r0, r0))
  ) * 180 / Math.PI
  const inclination = (x, y) => {
    x *= Math.PI / 180
    y *= Math.PI / 180
    const cosx = Math.cos(x)
    const cosy = Math.cos(y)
    const sinx = Math.sin(x)
    const siny = Math.sin(y)
    return angle(cross([cosx, 0, -sinx], [0, cosy, -siny]), [0, 0, 1])
  }
  return data => {
    if (data.length < 50) throw new Error('File too small.')
    let size = (data[16] * 256 + data[17]) * 256 + data[18]
    if (data.length !== size) throw new Error('Size does not match.')
    let interval = ((bcd0(data[9]) * 24 + bcd0(data[8])) * 60 + bcd0(data[7])) * 60 + bcd0(data[6])
    let start = bcdtime(data, 0)
    let end = bcdtime(data, 10)
    let remark = []
    for (let i = 24; i < 50; ++i) {
      if (data[i] === 0) break;
      remark.push(data[i]);
    }
    remark = new TextDecoder().decode(new Uint8Array(remark))
    let d = []
    let t = +new Date(start)
    for (let i = 50; i < data.length; i += 4) {
      const x = int16(data, i) / 10
      const y = int16(data, i + 2) / 10
      const inc = inclination(x, y)
      d.push({
        t: iso(new Date(t)),
        x, y, inc
      })
      t += interval * 1000
    }
    return {
      "start_time": start,
      "end_time": end,
      "interval": interval,
      "data": d
    }
  }
})()
