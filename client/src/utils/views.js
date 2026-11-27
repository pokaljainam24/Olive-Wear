// Thumbnails for the details page: real extra photos first (product.gallery), then close-up crops. Max 5.
export const getViews = (p) => {
  const full = [p.img, ...(p.gallery || [])].map((src, i) => ({ src, zoom: 1, x: 50, y: 50, label: i ? `View ${i + 1}` : "Front view" }));
  const crops = [
    { src: p.img, zoom: 1.7, x: 50, y: 22, label: "Top detail" },
    { src: p.img, zoom: 1.9, x: 50, y: 55, label: "Fabric close-up" },
    { src: p.img, zoom: 1.7, x: 50, y: 85, label: "Bottom detail" },
  ];
  return [...full, ...crops].slice(0, 5);
};
