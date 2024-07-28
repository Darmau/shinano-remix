import { useEffect, useState } from 'react';

function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;

      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // 初始化进度

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, []);

  return (
      <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: `${scrollProgress}%`,
            height: '2px',
            backgroundColor: '#7c3aed',
            zIndex: 9999,
            transition: 'width 0.2s ease-out'
          }}
      />
  );
}

export default ScrollProgressBar;
