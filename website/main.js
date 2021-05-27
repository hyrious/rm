const $ = document.querySelector.bind(document)
const $$ = sel => Array.from(document.querySelectorAll(sel))
const h = (tag, attr, ...children) => {
  const el = document.createElement(tag)
  Object.assign(el, attr).append(...children)
  return el
}
Node.prototype.on = Node.prototype.addEventListener
const show = (el) => el.style.visibility = ''
const hide = (el) => el.style.visibility = 'hidden'

{
  let nav = $('#navigation')
  for (const { id, textContent: title } of $$('h2[id]')) {
    nav.append(h('a', { href: '#' + id }, title))
  }
}

{
  const readArrayBuffer = file => new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsArrayBuffer(file)
  })
  let input = $('#scripts-viewer-input')
  let select = $('#scripts-viewer-select')
  let pre = $('#scripts-viewer-pre')
  let contents = {}
  select.on('change', () => {
    pre.textContent = contents[select.value]
  })
  input.on('input', () => {
    const file = input.files[0]
    pre.textContent = ''
    if (!file) hide(select)
    else show(select), loadFile(file).catch(console.error)
  })
  function loadBuffer(buffer) {
    const view = new DataView(buffer)
    if (view.getInt16() !== 0x408) {
      throw new Error('invalid marshal format')
    }
    let i = 2
    const r1 = () => view.getInt8(i++)
    const rN = n => { i += n; return buffer.slice(i - n, i) }
    // fixnum
    const rI = () => {
      const t = r1()
      if (t === 0) {
        return 0
      } else if (-4 <= t && t <= 4) {
        const bytes = Array.from(new Uint8Array(rN(Math.abs(t))))
        const shift = 32 - 8 * bytes.length
        let a = 0; for (let j = bytes.length - 1; j >= 0; --j) {
          a = (a << 8) + bytes[j]
        }
        return (t < 0) ? (a << shift >> shift) : a
      } else {
        return t > 0 ? t - 5 : t + 5
      }
    }
    const r = () => {
      const b = r1(), c = String.fromCharCode(b)
      switch (c) {
        case 'T': return true
        case 'F': return false
        case '0': return null
        case 'i': return rI()
        case '"': case ':': case ';': return rN(rI())
        case '[': return Array(rI()).fill(0).map(() => r())
        case 'I': {
          const a = r()
          return Array(rI()).fill(0).map(() => (r(), r())), a
        }
        default:
          throw new Error("unknown type")
      }
    }
    return r()
  }
  async function loadFile(file) {
    const buffer = await readArrayBuffer(file)
    const scripts = loadBuffer(buffer)
    const utf8 = new TextDecoder()
    contents = {}
    while (select.firstChild) select.removeChild(select.lastChild)
    for (const [id, title_, data] of scripts) {
      const title = utf8.decode(title_)
      const content = pako.inflate(data, { to: 'string' })
      contents[id] = content
      select.append(h('option', { value: id }, title))
    }
  }
}
