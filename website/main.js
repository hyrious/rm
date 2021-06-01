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
  async function loadFile(file) {
    const buffer = await file.arrayBuffer()
    const scripts = marshal.load(buffer, { decodeString: false })
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
