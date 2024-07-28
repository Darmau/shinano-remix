interface NavItem {
  name: string;
  link: string;
}

// 定义整个Navbar对象的类型
type SubnavType = {
  [key: string]: {
    [key: string]: NavItem[];
  };
}

const Subnav: SubnavType = {
  "zh": {
    "article": [
      {
        "name": "首页",
        "link": "/zh/"
      },
      {
        "name": "推荐",
        "link": "/zh/articles/featured/1"
      },
      {
        "name": "最新",
        "link": "/zh/articles/1"
      },
    ],
    "photography": [
      {
        "name": "推荐",
        "link": "/zh/albums/featured"
      },
      {
        "name": "最新",
        "link": "/zh/albums/all/1"
      }
    ],
    "thought": [
      {
        "name": "最新",
        "link": "/zh/thoughts/1"
      }
    ],
    "about": [
      {
        "name": "作者",
        "link": "/zh/about"
      },
      {
        "name": "本站",
        "link": "/zh/site"
      },
      {
        "name": "联系我",
        "link": "/zh/contact"
      },
      {
        "name": "RSS",
        "link": "/zh/rss"
      }
    ],
  },
  "en": {
    "article": [
      {
        "name": "Homepage",
        "link": "/en/"
      },
      {
        "name": "Featured",
        "link": "/en/articles/featured/1"
      },
      {
        "name": "Latest",
        "link": "/en/articles/1"
      },
    ],
    "photography": [
      {
        "name": "Featured",
        "link": "/en/albums/featured"
      },
      {
        "name": "Latest",
        "link": "/en/albums/all/1"
      }
    ],
    "thought": [
      {
        "name": "Latest",
        "link": "/en/thoughts/1"
      }
    ],
    "about": [
      {
        "name": "Author",
        "link": "/en/about"
      },
      {
        "name": "Site",
        "link": "/en/site"
      },
      {
        "name": "Contact",
        "link": "/en/contact"
      },
      {
        "name": "RSS",
        "link": "/en/rss"
      },
    ],
  },
  "jp": {
    "article": [
      {
        "name": "ホーム",
        "link": "/jp/"
      },
      {
        "name": "厳選",
        "link": "/jp/articles/featured/1"
      },
      {
        "name": "最新",
        "link": "/jp/articles/1"
      },
    ],
    "photography": [
      {
        "name": "厳選",
        "link": "/jp/albums/featured"
      },
      {
        "name": "最新",
        "link": "/jp/albums/all/1"
      }
    ],
    "thought": [
      {
        "name": "最新",
        "link": "/jp/thoughts/1"
      }
    ],
    "about": [
      {
        "name": "著者",
        "link": "/jp/about"
      },
      {
        "name": "サイト",
        "link": "/jp/site"
      },
      {
        "name": "連絡",
        "link": "/jp/contact"
      },
      {
        "name": "RSS",
        "link": "/jp/rss"
      },
    ],
  },
}

export default function SubNavItems(lang: string, current: string) {
  if (!Subnav[lang]) {
    return Subnav['zh'][current];
  }
  return Subnav[lang][current];
}
