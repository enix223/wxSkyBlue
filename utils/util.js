const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// buffer is an ArrayBuffer
const buf2Hex = (buffer, separator='') => {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join(separator);
}

const str2Buffer = (str, isHex=true, space=false) => {
  let arr = []
  if (isHex) {
    if (space) {
      let regex = new RegExp('^([0-9A-F]{2})+( [0-9A-F]{2})*$')
      if (regex.test(str.toUpperCase())) {
        str = str.replace(' ', '')
      } else {
        return null
      }
    } else {
      let regex = new RegExp('^([0-9A-F]{2})+([0-9A-F]{2})*$')
      if (regex.test(str.toUpperCase())) {
        str = str.replace(' ', '')
      } else {
        return null
      }
    }

    for (let i = 0; i < str.length; i += 2) {
      let val = parseInt(str.substring(i, i + 2), 16)
      arr.push(val)
    }
  } else {
    for (let ch of str) {
      arr.push(ch.charCodeAt(0))
    }
  }

  return (new Uint8Array(arr)).buffer
}

const buf2String = (buffer) => {
  let uBuf = new Uint8Array(buffer)
  let str = []
  for (let i = 0; i < uBuf.length; i ++) {
    let item = uBuf[i]
    str.push(String.fromCharCode(item))
  }
  return str.join('')
}

module.exports = {
  formatTime: formatTime,
  buf2Hex: buf2Hex,
  str2Buffer: str2Buffer,
  buf2String: buf2String
}
