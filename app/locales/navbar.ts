export interface NavItem {
  name: string;
  link: string;
  type: string;
}

// 定义整个Navbar对象的类型
type NavbarType = {
  [key: string]: NavItem[];
}

const Navbar: NavbarType = {
  "zh": [
    {
      "name": "文章",
      "link": "/zh",
      "type": "article"
    },
    {
      "name": "摄影",
      "link": "/zh/albums/featured",
      "type": "album"
    },
    {
      "name": "想法",
      "link": "/zh/thoughts",
      "type": "thought"
    },
    {
      "name": "关于",
      "link": "/zh/about",
      "type": "about"
    }
  ],
  "en": [
    {
      "name": "Articles",
      "link": "/en",
      "type": "article"
    },
    {
      "name": "Photography",
      "link": "/en/albums/featured",
      "type": "album"
    },
    {
      "name": "Thoughts",
      "link": "/en/thoughts",
      "type": "thought"
    },
    {
      "name": "About",
      "link": "/en/about",
      "type": "about"
    }
  ],
  "jp": [
    {
      "name": "記事",
      "link": "/jp",
      "type": "article"
    },
    {
      "name": "写真",
      "link": "/jp/albums/featured",
      "type": "album"
    },
    {
      "name": "思考",
      "link": "/jp/thoughts",
      "type": "thought"
    },
    {
      "name": "について",
      "link": "/jp/about",
      "type": "about"
    }
  ]
}

export default function NavbarItems(lang: string) {
  if (!Navbar[lang]) {
    return Navbar['zh'];
  }
  return Navbar[lang];
}
