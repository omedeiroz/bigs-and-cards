/* eslint-disable */
// ============================================================
// Icon system — uses Lucide via CDN
// Usage: <Icon name="Plus" size={16} />
// ============================================================

function Icon({ name, size = 16, color = 'currentColor', strokeWidth = 1.8, style = {}, ...rest }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current && window.lucide) {
      ref.current.innerHTML = '';
      const icons = window.lucide.icons || window.lucide;
      const iconData = icons[name] || icons[name.charAt(0).toUpperCase() + name.slice(1)];
      if (iconData) {
        try {
          const svg = window.lucide.createElement
            ? window.lucide.createElement(iconData)
            : null;
          if (svg) {
            svg.setAttribute('width', size);
            svg.setAttribute('height', size);
            svg.setAttribute('stroke', color);
            svg.setAttribute('stroke-width', strokeWidth);
            ref.current.appendChild(svg);
          }
        } catch (e) {
          // fall back to text
          ref.current.textContent = '◇';
        }
      }
    }
  }, [name, size, color, strokeWidth]);

  return (
    <span
      ref={ref}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0, ...style }}
      {...rest}
    />
  );
}

window.Icon = Icon;
