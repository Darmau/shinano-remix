function generatePages(count: number, limit: number, page: number) {
  let pages = [];
  const total = Math.ceil(count / limit);
  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (page <= 3) {
      pages = [1, 2, 3, 4, 5, '...', total];
    } else if (page >= total - 2) {
      pages = [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    } else {
      pages = [1, '...', page - 1, page, page + 1, '...', total];
    }
  }
  return pages;
}
