const CookieManager = {
  set(name, value, options = {}) {
    const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`]

    if (options.expires) {
      const exp = typeof options.expires === 'number'
        ? new Date(Date.now() + options.expires * 1000)
        : options.expires instanceof Date
        ? options.expires
        : null
      if (exp) parts.push(`expires=${exp.toUTCString()}`)
    }

    if (options.path) parts.push(`path=${options.path}`)
    if (options.domain) parts.push(`domain=${options.domain}`)
    if (options.secure) parts.push('secure')
    if (options.sameSite) parts.push(`samesite=${options.sameSite}`)

    document.cookie = parts.join('; ')
  },

  get(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : null
  },

  delete(name, path = '/') {
    this.set(name, '', { expires: -1, path })
  }
}
