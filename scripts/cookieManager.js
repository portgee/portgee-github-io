const CookieManager = {
    set(name, value, options = {}) {
      let cookieStr = encodeURIComponent(name) + '=' + encodeURIComponent(value);
  
      if (options.expires) {
        if (typeof options.expires === 'number') {
          const date = new Date();
          date.setTime(date.getTime() + options.expires * 1000);
          cookieStr += '; expires=' + date.toUTCString();
        } else if (options.expires instanceof Date) {
          cookieStr += '; expires=' + options.expires.toUTCString();
        }
      }
  
      if (options.path) {
        cookieStr += '; path=' + options.path;
      }
  
      if (options.domain) {
        cookieStr += '; domain=' + options.domain;
      }
  
      if (options.secure) {
        cookieStr += '; secure';
      }
  
      if (options.sameSite) {
        cookieStr += '; samesite=' + options.sameSite;
      }
  
      document.cookie = cookieStr;
    },
  
    get(name) {
      const match = document.cookie.match(new RegExp('(^| )' + encodeURIComponent(name) + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    },
  
    delete(name, path = '/') {
      this.set(name, '', { expires: -1, path });
    }
  };
  