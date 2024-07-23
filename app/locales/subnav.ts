// 生成当前年份
const year = new Date().getFullYear()

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
        "link": "/zh"
      },
      {
        "name": "最新",
        "link": "/zh/articles/all/1"
      },
      {
        "name": "推荐",
        "link": "/zh/articles/featured/1"
      },
      {
        "name": "分类",
        "link": "/zh/articles/categories"
      },
      {
        "name": "归档",
        "link": `/zh/articles/archive`
      }
    ],
    "photography": [
      {
        "name": "推荐",
        "link": "/zh/albums/featured/1"
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
        "name": "RSS",
        "link": "/zh/rss"
      },
      {
        "name": "联系我",
        "link": "/zh/contact"
      }
    ],
  },
  "en": {
    "article": [
      {
        "name": "Homepage",
        "link": "/en"
      },
      {
        "name": "Latest",
        "link": "/en/articles/all/1"
      },
      {
        "name": "Featured",
        "link": "/en/articles/featured/1"
      },
      {
        "name": "Category",
        "link": "/en/articles/categories"
      },
      {
        "name": "Archive",
        "link": `/en/articles/archive/${year}/1`
      }
    ],
    "photography": [
      {
        "name": "Featured",
        "link": "/en/albums/featured/1"
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
        "name": "RSS",
        "link": "/en/rss"
      },
      {
        "name": "Contact",
        "link": "/en/contact"
      }
    ],
  },
  "jp": {
    "article": [
      {
        "name": "ホーム",
        "link": "/jp"
      },
      {
        "name": "最新",
        "link": "/jp/articles/all/1"
      },
      {
        "name": "厳選",
        "link": "/jp/articles/featured/1"
      },
      {
        "name": "カテゴリ",
        "link": "/jp/articles/categories"
      },
      {
        "name": "アーカイブ",
        "link": `/jp/articles/archive/${year}/1`
      }
    ],
    "photography": [
      {
        "name": "厳選",
        "link": "/jp/albums/featured/1"
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
        "name": "RSS",
        "link": "/jp/rss"
      },
      {
        "name": "連絡",
        "link": "/jp/contact"
      }
    ],
  },
}

export default function SubNavItems(lang: string, current: string) {
  if (!Subnav[lang]) {
    return Subnav['zh'][current];
  }
  return Subnav[lang][current];
}
