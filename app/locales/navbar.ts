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
      "link": "/zh/thoughts/all/1"
    },
    {
      "name": "关于",
      "link": "/zh/about"
    }
  ],

}

export default function NavbarItems(lang: string) {
  return Navbar[lang];
}
