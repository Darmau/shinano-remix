interface NavItem {
  name: string;
  link: string;
}

// 定义整个Navbar对象的类型
type NavbarType = {
  [key: string]: NavItem[];
}

const Navbar: NavbarType = {
  "zh": [
    {
      "name": "文章",
      "link": "/zh"
    },
    {
      "name": "摄影",
      "link": "/zh/albums/featured/1"
    },
    {
      "name": "想法",
      "link": "/zh/thoughts/1"
    },
    {
      "name": "关于",
      "link": "/zh/about"
    }
  ],
  "en": [
    {
      "name": "Articles",
      "link": "/en"
    },
    {
      "name": "Photography",
      "link": "/albums/featured/1"
    },
    {
      "name": "Thoughts",
      "link": "/thoughts/1"
    },
    {
      "name": "About",
      "link": "/about"
    }
  ],
  "jp": [
    {
      "name": "記事",
      "link": "/jp"
    },
    {
      "name": "写真",
      "link": "/jp/albums/featured/1"
    },
    {
      "name": "思考",
      "link": "/jp/thoughts/1"
    },
    {
      "name": "について",
      "link": "/jp/about"
    }
  ]
}

export default function NavbarItems(lang: string) {
  if (!Navbar[lang]) {
    return Navbar['zh'];
  }
  return Navbar[lang];
}
